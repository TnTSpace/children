import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getJob } from '$lib/db/media-queries';

/**
 * Return the current status of a generation job.
 * Generation is now synchronous (done inside the POST /generate endpoint),
 * so this endpoint is primarily used by the frontend to confirm terminal state.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const jobRow = await getJob(params.jobId);
  if (!jobRow || jobRow.userId !== locals.user.id) throw error(404, 'Job not found');

  const output = jobRow.output as Record<string, unknown> | null;

  return json({
    status: jobRow.status,
    output: jobRow.output,
    error: jobRow.error,
    ...(jobRow.status === 'succeeded'
      ? { assetId: output?.assetId, url: output?.url }
      : {})
  });
};
