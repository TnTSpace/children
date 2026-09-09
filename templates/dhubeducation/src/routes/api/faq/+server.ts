import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { createFaq } from '$lib/db/crm';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.FAQ)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const newFaq = await createFaq(body);
  if (!newFaq) return json({ status: 'error', message: 'Failed to create FAQ' }, { status: 500 });
  return json({ status: 'success', data: newFaq });
};
