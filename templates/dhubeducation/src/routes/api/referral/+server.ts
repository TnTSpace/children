import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { createReferral } from '$lib/db/crm';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.REFERRAL)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const result = await createReferral(body);
  if (!result) return json({ status: 'error', message: 'Failed to create referral' }, { status: 500 });
  return json({ status: 'success', data: result });
};
