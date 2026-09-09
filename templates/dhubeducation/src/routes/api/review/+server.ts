import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { createReview, updateReview, deleteReview } from '$lib/db/crm';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.REVIEW)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const newReview = await createReview(body);
  if (!newReview) return json({ status: 'error', message: 'Failed to create review' }, { status: 500 });
  return json({ status: 'success', data: newReview });
};

export const PATCH: RequestHandler = async ({ request, locals, url }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const id = url.searchParams.get('id');
  if (!id) return json({ status: 'error', message: 'Missing ID' }, { status: 400 });
  const body = await request.json();
  const updated = await updateReview(id, body);
  if (!updated) return json({ status: 'error', message: 'Failed to update review' }, { status: 500 });
  return json({ status: 'success', data: updated });
};

export const DELETE: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const id = url.searchParams.get('id');
  if (!id) return json({ status: 'error', message: 'Missing ID' }, { status: 400 });
  const deleted = await deleteReview(id);
  if (!deleted) return json({ status: 'error', message: 'Failed to delete review' }, { status: 500 });
  return json({ status: 'success', data: deleted });
};
