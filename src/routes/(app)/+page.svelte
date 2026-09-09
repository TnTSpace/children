<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Sparkles, ArrowRight, BookOpen, CheckCircle2, Search, Palette, CalendarDays } from '@lucide/svelte';
  import StoryBeat from '$lib/components/widgets/StoryBeat.svelte';
  import BlogCarousel from '$lib/components/widgets/BlogCarousel.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { page } from '$app/state';
  import { SiteMeta } from '$lib/constants';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const ep = $derived(data.todayEpisode);

  const pageTitle = $derived(
    ep ? `${ep.title} — Tools n Tuts Kids` : 'Tools n Tuts Kids — a true-to-life story every day'
  );
  const pageDescription = $derived(ep?.description ?? SiteMeta.description);

  const websiteJsonLd = $derived({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SiteMeta.title,
    description: SiteMeta.description,
    url: page.url.origin,
    ...(ep
      ? {
          mainEntity: {
            '@type': 'BlogPosting',
            headline: ep.title,
            description: ep.description,
            url: `${page.url.origin}/blogs/${ep.id}`,
            image: ep.coverImageUrl ?? undefined,
          },
        }
      : {}),
  });

  const HOW_IT_WORKS = [
    {
      icon: Search,
      title: 'Grounded in what really happened',
      description: 'Every story starts as real, researched occurrences — never invented statistics, never a made-up event passed off as fact.',
      gradient: 'from-amber-500 to-orange-600'
    },
    {
      icon: BookOpen,
      title: 'A present-day story, a biblical heart',
      description: "Not a retelling of an ancient scene — a story set today, that draws its theme and its lesson from Scripture, verse quoted and all.",
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: Palette,
      title: 'Told like a comic, meant to be read',
      description: 'Real prose, sandwiched with real illustration, beat by beat — not a slideshow, a story you actually read.',
      gradient: 'from-emerald-500 to-teal-600'
    },
    {
      icon: CalendarDays,
      title: 'New, every day',
      description: 'One fresh story publishes daily, drawn from a rotating set of biblical values so the ground never gets old.',
      gradient: 'from-rose-500 to-pink-600'
    }
  ];
</script>

<Seo title={pageTitle} description={pageDescription} image={ep?.coverImageUrl} jsonLd={websiteJsonLd} />

<!-- Hero -->
<section id="hero" class="relative isolate flex min-h-[92vh] flex-col items-center justify-center overflow-hidden bg-zinc-950 pt-20 pb-16 sm:pt-24 sm:pb-24">
  {#if ep?.coverImageUrl}
    <img
      src={ep.coverImageUrl}
      alt={ep.title}
      class="absolute inset-0 -z-10 h-full w-full object-cover object-center"
      fetchpriority="high"
    />
  {/if}
  <div class="absolute inset-0 -z-10 bg-linear-to-b from-black/75 via-black/55 to-black/85"></div>
  <div class="absolute inset-0 -z-10 bg-linear-to-r from-black/30 via-transparent to-black/30"></div>
  <div class="absolute top-0 left-1/4 -z-10 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-[120px]"></div>
  <div class="absolute right-1/4 bottom-0 -z-10 h-72 w-72 animate-pulse rounded-full bg-amber-500/15 blur-[100px] [animation-delay:1.5s]"></div>

  <div class="center flex flex-col items-center px-4 text-center">
    <div class="mb-8 inline-flex animate-in items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm fade-in slide-in-from-top-4 duration-700">
      <Sparkles class="h-3.5 w-3.5 text-primary" />
      {ep ? ep.category : 'Tools n Tuts Kids'} — a new true-to-life story every day
    </div>

    <h1 class="mb-6 max-w-4xl animate-in text-balance text-4xl font-bold tracking-tight text-white fade-in slide-in-from-bottom-6 duration-700 [animation-delay:100ms] sm:text-6xl lg:text-7xl">
      Real stories, drawn from real life —
      <span class="bg-linear-to-r from-primary via-blue-400 to-amber-300 bg-clip-text text-transparent">seen, and unseen.</span>
    </h1>

    <p class="mx-auto mb-10 max-w-2xl animate-in text-lg leading-relaxed text-white/75 fade-in slide-in-from-bottom-6 duration-700 [animation-delay:200ms] sm:text-xl">
      {pageDescription}
    </p>

    <div class="flex animate-in flex-col gap-4 fade-in slide-in-from-bottom-6 duration-700 [animation-delay:300ms] sm:flex-row">
      <Button href={ep ? `/blogs/${ep.id}` : '#today'} size="lg" class="h-12 px-8 text-base font-semibold shadow-2xl shadow-primary/40 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary/60">
        Read Today's Story <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
      <Button
        href="#how-it-works"
        variant="outline"
        size="lg"
        class="h-12 border-white/30 bg-white/10 px-8 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/50 hover:bg-white/20"
      >
        <BookOpen class="mr-2 h-4 w-4" /> How it's made
      </Button>
    </div>

    <div class="mt-10 flex animate-in flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/55 fade-in duration-700 [animation-delay:500ms]">
      <span class="flex items-center gap-1.5"><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> Grounded in real, researched occurrences</span>
      <span class="flex items-center gap-1.5"><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> A biblical heart, told in the present day</span>
      <span class="flex items-center gap-1.5"><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> A new story every day</span>
    </div>
  </div>
</section>

<!-- Stats -->
<section class="border-y bg-muted/40 py-10 backdrop-blur-sm dark:bg-zinc-900/60">
  <div class="center">
    <div class="grid grid-cols-2 gap-8 md:grid-cols-3">
      <div class="text-center">
        <div class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{data.stats.publishedEpisodes}</div>
        <div class="mt-1 text-sm font-semibold text-foreground">{data.stats.publishedEpisodes === 1 ? 'Story' : 'Stories'} live</div>
        <div class="text-xs text-muted-foreground">And counting, daily</div>
      </div>
      <div class="text-center">
        <div class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{data.stats.illustratedPanels}</div>
        <div class="mt-1 text-sm font-semibold text-foreground">Illustrated beats</div>
        <div class="text-xs text-muted-foreground">Every one wordless, every one grounded</div>
      </div>
      <div class="col-span-2 text-center md:col-span-1">
        <div class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{data.stats.categories}</div>
        <div class="mt-1 text-sm font-semibold text-foreground">Biblical values in rotation</div>
        <div class="text-xs text-muted-foreground">A different one, every day</div>
      </div>
    </div>
  </div>
</section>

<!-- Today's story -->
<section id="today" class="py-20 lg:py-28">
  <div class="center px-4">
    {#if ep}
      <div class="mx-auto max-w-3xl">
        <div class="mb-12 text-center">
          <Badge variant="secondary" class="mb-4">{ep.category} · Day {ep.dayNumber}</Badge>
          <h2 class="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{ep.title}</h2>
          <p class="mx-auto mb-2 max-w-2xl text-muted-foreground">{ep.description}</p>
          {#if ep.scriptureRef}
            <p class="text-sm font-medium text-primary">{ep.scriptureRef} (NKJV)</p>
          {/if}
        </div>

        <div class="space-y-14">
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
          <Card class="mt-14 border-primary/20 bg-primary/5">
            <CardContent class="pt-6">
              <p class="text-center text-base leading-relaxed text-foreground/90 italic">"{ep.moral}"</p>
            </CardContent>
          </Card>
        {/if}

        <div class="mt-10 text-center">
          <Button href="/blogs/{ep.id}" variant="outline">
            Read the full story <ArrowRight class="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    {:else}
      <div class="mx-auto max-w-lg text-center">
        <Badge variant="secondary" class="mb-4">Coming soon</Badge>
        <h2 class="mb-3 text-3xl font-bold tracking-tight">The first story is on its way</h2>
        <p class="text-muted-foreground">Check back shortly — it's being written and illustrated right now.</p>
      </div>
    {/if}
  </div>
</section>

{#if data.carouselEpisodes.length}
  <!-- Archive carousel -->
  <section class="border-t py-20 lg:py-28">
    <div class="center px-4">
      <div class="mb-12 flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <div>
          <Badge variant="secondary" class="mb-4">The archive</Badge>
          <h2 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Every story, so far</h2>
          <p class="max-w-xl text-muted-foreground">Drag, or just watch it drift — {data.carouselEpisodes.length} illustrated stories and counting.</p>
        </div>
        <Button href="/blogs" variant="outline" class="shrink-0">
          Browse all stories <ArrowRight class="ml-2 h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
    <div class="center px-4">
      <BlogCarousel episodes={data.carouselEpisodes} />
    </div>
  </section>
{/if}

<!-- How it's made -->
<section id="how-it-works" class="border-t bg-muted/20 py-20 lg:py-28">
  <div class="center px-4">
    <div class="mb-16 text-center">
      <Badge variant="secondary" class="mb-4">How it's made</Badge>
      <h2 class="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">Every story, the same way</h2>
      <p class="mx-auto max-w-2xl text-muted-foreground">
        Not hand-waved AI slop — a deliberate pipeline, grounded in real research, checked against a locked cast every single day.
      </p>
    </div>

    <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
      {#each HOW_IT_WORKS as item}
        <Card class="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-secondary/20">
          <div class="absolute inset-0 bg-linear-to-br {item.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-5"></div>
          <CardHeader>
            <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br {item.gradient} text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
              <item.icon class="h-6 w-6" />
            </div>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>{item.description}</CardDescription>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Closing CTA -->
<section class="relative overflow-hidden bg-linear-to-br from-primary via-primary/90 to-secondary py-20 text-primary-foreground">
  <div class="pointer-events-none absolute inset-0 overflow-hidden">
    <div class="absolute top-10 left-10 animate-pulse text-6xl opacity-10">✦</div>
    <div class="absolute right-10 bottom-10 animate-bounce text-7xl opacity-10">✦</div>
  </div>

  <div class="relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
    <div class="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border-2 border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm">
      <span class="text-sm font-semibold">Come back tomorrow</span>
    </div>
    <h2 class="mb-6 text-3xl font-bold drop-shadow-lg md:text-4xl">One true-to-life story a day, every day.</h2>
    <p class="mx-auto mb-8 max-w-2xl text-lg opacity-95">
      A new story is ready today — and another one tomorrow.
    </p>
    <Button href="#today" size="lg" variant="secondary" class="shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
      Read Today's Story <ArrowRight class="ml-2 h-5 w-5" />
    </Button>
  </div>
</section>
