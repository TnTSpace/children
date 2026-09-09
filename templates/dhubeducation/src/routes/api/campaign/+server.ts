import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { createCampaign } from '$lib/db/crm';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.CAMPAIGN)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  const body = await request.json();
  const newCampaign = await createCampaign(body);
  if (!newCampaign) return json({ status: 'error', message: 'Failed to create campaign' }, { status: 500 });
  return json({ status: 'success', data: newCampaign });
};
