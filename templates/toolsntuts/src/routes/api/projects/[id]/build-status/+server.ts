import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { job, project } from '$lib/db/media';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/projects/:id/build-status
 * Polls the latest script_breakdown job for this project.
 * Used by the pending-build client state when the SSE stream is disconnected.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const [proj] = await db
    .select({ id: project.id, status: project.status })
    .from(project)
    .where(and(eq(project.id, params.id), eq(project.userId, locals.user.id)))
    .limit(1);

  if (!proj) return json({ ok: false, error: 'Not found' }, { status: 404 });

  // Fast path: already built
  if (proj.status === 'storyboard') {
    return json({ ok: true, done: true, step: 5, label: 'Launching your studio', projectId: proj.id });
  }

  // Find the most recent breakdown job
  const [buildJob] = await db
    .select()
    .from(job)
    .where(and(eq(job.projectId, params.id), eq(job.kind, 'script_breakdown')))
    .orderBy(desc(job.queuedAt))
    .limit(1);

  if (!buildJob) {
    return json({ ok: true, done: false, step: 1, label: 'Starting…' });
  }

  const out = buildJob.output as { step?: number; label?: string; done?: boolean; projectId?: string } | null;

  if (buildJob.status === 'succeeded') {
    return json({ ok: true, done: true, step: 5, label: 'Launching your studio', projectId: proj.id, jobId: buildJob.id });
  }

  if (buildJob.status === 'failed') {
    return json({ ok: true, done: true, failed: true, error: buildJob.error ?? 'Build failed', jobId: buildJob.id });
  }

  return json({
    ok: true,
    done: false,
    step: out?.step ?? 1,
    label: out?.label ?? 'Working…',
    jobId: buildJob.id,
    projectId: proj.id
  });
};
