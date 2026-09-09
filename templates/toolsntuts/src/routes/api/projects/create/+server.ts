import type { RequestHandler } from './$types';
import { createProject, persistBreakdown, updateProjectStatus, createJob, updateJob } from '$lib/db/media-queries';
import { scriptBreakdown } from '$lib/server/windmill';
import { pipelineError } from '$lib/server/errors';
import type { ProjectFormat } from '$lib/db/media';
import { ASPECT_RATIOS } from '$lib/constants/media';

const VALID_FORMATS: ProjectFormat[] = ['narrated_short', 'cinematic', 'music_video', 'ad'];

function event(data: object): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(`data: ${JSON.stringify({ error: 'Unauthorized', done: true })}\n\n`, {
      status: 401, headers: { 'Content-Type': 'text/event-stream' }
    });
  }
  if (locals.user.role !== 'admin' && locals.user.role !== 'superadmin') {
    return new Response(`data: ${JSON.stringify({ error: 'Forbidden', done: true })}\n\n`, {
      status: 403, headers: { 'Content-Type': 'text/event-stream' }
    });
  }

  const formData = await request.formData();
  const title = String(formData.get('title') ?? '').trim();
  const brief = String(formData.get('brief') ?? '').trim();
  const format = String(formData.get('format') ?? 'narrated_short') as ProjectFormat;
  const aspectRatio = String(formData.get('aspectRatio') ?? '16:9');
  const targetDurationSec = parseInt(String(formData.get('targetDurationSec') ?? '45'), 10) || 45;
  const user = locals.user;

  // Validate before touching the DB
  if (brief.length < 10) {
    return new Response(`data: ${JSON.stringify({ error: 'Please describe your idea in a bit more detail.', done: true })}\n\n`, {
      status: 400, headers: { 'Content-Type': 'text/event-stream' }
    });
  }
  if (!VALID_FORMATS.includes(format) || !ASPECT_RATIOS.includes(aspectRatio as never)) {
    return new Response(`data: ${JSON.stringify({ error: 'Invalid format or aspect ratio.', done: true })}\n\n`, {
      status: 400, headers: { 'Content-Type': 'text/event-stream' }
    });
  }

  const stream = new ReadableStream({
    async start(controller) {
      // send() is safe to call even after client disconnects — we catch the error
      const send = (data: object) => {
        try { controller.enqueue(event(data)); } catch { /* client gone — server still runs to completion */ }
      };

      // Persist step to job.output so the poll endpoint can report it
      const setStep = async (jobId: string, step: number, label: string) => {
        send({ step, label, jobId });
        await updateJob(jobId, { output: { step, label } }).catch(() => {});
      };

      let jobId: string | null = null;
      let projectId: string | null = null;

      try {
        // ── Step 1: create project + job immediately so client can poll ──
        const proj = await createProject({
          userId: user.id, title: title || 'Untitled project',
          brief, format, aspectRatio, targetDurationSec
        });
        projectId = proj.id;

        const jobRow = await createJob({
          userId: user.id,
          projectId: proj.id,
          kind: 'script_breakdown',
          provider: 'windmill',
          status: 'running',
          costCredits: 0,
          input: { brief, format, aspectRatio, targetDurationSec },
          output: { step: 1, label: 'Parsing your creative brief' }
        });
        jobId = jobRow.id;

        // First event includes both IDs so client can poll immediately if minimized
        send({ step: 1, label: 'Parsing your creative brief', jobId, projectId });

        // ── Step 2 ──
        await setStep(jobId, 2, 'Reserving your project slot');
        await updateJob(jobId, { startedAt: new Date() } as Parameters<typeof updateJob>[1]).catch(() => {});

        // ── Step 3: the long Windmill call (~20-40s) ──
        await setStep(jobId, 3, 'AI is writing your story');
        let result;
        try {
          result = await scriptBreakdown({ brief, format, targetDurationSec, aspectRatio });
        } catch (e) {
          await updateProjectStatus(proj.id, 'draft');
          const { message } = pipelineError(e, user, 'script_breakdown');
          await updateJob(jobId, { status: 'failed', error: message, finishedAt: new Date() } as Parameters<typeof updateJob>[1]).catch(() => {});
          send({ error: message, done: true, projectId: proj.id, jobId });
          controller.close();
          return;
        }

        if (!result.success || !result.breakdown) {
          await updateProjectStatus(proj.id, 'draft');
          const { message } = pipelineError(result.error, user, 'script_breakdown');
          await updateJob(jobId, { status: 'failed', error: message, finishedAt: new Date() } as Parameters<typeof updateJob>[1]).catch(() => {});
          send({ error: message, done: true, projectId: proj.id, jobId });
          controller.close();
          return;
        }

        // ── Step 4: persist to DB ──
        await setStep(jobId, 4, 'Building your scene structure');
        await persistBreakdown(proj.id, result.breakdown);

        // ── Step 5: done ──
        await updateJob(jobId, {
          status: 'succeeded',
          output: { step: 5, label: 'Launching your studio', done: true, projectId: proj.id },
          finishedAt: new Date()
        } as Parameters<typeof updateJob>[1]).catch(() => {});

        send({ step: 5, label: 'Launching your studio', done: true, projectId: proj.id, jobId });
        controller.close();
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Unexpected error. Please try again.';
        if (jobId) {
          await updateJob(jobId, { status: 'failed', error: message, finishedAt: new Date() } as Parameters<typeof updateJob>[1]).catch(() => {});
        }
        if (projectId) await updateProjectStatus(projectId, 'draft').catch(() => {});
        send({ error: message, done: true, jobId, projectId });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
};
