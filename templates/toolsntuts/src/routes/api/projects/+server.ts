import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProjectsByUser } from '$lib/db/media-queries';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  const projects = await getProjectsByUser(locals.user.id);
  return json({ ok: true, projects: projects.map((p) => ({ id: p.id, title: p.title, status: p.status, format: p.format, aspectRatio: p.aspectRatio })) });
};
