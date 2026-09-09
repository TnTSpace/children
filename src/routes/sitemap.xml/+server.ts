import { db } from '$lib/db/drizzle';
import { episode } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const episodes = await db
		.select({ id: episode.id, updatedAt: episode.updatedAt })
		.from(episode)
		.where(eq(episode.status, 'published'))
		.orderBy(desc(episode.dayNumber));

	const urls = [
		{ loc: `${url.origin}/`, lastmod: episodes[0]?.updatedAt.toISOString(), priority: '1.0' },
		...episodes.map((ep) => ({
			loc: `${url.origin}/blogs/${ep.id}`,
			lastmod: ep.updatedAt.toISOString(),
			priority: '0.8',
		})),
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
