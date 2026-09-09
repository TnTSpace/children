<script lang="ts">
  import { Search, ArrowUpDown, X, Loader2, BookOpen } from '@lucide/svelte';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import * as Select from '$lib/components/ui/select/index.js';
  import BlogCard from '$lib/components/widgets/BlogCard.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { browser } from '$app/environment';
  import { Debounced } from 'runed';
  import { MAX_ITEMS_PER_PAGE, SiteMeta } from '$lib/constants';
  import type { iFetchMeta } from '$lib/interface';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  type EpisodeCard = PageData['initialEpisodes'][number];

  const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest first' },
    { value: 'oldest', label: 'Oldest first' },
    { value: 'title', label: 'Title, A–Z' }
  ];

  let episodes = $state<EpisodeCard[]>(data.initialEpisodes);
  let total = $state(data.total);
  let hasMore = $state(data.hasMore);
  let loading = $state(false);
  let loadingMore = $state(false);

  let searchInput = $state('');
  const debouncedSearch = new Debounced(() => searchInput, 400);

  let sort = $state<'newest' | 'oldest' | 'title'>('newest');
  let category = $state<string | undefined>(undefined);
  const sortLabel = $derived(SORT_OPTIONS.find((o) => o.value === sort)?.label ?? 'Sort');

  let sentinel: HTMLDivElement | undefined = $state();
  let isFirstRun = true;

  async function fetchPage(offset: number): Promise<iFetchMeta> {
    const url = new URL('/api/episodes', window.location.origin);
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('sort', sort);
    if (debouncedSearch.current) url.searchParams.set('search', debouncedSearch.current);
    if (category) url.searchParams.set('category', category);
    const res = await fetch(url);
    return res.json();
  }

  async function resetAndFetch() {
    loading = true;
    try {
      const result = await fetchPage(0);
      episodes = result.data as EpisodeCard[];
      total = result.total;
      hasMore = result.meta.more;
    } finally {
      loading = false;
    }
  }

  async function loadMore() {
    if (loading || loadingMore || !hasMore) return;
    loadingMore = true;
    try {
      const result = await fetchPage(episodes.length);
      episodes = [...episodes, ...(result.data as EpisodeCard[])];
      hasMore = result.meta.more;
    } finally {
      loadingMore = false;
    }
  }

  $effect(() => {
    // Track the filter/sort/search deps explicitly so this reruns on change.
    void debouncedSearch.current;
    void sort;
    void category;
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }
    resetAndFetch();
  });

  $effect(() => {
    if (!browser || !sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  });

  function clearFilters() {
    searchInput = '';
    category = undefined;
    sort = 'newest';
  }

  const hasActiveFilters = $derived(!!searchInput || !!category || sort !== 'newest');
</script>

<Seo
  title="All Stories — Tools n Tuts Kids"
  description="Every illustrated true-to-life story published so far — {data.total} and counting. Search, sort, and browse the full archive."
/>

<!-- Header -->
<section class="relative isolate overflow-hidden border-b bg-zinc-950 py-20 sm:py-28">
  <div class="absolute top-0 left-1/4 -z-10 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-[120px]"></div>
  <div class="absolute right-1/4 bottom-0 -z-10 h-72 w-72 animate-pulse rounded-full bg-amber-500/15 blur-[100px] [animation-delay:1.5s]"></div>
  <div class="center px-4 text-center">
    <div class="mb-5 inline-flex animate-in items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm fade-in slide-in-from-top-4 duration-700">
      <BookOpen class="h-3.5 w-3.5 text-primary" />
      {total} illustrated {total === 1 ? 'story' : 'stories'}, and counting
    </div>
    <h1 class="mb-4 animate-in text-balance text-4xl font-bold tracking-tight text-white fade-in slide-in-from-bottom-6 duration-700 sm:text-5xl">
      Every story, all in one place
    </h1>
    <p class="mx-auto max-w-xl animate-in text-lg text-white/70 fade-in slide-in-from-bottom-6 duration-700 [animation-delay:100ms]">
      Search a scripture, browse a theme, or just scroll — the whole archive lives here.
    </p>
  </div>
</section>

<!-- Toolbar -->
<section class="sticky top-16 z-30 border-b bg-background/95 py-4 backdrop-blur-md supports-backdrop-filter:bg-background/80">
  <div class="center flex flex-col gap-3 px-4 sm:flex-row sm:items-center">
    <div class="relative flex-1">
      <Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input bind:value={searchInput} placeholder="Search title, scripture, or theme…" class="pl-10" />
    </div>

    <div class="flex gap-3">
      <Select.Root type="single" bind:value={category}>
        <Select.Trigger class="w-[180px]">
          <span data-slot="select-value" class="truncate">{category || 'All themes'}</span>
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="">All themes</Select.Item>
          {#each data.categories as c (c)}
            <Select.Item value={c}>{c}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root type="single" bind:value={sort}>
        <Select.Trigger class="w-[170px]">
          <ArrowUpDown class="mr-1.5 size-3.5 shrink-0" />
          <span data-slot="select-value" class="truncate">{sortLabel}</span>
        </Select.Trigger>
        <Select.Content>
          {#each SORT_OPTIONS as o (o.value)}
            <Select.Item value={o.value}>{o.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      {#if hasActiveFilters}
        <Button variant="ghost" size="icon" onclick={clearFilters} aria-label="Clear filters">
          <X class="size-4" />
        </Button>
      {/if}
    </div>
  </div>
</section>

<!-- Results -->
<section class="py-14">
  <div class="center px-4">
    {#if loading}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each Array(8) as _, i (i)}
          <div class="aspect-[4/5] animate-pulse rounded-2xl border bg-muted/50"></div>
        {/each}
      </div>
    {:else if episodes.length === 0}
      <div class="mx-auto max-w-md py-20 text-center">
        <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <Search class="size-6 text-muted-foreground" />
        </div>
        <h2 class="mb-2 text-xl font-bold">No stories match that</h2>
        <p class="mb-6 text-sm text-muted-foreground">Try a different search term, or clear your filters to see everything.</p>
        <Button variant="outline" onclick={clearFilters}>Clear filters</Button>
      </div>
    {:else}
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {#each episodes as ep, i (ep.id)}
          <div class="animate-in fade-in slide-in-from-bottom-4 duration-500" style="animation-delay: {Math.min(i % MAX_ITEMS_PER_PAGE, 8) * 60}ms">
            <BlogCard episode={ep} class="h-full" />
          </div>
        {/each}
      </div>

      <div bind:this={sentinel} class="mt-10 flex justify-center">
        {#if loadingMore}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 class="size-4 animate-spin" /> Loading more stories…
          </div>
        {:else if !hasMore}
          <p class="text-sm text-muted-foreground">You've reached the beginning of the archive.</p>
        {/if}
      </div>
    {/if}
  </div>
</section>
