import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProject, persistBreakdown, updateProjectStatus } from '$lib/db/media-queries';
import { scriptBreakdown } from '$lib/server/windmill';
import { pipelineError } from '$lib/server/errors';

/** Re-run the pre-production breakdown for a project (clears any existing one). */
export const POST: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const proj = await getProject(params.id, locals.user.id);
  if (!proj) throw error(404, 'Project not found');
  if (!proj.brief) throw error(400, 'This project has no brief to work from.');

  await updateProjectStatus(proj.id, 'scripting');
  try {
    const result = await scriptBreakdown({
      brief: proj.brief,
      format: proj.format,
      targetDurationSec: proj.targetDurationSec ?? 45,
      aspectRatio: proj.aspectRatio
    });
    if (!result.success || !result.breakdown) {
      await updateProjectStatus(proj.id, 'draft');
      const { status, message } = pipelineError(result.error, locals.user, 'retry_breakdown');
      throw error(status, message);
    }
    await persistBreakdown(proj.id, result.breakdown);
    return json({ ok: true });
  } catch (e) {
    if (e && typeof e === 'object' && 'status' in e) throw e; // re-throw SvelteKit error (already classified)
    await updateProjectStatus(proj.id, 'draft');
    const { status, message } = pipelineError(e, locals.user, 'retry_breakdown');
    throw error(status, message);
  }
};
