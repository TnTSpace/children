import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteProject, renameProject } from '$lib/db/media-queries';

/** Delete a project. */
export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const ok = await deleteProject(params.id, locals.user.id);
  if (!ok) throw error(404, 'Project not found');
  return json({ deleted: true });
};

/** Rename a project. Body: { title }. */
export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  const body = await request.json().catch(() => ({}) as Record<string, unknown>);
  const title = String(body.title ?? '').trim();
  if (!title) throw error(400, 'Title is required');
  const ok = await renameProject(params.id, locals.user.id, title);
  if (!ok) throw error(404, 'Project not found');
  return json({ renamed: true, title });
};
