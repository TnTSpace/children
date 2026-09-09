import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getOrCreateAdmission } from '$lib/db/admission';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/auth/login');

	const app = await getOrCreateAdmission(locals.user);
	if (!app) {
		// Should not happen as getOrCreate creates one
		throw redirect(302, '/');
	}

	throw redirect(302, `/application/${app.id}`);
};

export const actions: Actions = {};
