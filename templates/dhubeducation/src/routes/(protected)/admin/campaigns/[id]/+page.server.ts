import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCampaign } from '$lib/db/crm';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const campaignData = await getCampaign(params.id);

	if (!campaignData) {
		throw error(404, 'Campaign not found');
	}

	return {
		campaign: campaignData
	};
};
