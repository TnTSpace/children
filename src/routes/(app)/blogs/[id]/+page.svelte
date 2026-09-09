<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { ArrowLeft, ArrowRight, Home, Sparkles } from '@lucide/svelte';
  import StoryBeat from '$lib/components/widgets/StoryBeat.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { page } from '$app/state';
  import { SiteMeta } from '$lib/constants';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const ep = $derived(data.episode);
  const prev = $derived(data.prev);
  const next = $derived(data.next);

  const articleJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: ep.title,
    description: ep.description,
    image: ep.coverImageUrl ?? undefined,
    datePublished: ep.createdAt,
    dateModified: ep.updatedAt,
    articleSection: ep.category,
    ...(ep.scriptureRef ? { about: ep.scriptureRef } : {}),
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${page.url.origin}/blogs/${ep.id}` },
    author: { '@type': 'Organization', name: SiteMeta.title },
    publisher: {
      '@type': 'Organization',
      name: SiteMeta.title,
      logo: { '@type': 'ImageObject', url: `${page.url.origin}/apple-touch-icon.png` },
    },
  });
</script>

<Seo
  title="{ep.title} — Tools n Tuts Kids"
  description={ep.description}
  image={ep.coverImageUrl}
  type="article"
  publishedTime={ep.createdAt}
  modifiedTime={ep.updatedAt}
  jsonLd={articleJsonLd}
/>

<!-- Banner -->
<section class="relative bg-background">
  <div class="absolute top-4 left-4 z-20 print:hidden sm:top-6 sm:left-6">
    <Button href="/#today" variant="ghost" class="group rounded-xl bg-background/80 text-foreground backdrop-blur-sm hover:bg-background">
      <ArrowLeft class="mr-2 size-4 transition-transform group-hover:-translate-x-1" /> Back to Home
    </Button>
  </div>

  <div class="aspect-video w-full overflow-hidden bg-muted">
    {#if ep.coverImageUrl}
      <img src={ep.coverImageUrl} alt={ep.title} class="size-full animate-in object-cover fade-in zoom-in-95 duration-700" />
    {/if}
  </div>
</section>

<!-- Header -->
<section class="border-b bg-background">
  <div class="center px-4 py-8 md:py-12">
    <div class="mx-auto max-w-3xl">
      <Badge variant="outline" class="mb-4 border-primary/20 bg-primary/5 text-primary uppercase">{ep.category} · Day {ep.dayNumber}</Badge>
      <h1 class="mb-4 text-3xl leading-tight font-bold sm:text-4xl md:text-5xl">{ep.title}</h1>
      {#if ep.description}
        <p class="mb-2 max-w-2xl text-lg font-medium text-muted-foreground">{ep.description}</p>
      {/if}
      {#if ep.scriptureRef}
        <p class="text-sm text-muted-foreground">{ep.scriptureRef} (NKJV)</p>
      {/if}
    </div>
  </div>
</section>

<!-- Reader -->
<section class="py-12 md:py-16">
  <div class="center px-4">
    <div class="grid grid-cols-1 items-start gap-12 print:block lg:grid-cols-12 lg:gap-16">
      <!-- Main column -->
      <div class="lg:col-span-8 print:w-full">
        <h2 class="mb-6 text-xs font-bold tracking-widest text-muted-foreground uppercase">The Story, Illustrated</h2>
        <div class="space-y-12">
          {#each ep.panels as p, i (p.id)}
            <StoryBeat
              index={i}
              heading={p.heading}
              prose={p.prose}
              imageUrl={p.imageUrl}
              caption={p.caption}
              fallbackAlt={ep.title}
            />
          {/each}
        </div>

        {#if ep.moral}
          <Card class="mt-10 border-primary/20 bg-primary/5 print:break-inside-avoid">
            <CardContent class="pt-6">
              <p class="text-center text-base leading-relaxed text-foreground/90 italic">"{ep.moral}"</p>
            </CardContent>
          </Card>
        {/if}

        <!-- Story navigation -->
        <div class="mt-10 flex items-center justify-between gap-3 border-t pt-8 print:hidden">
          <Button
            href={prev ? `/blogs/${prev.id}` : undefined}
            disabled={!prev}
            variant="outline"
            class="min-w-0 flex-1 justify-start sm:flex-none"
          >
            <ArrowLeft class="mr-2 size-4 shrink-0" />
            <span class="truncate">{prev ? `Day ${prev.dayNumber}` : 'Previous'}</span>
          </Button>
          <Button href="/blogs" variant="ghost" class="shrink-0">All Blogs</Button>
          <Button
            href={next ? `/blogs/${next.id}` : undefined}
            disabled={!next}
            variant="outline"
            class="min-w-0 flex-1 justify-end sm:flex-none"
          >
            <span class="truncate">{next ? `Day ${next.dayNumber}` : 'Next'}</span>
            <ArrowRight class="ml-2 size-4 shrink-0" />
          </Button>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="space-y-6 print:hidden lg:sticky lg:top-24 lg:col-span-4">
        <Card class="relative overflow-hidden border-border bg-muted/20">
          <div class="absolute -top-12 -right-12 size-32 rounded-full bg-primary/5 blur-3xl"></div>
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-base">
              <Sparkles class="size-4 text-primary" /> Come back tomorrow
            </CardTitle>
            <CardDescription>A new true-to-life story, illustrated, every day.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button href="/" variant="outline" class="w-full">
              <Home class="mr-2 size-4" /> Back to Today's Story
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-base">This Story</CardTitle>
          </CardHeader>
          <CardContent class="space-y-2 text-sm text-muted-foreground">
            {#if ep.scriptureRef}
              <p><span class="font-semibold text-foreground">Scripture:</span> {ep.scriptureRef} (NKJV)</p>
            {/if}
            <p><span class="font-semibold text-foreground">Theme:</span> {ep.category}</p>
            <p><span class="font-semibold text-foreground">Day:</span> {ep.dayNumber}</p>
          </CardContent>
        </Card>
      </aside>
    </div>
  </div>
</section>
