import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateBlog, deleteBlog, getBlog } from '$lib/db/crm';

export const GET: RequestHandler = async ({ params }) => {
  const item = await getBlog(params.id);
  if (!item) return json({ status: 'error', message: 'Not found' }, { status: 404 });
  return json({ status: 'success', data: item });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const updated = await updateBlog(params.id, body);
  if (!updated) return json({ status: 'error', message: 'Failed to update' }, { status: 500 });
  return json({ status: 'success', data: updated });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const deleted = await deleteBlog(params.id);
  if (!deleted) return json({ status: 'error', message: 'Failed to delete' }, { status: 500 });
  return json({ status: 'success', data: deleted });
};
