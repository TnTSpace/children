import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReview, updateReview, deleteReview } from '$lib/db/crm';

export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const result = await getReview(params.id);
  if (!result) return json({ status: 'error', message: 'Review not found' }, { status: 404 });
  return json({ status: 'success', data: result });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const updated = await updateReview(params.id, body);
  if (!updated) return json({ status: 'error', message: 'Failed to update' }, { status: 500 });
  return json({ status: 'success', data: updated });
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const deleted = await deleteReview(params.id);
  if (!deleted) return json({ status: 'error', message: 'Failed to delete' }, { status: 500 });
  return json({ status: 'success', data: deleted });
};
