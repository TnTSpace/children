/**
 * SEO helpers shared by the public pages and the sitemap.
 *
 * Two audiences are served here:
 *  - classic search: canonical keyword-bearing URLs, clean metadata, sitemap
 *  - answer engines (AI Overviews, ChatGPT, Perplexity): schema.org structured
 *    data, an explicit answer snippet, and machine-readable FAQs
 */
import { SiteMeta } from '$lib/constants';

export const SITE_URL = SiteMeta.link.replace(/\/$/, '');

export const absoluteUrl = (path: string): string =>
	/^https?:\/\//i.test(path) ? path : `${SITE_URL}${path.startsWith('/') ? '' : '/'}${path}`;

/** SEO metadata the blog generator embeds in the article HTML. */
export interface BlogSeo {
	primaryKeyword?: string;
	secondaryKeywords?: string[];
	metaTitle?: string;
	metaDescription?: string;
	answerSnippet?: string;
	sources?: { title: string; url: string }[];
}

export interface FaqItem {
	question: string;
	answer: string;
}

// ---------------------------------------------------------------------------
// URLs
// ---------------------------------------------------------------------------

export function slugify(input: string, max = 70): string {
	return (
		(input || '')
			.normalize('NFKD')
			.replace(/[̀-ͯ]/g, '') // strip combining diacritics
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, max)
			.replace(/-+$/g, '') || 'post'
	);
}

/**
 * Keyword-bearing path for a post: `/blogs/<slug>--<id>`.
 *
 * The id is kept as a suffix so the route stays resolvable without a slug
 * column, and every previously published `/blogs/<id>` link keeps working.
 */
export function blogPath(post: { id: string; title?: string | null }): string {
	if (!post?.id) return '/blogs';
	const slug = slugify(post.title ?? '');
	return `/blogs/${slug}--${post.id}`;
}

export const blogUrl = (post: { id: string; title?: string | null }): string =>
	absoluteUrl(blogPath(post));

/** Recover the record id from either `<slug>--<id>` or a bare `<id>`. */
export function resolveBlogId(param: string): string {
	const marker = param.lastIndexOf('--');
	return marker === -1 ? param : param.slice(marker + 2);
}

// ---------------------------------------------------------------------------
// Content parsing
// ---------------------------------------------------------------------------

const SEO_COMMENT = /<!--\s*dhub-seo\s*([\s\S]*?)-->/;

/**
 * The generator writes its SEO metadata into an HTML comment at the top of the
 * article, which keeps everything in the existing `content` column and renders
 * as nothing. Returns the parsed metadata and the content with the block removed.
 */
export function extractSeo(content: string | null | undefined): {
	seo: BlogSeo | null;
	content: string;
} {
	if (!content) return { seo: null, content: '' };
	const match = content.match(SEO_COMMENT);
	if (!match) return { seo: null, content };
	try {
		return { seo: JSON.parse(match[1]) as BlogSeo, content: content.replace(SEO_COMMENT, '').trim() };
	} catch {
		return { seo: null, content: content.replace(SEO_COMMENT, '').trim() };
	}
}

/** Pull the FAQ pairs the generator marks up, for FAQPage structured data. */
export function extractFaq(content: string | null | undefined): FaqItem[] {
	if (!content) return [];
	const items: FaqItem[] = [];
	// Each item is emitted as a single flat block, so a non-greedy match on the
	// answer's closing tag is unambiguous.
	for (const chunk of content.split('data-faq-item').slice(1)) {
		const q = chunk.match(/<h3[^>]*data-faq-q[^>]*>([\s\S]*?)<\/h3>/);
		const a = chunk.match(/<div[^>]*data-faq-a[^>]*>([\s\S]*?)<\/div>/);
		if (!q || !a) continue;
		const question = stripHtml(q[1]);
		const answer = stripHtml(a[1]);
		if (question && answer) items.push({ question, answer });
	}
	return items;
}

export function stripHtml(html: string): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/\s+/g, ' ')
		.trim();
}

export const wordCount = (html: string | null | undefined): number =>
	html ? stripHtml(html).split(/\s+/).filter(Boolean).length : 0;

/** Rounded up, minimum 1 — used for the visible byline and for Article schema. */
export const readingMinutes = (html: string | null | undefined): number =>
	Math.max(1, Math.round(wordCount(html) / 225));

/** Trim to a length search engines will actually display, on a word boundary. */
export function clamp(text: string, max: number): string {
	const clean = stripHtml(text ?? '');
	if (clean.length <= max) return clean;
	return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------

type BlogLike = {
	id: string;
	title: string;
	description: string;
	content?: string | null;
	category?: string | null;
	imageUrl?: string | null;
	createdAt: string | Date;
	updatedAt?: string | Date | null;
};

const iso = (d: string | Date | null | undefined): string | undefined =>
	d ? new Date(d).toISOString() : undefined;

export const organization = () => ({
	'@type': 'Organization',
	'@id': `${SITE_URL}/#organization`,
	name: 'Dhub Education',
	url: SITE_URL,
	logo: { '@type': 'ImageObject', url: absoluteUrl(SiteMeta.ogimage) },
	description: SiteMeta.description,
	areaServed: 'NG',
	knowsAbout: [
		'study abroad',
		'international student admissions',
		'UK student visas',
		'university applications',
		'education consultancy'
	]
});

export function articleJsonLd(post: BlogLike, seo: BlogSeo | null, faq: FaqItem[]) {
	const url = blogUrl(post);
	const keywords = [seo?.primaryKeyword, ...(seo?.secondaryKeywords ?? [])].filter(Boolean);

	return {
		'@type': 'BlogPosting',
		'@id': `${url}#article`,
		headline: clamp(seo?.metaTitle || post.title, 110),
		alternativeHeadline: post.title,
		description: seo?.metaDescription || post.description,
		image: post.imageUrl ? [post.imageUrl] : undefined,
		datePublished: iso(post.createdAt),
		dateModified: iso(post.updatedAt) ?? iso(post.createdAt),
		author: organization(),
		publisher: organization(),
		mainEntityOfPage: { '@type': 'WebPage', '@id': url },
		articleSection: post.category ?? undefined,
		keywords: keywords.length ? keywords.join(', ') : undefined,
		wordCount: wordCount(post.content) || undefined,
		timeRequired: `PT${readingMinutes(post.content)}M`,
		inLanguage: 'en-GB',
		isAccessibleForFree: true,
		// Gives answer engines a pre-written, quotable summary of the page.
		abstract: seo?.answerSnippet || undefined,
		citation: seo?.sources?.length
			? seo.sources.slice(0, 10).map((s) => ({
					'@type': 'CreativeWork',
					name: s.title,
					url: s.url
				}))
			: undefined,
		mainEntity: faq.length
			? {
					'@type': 'FAQPage',
					mainEntity: faq.map((f) => ({
						'@type': 'Question',
						name: f.question,
						acceptedAnswer: { '@type': 'Answer', text: f.answer }
					}))
				}
			: undefined
	};
}

export const faqJsonLd = (faq: FaqItem[]) => ({
	'@type': 'FAQPage',
	mainEntity: faq.map((f) => ({
		'@type': 'Question',
		name: f.question,
		acceptedAnswer: { '@type': 'Answer', text: f.answer }
	}))
});

export const breadcrumbJsonLd = (trail: { name: string; url: string }[]) => ({
	'@type': 'BreadcrumbList',
	itemListElement: trail.map((item, i) => ({
		'@type': 'ListItem',
		position: i + 1,
		name: item.name,
		item: absoluteUrl(item.url)
	}))
});

/** Wrap graph nodes into a single @graph document, dropping undefined values. */
export function jsonLdDocument(...nodes: Record<string, unknown>[]): string {
	return JSON.stringify(
		{ '@context': 'https://schema.org', '@graph': nodes.filter(Boolean) },
		(_key, value) => (value === undefined ? undefined : value)
	).replace(/</g, '\\u003c');
}
