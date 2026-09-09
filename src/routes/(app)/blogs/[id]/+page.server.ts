import { db } from '$lib/db/drizzle';
import { episode, panel } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { getAdjacentEpisodes } from '$lib/db/episode';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const [ep] = await db.select().from(episode).where(eq(episode.id, params.id));
	if (!ep) error(404, 'Story not found');

	const panels = await db
		.select()
		.from(panel)
		.where(eq(panel.episodeId, ep.id))
		.orderBy(panel.position);

	const { prev, next } = await getAdjacentEpisodes(ep.dayNumber);

	return {
		prev,
		next,
		episode: {
			id: ep.id,
			dayNumber: ep.dayNumber,
			category: ep.category,
			title: ep.title,
			description: ep.description,
			scriptureRef: ep.scriptureRef,
			moral: ep.moral,
			coverImageUrl: ep.coverImageUrl,
			createdAt: ep.createdAt.toISOString(),
			updatedAt: ep.updatedAt.toISOString(),
			panels: panels.map((p) => ({
				id: p.id,
				position: p.position,
				heading: p.heading,
				prose: p.prose,
				caption: p.caption,
				imageUrl: p.imageUrl
			}))
		}
	};
}) satisfies PageServerLoad;
