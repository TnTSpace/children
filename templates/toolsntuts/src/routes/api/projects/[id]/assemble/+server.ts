import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import {
  getProjectWorkspace,
  createAsset,
  createRender,
  countRenders,
  updateProjectStatus
} from '$lib/db/media-queries';
import {
  getPresignedUploadUrlHttps,
  getDirectObjectUrl
} from '$lib/server/minio';
import { submitJobAsync, pollWindmillJob } from '$lib/server/windmill';

/**
 * Stitch a project's shot videos into one final mp4 with narration mixed in.
 *
 * The ffmpeg work runs inside a Windmill job (f/toolsntuts/assemble_clips)
 * so the SvelteKit server is never blocked by a long encode. Presigned MinIO
 * URLs give Windmill read access to each clip/voice and write access to the
 * final render object — no MinIO credentials are forwarded.
 *
 * SSE stages emitted to the client:
 *   gathering  → collecting clip metadata
 *   stitching  → Windmill encode in progress (fake pct until done)
 *   uploading  → final file write acknowledged
 *   completed  → url, assetId, clips, durationSec
 *   failed     → error
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const ws = await getProjectWorkspace(params.id, locals.user.id);
  if (!ws) return new Response('Not found', { status: 404 });

  const assetById = new Map(ws.assets.map((a) => [a.id, a]));
  const clips = ws.shots
    .filter((s) => s.videoAssetId && assetById.get(s.videoAssetId as string))
    .map((s) => ({
      shot: s,
      video: assetById.get(s.videoAssetId as string)!,
      voice: s.voiceAssetId ? assetById.get(s.voiceAssetId) ?? null : null
    }));

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const send = (d: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`));
        } catch {
          closed = true;
        }
      };
      const close = () => {
        if (!closed) {
          closed = true;
          try { controller.close(); } catch { /* noop */ }
        }
      };

      try {
        if (clips.length === 0) {
          send({ stage: 'failed', error: 'No shot videos to stitch yet — generate the videos first.' });
          return close();
        }

        send({ stage: 'gathering', total: clips.length });

        // Use the asset's stored URL directly — avoids a MinIO round-trip for each clip.
        // External-bucket assets (MinIO was unreachable during ingest) store the CDN URL in `url`.
        // MinIO-stored assets store the direct public HTTPS URL in `url`.
        // Windmill can reach both via the public internet or internal Docker network.
        const clipData = clips.map((c) => ({
          video_url: c.video.url,
          voice_url: c.voice?.url ?? null,
          duration_sec: c.shot.durationSec || 5
        }));

        // Windmill worker is on dokploy-network — give it the internal presigned PUT URL
        // (http://minio:9000/...) so it talks directly without going through Traefik.
        const renderKey = `projects/${ws.project.id}/render/${crypto.randomUUID()}.mp4`;
        const putUrl = await getInternalPresignedUploadUrl(env.MINIO_BUCKET, renderKey, 3600);

        send({ stage: 'stitching', progress: 0 });

        const jobId = await submitJobAsync('f/toolsntuts/assemble_clips', {
          clips: clipData,
          put_url: putUrl,
          aspect_ratio: ws.project.aspectRatio,
          fps: ws.project.fps || 30
        });

        // Poll the Windmill job every 3 s; emit fake progress in the meantime
        let fakePct = 0;
        for (;;) {
          await new Promise<void>((r) => setTimeout(r, 3000));
          if (closed) return;

          const status = await pollWindmillJob(jobId);

          if (!status.completed) {
            fakePct = Math.min(92, fakePct + 3);
            send({ stage: 'stitching', progress: fakePct });
            continue;
          }

          if (!status.success) {
            const msg =
              typeof status.error === 'string'
                ? status.error
                : 'Assembly failed in Windmill — check the job logs.';
            send({ stage: 'failed', error: msg });
            return close();
          }

          const wmResult = status.result as {
            ok: boolean;
            duration_sec: number;
            size_bytes: number;
          } | null;

          if (!wmResult?.ok) {
            send({ stage: 'failed', error: 'Windmill assembly completed but returned no video.' });
            return close();
          }

          send({ stage: 'stitching', progress: 100 });
          send({ stage: 'uploading', loaded: wmResult.size_bytes, total: wmResult.size_bytes });

          // The render is now at renderKey in MinIO — create records
          const directUrl = getDirectObjectUrl(env.MINIO_BUCKET, renderKey);
          const assetRow = await createAsset({
            projectId: ws.project.id,
            kind: 'video',
            bucket: env.MINIO_BUCKET,
            objectKey: renderKey,
            url: directUrl,
            mimeType: 'video/mp4',
            sizeBytes: wmResult.size_bytes,
            durationSec: wmResult.duration_sec,
            meta: {
              role: 'final_render',
              clips: clips.length,
              narrated: clips.some((c) => c.voice)
            }
          });

          const version = (await countRenders(ws.project.id)) + 1;
          await createRender({
            projectId: ws.project.id,
            version,
            outputAssetId: assetRow.id,
            durationMs: Math.round(wmResult.duration_sec * 1000)
          });
          await updateProjectStatus(ws.project.id, 'ready');

          send({
            stage: 'completed',
            url: assetRow.url,
            assetId: assetRow.id,
            clips: clips.length,
            durationSec: wmResult.duration_sec
          });
          close();
          break;
        }
      } catch (e) {
        console.error('[assemble]', e);
        send({ stage: 'failed', error: 'Could not stitch the videos. Please try again.' });
        close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
};
