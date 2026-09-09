import type { RequestHandler } from './$types';
import { getJob } from '$lib/db/media-queries';

/**
 * Server-Sent Events endpoint for job status.
 * Generation is now synchronous (completed inside POST /generate), so this
 * stream immediately emits the current terminal state and closes.
 * Kept for frontend compatibility — clients that open EventSource get a
 * single event and a clean close rather than a hanging connection.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const job = await getJob(params.jobId);
  if (!job || job.userId !== locals.user.id) return new Response('Not found', { status: 404 });

  const encoder = new TextEncoder();
  const output = job.output as Record<string, unknown> | null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch { /* closed */ }
      };

      if (job.status === 'succeeded') {
        send({ stage: 'completed', already: true, assetId: output?.assetId, url: output?.url, output: job.output });
      } else if (job.status === 'failed') {
        send({ stage: 'failed', error: job.error || 'Generation failed' });
      } else {
        // Job is still in-flight (should not happen with synchronous generation)
        send({ stage: job.status, message: 'Generation in progress' });
      }

      try { controller.close(); } catch { /* already closed */ }
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
