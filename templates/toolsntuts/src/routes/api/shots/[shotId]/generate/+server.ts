import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import {
  getShot,
  getProject,
  updateShot,
  createJob,
  updateJob,
  getAssetsByIds,
  debitCredits,
  creditCredits,
  InsufficientCreditsError
} from '$lib/db/media-queries';
import { wavespeedRun, WaveSpeedCreditError } from '$lib/server/wavespeedai';
import { ingestUrlToAsset } from '$lib/server/ingest';
import { pipelineError } from '$lib/server/errors';
import { MODELS, modelCredits, DEFAULT_IMAGE_MODEL, DEFAULT_VIDEO_MODEL } from '$lib/constants/media';

/**
 * Generate a storyboard image.
 * Primary: WaveSpeed direct API. Fallback: WAVESPEED_N8N_WEBHOOK.
 * Storyboard must never fail — if WaveSpeed errors (e.g. credit exhaustion),
 * the n8n webhook is tried automatically.
 */
async function resolveImage(
  wsModel: string,
  input: Record<string, unknown>,
  shotId: string,
  projectId: string
): Promise<{ url: string; wavespeedUsd: number }> {
  try {
    const urls = await wavespeedRun(wsModel, input);
    if (urls.length > 0 && urls[0]) return { url: urls[0], wavespeedUsd: 0 };
    throw new Error('empty outputs');
  } catch {
    const webhook = env.WAVESPEED_N8N_WEBHOOK;
    if (!webhook) throw new Error('WaveSpeed returned no output and WAVESPEED_N8N_WEBHOOK is not configured.');
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, shotId, projectId, type: 'image' })
    });
    if (!res.ok) throw new Error(`n8n image webhook failed: HTTP ${res.status}`);
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    const url =
      (typeof data === 'string' ? data : null) ??
      data?.url ??
      (Array.isArray(data?.outputs) ? (data.outputs as string[])[0] : null) ??
      (Array.isArray(data) ? (data as string[])[0] : null);
    if (!url) throw new Error('n8n webhook returned no URL');
    return { url: url as string, wavespeedUsd: (data?.wavespeed_usd as number) ?? 0 };
  }
}

/**
 * Generate a video clip via WaveSpeed directly (same path as image generation).
 * Uses wavespeedRun() which handles submit + poll + credit-error detection.
 */
async function resolveVideo(
  wsModel: string,
  input: Record<string, unknown>
): Promise<{ url: string; wavespeedUsd: number }> {
  const urls = await wavespeedRun(wsModel, input, { timeoutMs: 360_000, pollMs: 4_000 });
  if (urls.length > 0 && urls[0]) return { url: urls[0], wavespeedUsd: 0 };
  throw new Error('WaveSpeed video generation returned no output URL');
}

/**
 * Start a generation for a shot.
 * Body: { type: 'storyboard' | 'video', modelKey?: string }
 *
 * Admin users bypass the credit system entirely (unlimited generation).
 * For everyone else, credits are debited up-front and refunded on failure.
 *
 * Returns the completed result immediately (synchronous generation).
 * The poll endpoint is available for status checks on in-flight jobs.
 */
export const POST: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const userId = locals.user.id;

  const shot = await getShot(params.shotId);
  if (!shot) throw error(404, 'Shot not found');
  const proj = await getProject(shot.projectId, userId);
  if (!proj) throw error(403, 'Forbidden');

  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const type = body.type === 'video' ? 'video' : 'storyboard';
  const modelKey =
    (body.modelKey as string) || (type === 'video' ? DEFAULT_VIDEO_MODEL : DEFAULT_IMAGE_MODEL);
  const model = MODELS[modelKey];
  if (!model) throw error(400, 'Unknown model');
  if (model.available === false)
    throw error(400, `${model.label} is temporarily unavailable${model.notes ? ` (${model.notes})` : ''}.`);
  if (type === 'video' && model.kind !== 'video') throw error(400, 'Model is not a video model');
  if (type === 'storyboard' && model.kind !== 'image') throw error(400, 'Model is not an image model');

  const cost = modelCredits(modelKey);

  // Resolve keyframe URL (image→video models require an approved storyboard)
  let keyframeUrl: string | undefined;
  if (shot.keyframeAssetId) {
    const [kf] = await getAssetsByIds([shot.keyframeAssetId]);
    keyframeUrl = kf?.url ?? undefined;
  }
  if (model.needsKeyframe && !keyframeUrl) {
    throw error(400, 'Generate a storyboard for this shot first.');
  }

  const input = model.buildInput({
    prompt: shot.prompt,
    aspectRatio: proj.aspectRatio,
    durationSec: shot.durationSec,
    keyframeUrl
  });

  const jobRow = await createJob({
    userId,
    projectId: proj.id,
    shotId: shot.id,
    kind: type === 'video' ? 'shot_video' : 'storyboard_image',
    provider: type === 'video' ? 'windmill' : 'wavespeed',
    modelKey,
    status: 'queued',
    costCredits: cost,
    input
  });

  try {
    await debitCredits({
      userId,
      amount: cost,
      reason: jobRow.kind,
      jobId: jobRow.id,
      projectId: proj.id,
      modelKey
    });
  } catch (e) {
    await updateJob(jobRow.id, { status: 'failed', error: 'insufficient_credits' });
    if (e instanceof InsufficientCreditsError)
      throw error(402, `Not enough credits — need ${e.needed}, you have ${e.have}.`);
    throw e;
  }

  await updateJob(jobRow.id, { status: 'polling', startedAt: new Date() });
  await updateShot(shot.id, { status: type === 'video' ? 'generating' : 'queued', modelKey });

  // Generate — image via WaveSpeed (n8n fallback), video always via Windmill
  let resultUrl: string;
  let wavespeedUsd = 0;
  try {
    if (type === 'video') {
      ({ url: resultUrl, wavespeedUsd } = await resolveVideo(model.wsModel, input));
    } else {
      ({ url: resultUrl, wavespeedUsd } = await resolveImage(model.wsModel, input, shot.id, proj.id));
    }
  } catch (e) {
    await creditCredits({
      userId,
      amount: cost,
      reason: 'refund_failed_gen',
      jobId: jobRow.id,
      projectId: proj.id
    });
    await updateJob(jobRow.id, { status: 'failed', error: String(e), finishedAt: new Date() });
    await updateShot(shot.id, { status: 'failed' });

    // Credit exhaustion: signal frontend to stop queuing and assemble what succeeded
    const isCreditError =
      e instanceof WaveSpeedCreditError ||
      (e instanceof Error && e.message === 'wavespeed_credits_exhausted');
    if (isCreditError) {
      return json(
        {
          code: 'wavespeed_credits_exhausted',
          message:
            'WaveSpeed credit balance exhausted. Your generated clips are still available — assembling what completed.'
        },
        { status: 402 }
      );
    }

    const { status, message } = pipelineError(
      String(e),
      locals.user,
      type === 'video' ? 'windmill_video' : 'wavespeed_image'
    );
    throw error(status, message);
  }

  // Ingest result into MinIO and update shot
  const isVideo = type === 'video';
  const assetRow = await ingestUrlToAsset({
    projectId: proj.id,
    kind: isVideo ? 'video' : 'image',
    url: resultUrl,
    jobId: jobRow.id
  });

  if (isVideo) {
    await updateShot(shot.id, { status: 'ready', videoAssetId: assetRow.id });
  } else {
    await updateShot(shot.id, { status: 'storyboard_ready', keyframeAssetId: assetRow.id });
  }

  await updateJob(jobRow.id, {
    status: 'succeeded',
    output: { assetId: assetRow.id, url: assetRow.url ?? '', wavespeedUsd },
    finishedAt: new Date()
  });

  return json({
    jobId: jobRow.id,
    status: 'succeeded',
    assetId: assetRow.id,
    url: assetRow.url,
    kind: isVideo ? 'video' : 'image',
    cost,
    wavespeedUsd
  });
};
