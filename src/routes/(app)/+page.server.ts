import { db } from '$lib/db/drizzle';
import { episode, panel } from '$lib/db/schema';
import { eq, desc, count } from 'drizzle-orm';
import { getCarouselEpisodes } from '$lib/db/episode';
import type { PageServerLoad } from './$types';

export const load = (async () => {
	const [latest] = await db
		.select()
		.from(episode)
		.where(eq(episode.status, 'published'))
		.orderBy(desc(episode.dayNumber))
		.limit(1);

	const [{ publishedEpisodes }] = await db
		.select({ publishedEpisodes: count() })
		.from(episode)
		.where(eq(episode.status, 'published'));
	const [{ illustratedPanels }] = await db.select({ illustratedPanels: count() }).from(panel);

	const categories = await db.selectDistinct({ category: episode.category }).from(episode);
	const carouselEpisodes = await getCarouselEpisodes();

	const stats = {
		publishedEpisodes,
		illustratedPanels,
		categories: categories.length
	};

	if (!latest) {
		return { todayEpisode: null, stats, carouselEpisodes };
	}

	const panels = await db
		.select()
		.from(panel)
		.where(eq(panel.episodeId, latest.id))
		.orderBy(panel.position);

	return {
		todayEpisode: {
			id: latest.id,
			dayNumber: latest.dayNumber,
			category: latest.category,
			title: latest.title,
			description: latest.description,
			scriptureRef: latest.scriptureRef,
			moral: latest.moral,
			coverImageUrl: latest.coverImageUrl,
			panels: panels.map((p) => ({
				id: p.id,
				position: p.position,
				heading: p.heading,
				prose: p.prose,
				caption: p.caption,
				imageUrl: p.imageUrl
			}))
		},
		stats,
		carouselEpisodes
	};
}) satisfies PageServerLoad;
