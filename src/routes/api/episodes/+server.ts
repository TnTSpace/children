import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getEpisodesBySearchFilter } from '$lib/db/episode';

// Deliberately public — no auth gate, unlike /api/users. Stories are the
// site's public content, not an admin-only resource.
export const GET: RequestHandler = async ({ url }) => {
	const params: Record<string, string> = {};
	url.searchParams.forEach((value, key) => { params[key] = value; });
	const result = await getEpisodesBySearchFilter(params);
	return json(result.data);
};
