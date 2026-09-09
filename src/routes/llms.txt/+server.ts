import { db } from '$lib/db/drizzle';
import { episode } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SiteMeta } from '$lib/constants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const recent = await db
		.select({ id: episode.id, title: episode.title, description: episode.description, dayNumber: episode.dayNumber })
		.from(episode)
		.where(eq(episode.status, 'published'))
		.orderBy(desc(episode.dayNumber))
		.limit(30);

	const body = `# ${SiteMeta.title}

> ${SiteMeta.description}

Tools n Tuts Kids publishes one illustrated, true-to-life story every day. Each
story is grounded in real, researched, present-day life in Nigeria — spanning
primary-school children through secondary-school teenagers, young adults and
elders — and draws its lesson from Scripture, quoted directly, pointing the
reader to Jesus Christ. Stories are self-contained (a beginning, a real
complication, and an earned ending) unless explicitly marked as continuing
the next day.

Full site: ${url.origin}/
Sitemap: ${url.origin}/sitemap.xml

## Recent stories

${recent.map((ep) => `- [Day ${ep.dayNumber}: ${ep.title}](${url.origin}/blogs/${ep.id}): ${ep.description}`).join('\n')}
`;

	return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
