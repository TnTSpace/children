import type { RequestHandler } from './$types';
import { getProjectWorkspace, updateShot, debitCredits, InsufficientCreditsError } from '$lib/db/media-queries';
import { ingestBase64ToAsset } from '$lib/server/ingest';
import { ttsGateway } from '$lib/server/windmill';
import { VOICEOVER_CREDITS } from '$lib/constants/media';
import { pipelineError } from '$lib/server/errors';

/**
 * Generate narration audio for every shot that has narration text and no voice
 * yet (ElevenLabs). Streams progress. Credits are charged per successful line.
 * Voice can be pinned via project.settings.voiceId.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const ws = await getProjectWorkspace(params.id, locals.user.id);
  if (!ws) return new Response('Not found', { status: 404 });

  const user = locals.user;
  const voiceId = (ws.project.settings?.voiceId as string) || undefined;
  const todo = ws.shots.filter((s) => (s.narration ?? '').trim().length > 0 && !s.voiceAssetId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (d: unknown) => {
        if (closed) return;
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`)); } catch { closed = true; }
      };
      const close = () => { if (!closed) { closed = true; try { controller.close(); } catch { /* noop */ } } };

      if (todo.length === 0) {
        send({ stage: 'completed', count: 0, already: true });
        return close();
      }

      let count = 0;
      try {
        for (let i = 0; i < todo.length; i++) {
          const shot = todo[i];
          send({ stage: 'voicing', index: i + 1, total: todo.length });

          const tts = await ttsGateway(shot.narration ?? '', voiceId ?? '');
          if (!tts.success || !tts.audioBase64) {
            // Skip this line (don't charge); log for admins.
            console.error(`[voiceover] shot ${shot.id} failed: ${tts.error}`);
            continue;
          }

          const asset = await ingestBase64ToAsset({
            projectId: ws.project.id,
            kind: 'audio_voice',
            base64: tts.audioBase64,
            mimeType: tts.mimeType || 'audio/mpeg',
            meta: { shotId: shot.id, provider: tts.provider, voice: tts.voice, chars: tts.charCount }
          });
          await updateShot(shot.id, { voiceAssetId: asset.id });
          await debitCredits({ userId: user.id, amount: VOICEOVER_CREDITS, reason: 'voiceover', projectId: ws.project.id });
          count++;
        }
        send({ stage: 'completed', count });
        close();
      } catch (e) {
        if (e instanceof InsufficientCreditsError) {
          send({ stage: 'failed', error: 'Not enough credits to finish the narration.' });
        } else {
          const { message } = pipelineError(e, user, 'voiceover');
          send({ stage: 'failed', error: message });
        }
        close();
      }
    }
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' }
  });
};
