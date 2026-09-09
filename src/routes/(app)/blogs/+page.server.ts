import { getFirstEpisodePage, getAllCategories } from '$lib/db/episode';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const [firstPage, categories] = await Promise.all([getFirstEpisodePage(), getAllCategories()]);

	return {
		initialEpisodes: firstPage.data,
		total: firstPage.total,
		hasMore: firstPage.meta.more,
		categories
	};
}) satisfies PageServerLoad;
