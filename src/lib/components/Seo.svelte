<script lang="ts">
  import { page } from '$app/state';
  import { SiteMeta } from '$lib/constants';

  interface Props {
    title: string;
    description: string;
    /** Absolute image URL. Falls back to the site-wide default OG image. */
    image?: string | null;
    type?: 'website' | 'article';
    noindex?: boolean;
    /** ISO datetime strings, only meaningful when type="article". */
    publishedTime?: string | null;
    modifiedTime?: string | null;
    /** Extra structured-data objects to embed as their own JSON-LD scripts. */
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  }

  let { title, description, image = null, type = 'website', noindex = false, publishedTime = null, modifiedTime = null, jsonLd }: Props = $props();

  const canonical = $derived(`${page.url.origin}${page.url.pathname}`);
  const resolvedImage = $derived(image ?? `${page.url.origin}${SiteMeta.ogimage}`);
  const jsonLdBlocks = $derived(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonical} />
  <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

  <meta property="og:site_name" content={SiteMeta.title} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={canonical} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={resolvedImage} />
  {#if type === 'article' && publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if type === 'article' && modifiedTime}
    <meta property="article:modified_time" content={modifiedTime} />
  {/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={canonical} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={resolvedImage} />

  {#each jsonLdBlocks as block, i (i)}
    {@html `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`}
  {/each}
</svelte:head>
