<script lang="ts">
	import { SiteMeta } from '$lib/constants';
	import { absoluteUrl } from '$lib/seo';

	interface Props {
		title?: string;
		description?: string;
		keywords?: string[];
		ogImage?: string | null;
		ogType?: 'website' | 'article';
		ogUrl?: string;
		twitterCard?: 'summary' | 'summary_large_image';
		canonical?: string | null;
		/** Article-only signals; ignored for ogType="website". */
		publishedTime?: string | null;
		modifiedTime?: string | null;
		section?: string | null;
		author?: string;
		/** Keep a page out of the index (search pages, thin pages, staging). */
		noindex?: boolean;
		/** Pre-serialised schema.org JSON-LD, from $lib/seo helpers. */
		jsonLd?: string | null;
	}

	let {
		title = SiteMeta.title,
		description = SiteMeta.description,
		keywords = SiteMeta.keywords,
		ogImage = SiteMeta.ogimage,
		ogType = 'website',
		ogUrl,
		twitterCard = 'summary_large_image',
		canonical,
		publishedTime,
		modifiedTime,
		section,
		author = 'Dhub Education',
		noindex = false,
		jsonLd
	}: Props = $props();

	const displayTitle = $derived(
		title === SiteMeta.title ? title : title.includes('Dhub') ? title : `${title} | Dhub Education`
	);

	// Canonical drives og:url too — a page that does not declare its own canonical
	// used to inherit the site root, which tells Google every page is a duplicate.
	const canonicalUrl = $derived(absoluteUrl(canonical ?? SiteMeta.link));
	const shareUrl = $derived(absoluteUrl(ogUrl ?? canonical ?? SiteMeta.link));
	const shareImage = $derived(absoluteUrl(ogImage || SiteMeta.ogimage));
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{displayTitle}</title>
	<meta name="title" content={displayTitle} />
	<meta name="description" content={description} />
	{#if keywords?.length}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	<link rel="canonical" href={canonicalUrl} />

	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{:else}
		<!-- Allow full-length snippets and large image previews so the page is
		     eligible for rich results and AI Overviews. -->
		<meta
			name="robots"
			content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
		/>
	{/if}

	<!-- Open Graph / Facebook -->
	<meta property="og:site_name" content="Dhub Education" />
	<meta property="og:locale" content="en_GB" />
	<meta property="og:type" content={ogType} />
	<meta property="og:url" content={shareUrl} />
	<meta property="og:title" content={displayTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={shareImage} />
	<meta property="og:image:alt" content={displayTitle} />

	{#if ogType === 'article'}
		{#if publishedTime}<meta property="article:published_time" content={publishedTime} />{/if}
		{#if modifiedTime}<meta property="article:modified_time" content={modifiedTime} />{/if}
		{#if section}<meta property="article:section" content={section} />{/if}
		<meta property="article:publisher" content={SiteMeta.link} />
		<meta name="author" content={author} />
	{/if}

	<!-- Twitter -->
	<meta name="twitter:card" content={twitterCard} />
	<meta name="twitter:url" content={shareUrl} />
	<meta name="twitter:title" content={displayTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={shareImage} />

	{#if jsonLd}
		{@html `<script type="application/ld+json">${jsonLd}</script>`}
	{/if}
</svelte:head>
