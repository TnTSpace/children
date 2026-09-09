import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { createReferee } from '$lib/db/crm';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.REFEREE)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  // Allow authenticated users to add referees (for their own referral program)
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const result = await createReferee(body);
  if (!result) return json({ status: 'error', message: 'Failed to create referee' }, { status: 500 });
  return json({ status: 'success', data: result });
};
