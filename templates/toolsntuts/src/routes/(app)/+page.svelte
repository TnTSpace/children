<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import { cn } from "$lib/utils";
  import type { User } from "$lib/auth";
  import {
    ArrowRight,
    Play,
    Sparkles,
    Film,
    Zap,
    Layers,
    Music,
    CheckCircle2,
    Wand2,
    Lightbulb,
    Star,
    ChevronRight,
  } from "@lucide/svelte";

  const user = $derived(page.data.user as User | undefined);
  const ctaHref = $derived(
    user ? "/dashboard" : "/auth/login?redirectTo=/dashboard",
  );
  const ctaLabel = $derived(user ? "Open Dashboard" : "Get Started Free");

  const stats = [
    {
      value: "90s",
      label: "Finished video, any type",
      sub: "narrated, stitched, ready",
    },
    {
      value: "$1.25",
      label: "Average cost per video",
      sub: "pay only for what you generate",
    },
    {
      value: "<2 min",
      label: "Idea to first cut",
      sub: "from prompt to render",
    },
    {
      value: "4",
      label: "AI models powering clips",
      sub: "Kling v3, Flux, WaveSpeed & more",
    },
  ];

  const features = [
    {
      icon: Film,
      title: "Cinematic series",
      description:
        "Multi-episode stories with consistent characters, locations and continuity across every shot.",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Viral shorts",
      description:
        "Hook-driven 90-second content optimised for social — suspense, twist, resolution in one cut.",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: Layers,
      title: "Lesson videos",
      description:
        "Educational content with narration, scene breakdowns and automatic voiceover generation.",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      icon: Music,
      title: "Voice & narration",
      description:
        "Professional TTS narration generated and timed to your clips — no recording booth needed.",
      gradient: "from-emerald-500 to-teal-600",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Submit a prompt",
      description:
        "Describe your video idea in plain English. toolsntuts breaks it into a full scene-by-scene script automatically.",
      icon: Lightbulb,
    },
    {
      num: "02",
      title: "Review storyboards",
      description:
        "AI generates a reference image for every scene — completely free. Approve, tweak prompts, or regenerate any frame.",
      icon: Wand2,
    },
    {
      num: "03",
      title: "Generate clips",
      description:
        "Approve your storyboard and generate cinematic video clips with Kling v3. Each clip continues from the last frame.",
      icon: Film,
    },
    {
      num: "04",
      title: "Download your video",
      description:
        "All clips are stitched with ffmpeg, narration added, and your finished 90-second video is ready to share.",
      icon: Sparkles,
    },
  ];

  const showcaseImages = [
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
      label: "Mountain adventure",
      duration: "0:92",
    },
    {
      src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80",
      label: "Urban cinematic",
      duration: "0:90",
    },
    {
      src: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
      label: "Forest story",
      duration: "0:88",
    },
    {
      src: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=600&q=80",
      label: "Ocean journey",
      duration: "0:91",
    },
    {
      src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
      label: "Summit view",
      duration: "0:90",
    },
    {
      src: "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=600&q=80",
      label: "Desert dusk",
      duration: "0:89",
    },
  ];

  const testimonials = [
    {
      quote:
        "I described a 5-episode fantasy series and had storyboards in 3 minutes. Generated all clips by the time I finished my coffee. Absolutely wild.",
      name: "Jordan M.",
      role: "Independent filmmaker",
      avatar: "https://i.pravatar.cc/80?img=11",
      stars: 5,
    },
    {
      quote:
        "I use it every week for lesson videos. The voiceover sync is perfect — no more editing timelines by hand. It just works.",
      name: "Aisha T.",
      role: "Online educator, 40k students",
      avatar: "https://i.pravatar.cc/80?img=47",
      stars: 5,
    },
    {
      quote:
        "Turned our product brief into a 90-second ad in under 10 minutes. The Kling v3 quality is genuinely cinematic — clients can't believe it's AI.",
      name: "Marcus L.",
      role: "Creative director, Bloom Agency",
      avatar: "https://i.pravatar.cc/80?img=68",
      stars: 5,
    },
  ];

  const faqs = [
    {
      q: "How much does it cost to generate a video?",
      a: "A typical 90-second video with 6 shots costs around $1.25 in credits — that's storyboard images (2 credits each) + video clips (40 credits each at 5 seconds). You start with 500 free credits, enough to generate 1–2 complete videos.",
    },
    {
      q: "Do I need a credit card to start?",
      a: "No. Sign up with Google or email and you get 500 credits immediately — no card required. You only need to add payment when you want to buy more credits.",
    },
    {
      q: "How long does generation take?",
      a: "Storyboard images generate in about 5–10 seconds each. Video clips take 30–90 seconds per shot with Kling v3. A full 6-shot video is typically ready in under 10 minutes.",
    },
    {
      q: "What happens if a generation fails?",
      a: "Credits are always refunded automatically on failure — you never lose credits to a failed generation. The pipeline also retries common transient errors before reporting a failure.",
    },
    {
      q: "Can I use the generated videos commercially?",
      a: "Yes. All videos generated through toolsntuts are yours to use commercially. The underlying AI models (Kling, Flux) grant commercial rights for outputs produced through licensed API access.",
    },
    {
      q: "What video formats and aspect ratios are supported?",
      a: "toolsntuts supports 16:9 (landscape), 9:16 (vertical/TikTok), 1:1 (square), and 21:9 (ultrawide cinematic). All formats export as MP4 H.264.",
    },
  ];
</script>

<svelte:head>
  <title>toolsntuts — AI Video Studio. Turn ideas into 90-second videos.</title>
  <meta
    name="description"
    content="Turn any idea into a captivating 90-second video with AI. Cinematic series, viral shorts, lesson content — generated end-to-end with Kling v3 and Flux. Start free."
  />
</svelte:head>

<!-- ════════════════════════════════════════════════════════════════════════════
  HERO
════════════════════════════════════════════════════════════════════════════ -->
<section
  id="hero"
  class="relative isolate min-h-[92vh] flex flex-col items-center justify-center overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-24"
>
  <!-- Background image -->
  <div class="absolute inset-0 -z-10">
    <img
      src="/background.webp"
      alt=""
      class="h-full w-full object-cover object-center"
      fetchpriority="high"
    />
    <!-- Multi-layer overlay for depth -->
    <div
      class="absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/80"
    ></div>
    <div
      class="absolute inset-0 bg-linear-to-r from-black/30 via-transparent to-black/30"
    ></div>
  </div>

  <!-- Subtle animated orbs -->
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div
      class="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px] animate-pulse"
    ></div>
    <div
      class="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px] animate-pulse [animation-delay:1.5s]"
    ></div>
  </div>

  <div class="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
    <!-- Badge -->
    <div
      class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm mb-8 animate-in fade-in slide-in-from-top-4 duration-700"
    >
      <Sparkles class="h-3.5 w-3.5 text-primary" />
      AI Video Studio — Powered by Kling v3 & Flux
    </div>

    <!-- Headline -->
    <h1
      class="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:100ms]"
    >
      Turn any idea into a
      <span
        class="bg-linear-to-r from-primary via-pink-400 to-blue-400 bg-clip-text text-transparent"
      >
        captivating 90-second
      </span>
      video
    </h1>

    <!-- Subtitle -->
    <p
      class="mx-auto max-w-2xl text-lg text-white/75 sm:text-xl leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:200ms]"
    >
      Describe your idea. We break it into scenes, generate every shot with the
      world's best AI models, and deliver a finished, narrated video. No
      editing. No friction.
    </p>

    <!-- CTAs -->
    <div
      class="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-6 duration-700 [animation-delay:300ms]"
    >
      <Button
        href={ctaHref}
        size="lg"
        class="h-12 px-8 text-base font-semibold shadow-2xl shadow-primary/40 hover:shadow-primary/60 hover:-translate-y-0.5 transition-all duration-200"
      >
        {ctaLabel}
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
      <Button
        href="/#how-it-works"
        variant="outline"
        size="lg"
        class="h-12 px-8 text-base font-semibold border-white/30 bg-white/10 text-white hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all duration-200"
      >
        <Play class="mr-2 h-4 w-4 fill-current" />
        See how it works
      </Button>
    </div>

    <!-- Trust strip -->
    <div
      class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/55 animate-in fade-in duration-700 [animation-delay:500ms]"
    >
      <span class="flex items-center gap-1.5"
        ><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> 500 free credits —
        no card required</span
      >
      <span class="flex items-center gap-1.5"
        ><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> Credits refunded on
        failure</span
      >
      <span class="flex items-center gap-1.5"
        ><CheckCircle2 class="h-3.5 w-3.5 text-emerald-400" /> Commercial use included</span
      >
    </div>
  </div>

  <!-- Scroll indicator -->
  <div
    class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60"
  >
    <div
      class="flex h-8 w-5 items-start justify-center rounded-full border-2 border-white/40 pt-1.5"
    >
      <div
        class="h-1.5 w-1 rounded-full bg-white/60 animate-[scroll_1.5s_ease-in-out_infinite]"
      ></div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  STATS STRIP
════════════════════════════════════════════════════════════════════════════ -->
<section
  class="border-y bg-muted/40 dark:bg-zinc-900/60 py-10 backdrop-blur-sm"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
      {#each stats as stat}
        <div class="text-center">
          <div
            class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            {stat.value}
          </div>
          <div class="mt-1 text-sm font-semibold text-foreground">
            {stat.label}
          </div>
          <div class="text-xs text-muted-foreground mt-0.5">{stat.sub}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  FEATURES
════════════════════════════════════════════════════════════════════════════ -->
<section id="features" class="py-24 lg:py-32">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-16 text-center">
      <Badge
        variant="secondary"
        class="mb-4 text-xs font-semibold tracking-wider uppercase"
        >What you can build</Badge
      >
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
        One platform. Every kind of video.
      </h2>
      <p class="mx-auto mt-4 max-w-2xl text-muted-foreground text-lg">
        Lesson series, viral shorts, cinematic narratives, product ads — any
        90-second video type generated end-to-end.
      </p>
    </div>

    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {#each features as feature}
        <div
          class="group relative flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
        >
          <div
            class="absolute inset-0 rounded-2xl bg-linear-to-br {feature.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.04]"
          ></div>
          <div
            class="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br {feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          >
            <feature.icon class="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-foreground mb-1.5">{feature.title}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
          <div class="mt-auto pt-2">
            <a
              href="/auth/login?redirectTo=/dashboard"
              class="inline-flex items-center text-xs font-semibold text-primary hover:gap-2 gap-1 transition-all duration-150"
            >
              Try it free <ChevronRight class="h-3 w-3" />
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  HOW IT WORKS
════════════════════════════════════════════════════════════════════════════ -->
<section
  id="how-it-works"
  class="py-24 lg:py-32 bg-muted/30 dark:bg-zinc-900/40 overflow-hidden"
>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid items-center gap-16 lg:grid-cols-2">
      <!-- Left: steps -->
      <div>
        <Badge
          variant="secondary"
          class="mb-4 text-xs font-semibold tracking-wider uppercase"
          >How it works</Badge
        >
        <h2
          class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-4"
        >
          Submit a prompt.<br />Receive a video.
        </h2>
        <p class="text-muted-foreground text-lg mb-12 leading-relaxed">
          Write your idea — a verse, a viral hook, a product description.
          toolsntuts handles the rest.
        </p>

        <div class="space-y-8">
          {#each steps as step, i}
            <div class="flex gap-5">
              <div class="flex flex-col items-center">
                <div
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/30"
                >
                  {i + 1}
                </div>
                {#if i < steps.length - 1}
                  <div class="mt-2 w-px flex-1 bg-border min-h-[2rem]"></div>
                {/if}
              </div>
              <div class="pb-8">
                <h3 class="font-bold text-foreground mb-1">{step.title}</h3>
                <p class="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-4">
          <Button
            href={ctaHref}
            size="lg"
            class="shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Start for free <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- Right: visual -->
      <div class="relative lg:pl-8">
        <div
          class="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/10"
        >
          <img
            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80"
            alt="Video production workflow"
            class="w-full object-cover aspect-[4/3]"
            loading="lazy"
          />
          <!-- Overlay gradient -->
          <div
            class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"
          ></div>
          <!-- Status card overlay -->
          <div
            class="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-background/90 backdrop-blur-md border border-border/50 px-4 py-3 shadow-xl"
          >
            <div class="flex items-center gap-3">
              <div
                class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_theme(colors.emerald.500)]"
              ></div>
              <span class="text-sm font-semibold">Generating shot 4 of 6</span>
            </div>
            <span class="text-xs text-muted-foreground tabular-nums"
              >~40s remaining</span
            >
          </div>
        </div>

        <!-- Floating accent cards -->
        <div
          class="absolute -top-4 -right-4 rounded-xl bg-card border shadow-xl p-3 hidden lg:flex items-center gap-2.5 z-10"
        >
          <div
            class="h-8 w-8 rounded-lg bg-linear-to-br from-primary to-pink-500 flex items-center justify-center shadow"
          >
            <Sparkles class="h-4 w-4 text-white" />
          </div>
          <div>
            <div class="text-xs font-bold">Kling v3 Turbo</div>
            <div class="text-[10px] text-muted-foreground">Active model</div>
          </div>
        </div>
        <div
          class="absolute -bottom-4 -left-4 rounded-xl bg-card border shadow-xl p-3 hidden lg:flex items-center gap-2.5 z-10"
        >
          <CheckCircle2 class="h-6 w-6 text-emerald-500 shrink-0" />
          <div>
            <div class="text-xs font-bold">Storyboard approved</div>
            <div class="text-[10px] text-muted-foreground">6 scenes ready</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  SHOWCASE — Dark section with cinematic thumbnails
════════════════════════════════════════════════════════════════════════════ -->
<section class="bg-gray-950 py-24 lg:py-32 overflow-hidden">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <Badge
        class="mb-4 bg-white/10 text-white border-white/20 text-xs font-semibold tracking-wider uppercase hover:bg-white/15"
        >Creator showcase</Badge
      >
      <h2
        class="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
      >
        Videos made with toolsntuts
      </h2>
      <p class="mt-4 text-gray-400 text-lg max-w-xl mx-auto">
        From cinematic series to viral shorts — every video below was generated
        from a single text prompt.
      </p>
    </div>

    <div class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
      {#each showcaseImages as item}
        <div
          class="group relative overflow-hidden rounded-xl aspect-video cursor-pointer"
        >
          <img
            src={item.src}
            alt={item.label}
            class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-100"
          ></div>
          <!-- Play button -->
          <div
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm ring-2 ring-white/40 hover:bg-white/30 transition-colors"
            >
              <Play class="h-5 w-5 text-white fill-white ml-0.5" />
            </div>
          </div>
          <!-- Label + duration -->
          <div
            class="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between"
          >
            <span class="text-xs font-semibold text-white drop-shadow"
              >{item.label}</span
            >
            <span
              class="rounded bg-black/50 px-1.5 py-0.5 text-[10px] font-mono text-white/80"
              >{item.duration}</span
            >
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  TESTIMONIALS
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-24 lg:py-32">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mb-12 text-center">
      <Badge
        variant="secondary"
        class="mb-4 text-xs font-semibold tracking-wider uppercase"
        >Testimonials</Badge
      >
      <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Trusted by creators worldwide
      </h2>
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      {#each testimonials as t}
        <div
          class="flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm"
        >
          <!-- Stars -->
          <div class="flex gap-1">
            {#each Array(t.stars).fill(0) as _}
              <Star class="h-4 w-4 fill-amber-400 text-amber-400" />
            {/each}
          </div>
          <blockquote
            class="text-sm leading-relaxed text-muted-foreground flex-1"
          >
            "{t.quote}"
          </blockquote>
          <div class="flex items-center gap-3 pt-2 border-t border-border/50">
            <img
              src={t.avatar}
              alt={t.name}
              class="h-10 w-10 rounded-full object-cover ring-2 ring-border"
              loading="lazy"
            />
            <div>
              <div class="text-sm font-bold">{t.name}</div>
              <div class="text-xs text-muted-foreground">{t.role}</div>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  FAQ
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-24 lg:py-32 bg-muted/30 dark:bg-zinc-900/40">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-3xl">
      <div class="mb-12 text-center">
        <Badge
          variant="secondary"
          class="mb-4 text-xs font-semibold tracking-wider uppercase">FAQ</Badge
        >
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
        <p class="mt-4 text-muted-foreground">
          Everything you need to know about toolsntuts. Can't find your answer?
          <a
            href="mailto:support@toolsntuts.com"
            class="text-primary hover:underline">Email us.</a
          >
        </p>
      </div>

      <Accordion.Root type="multiple" class="space-y-3">
        {#each faqs as faq, i}
          <Accordion.Item
            value="faq-{i}"
            class="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            <Accordion.Trigger
              class="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold hover:bg-muted/50 transition-colors data-[state=open]:bg-muted/50"
            >
              {faq.q}
            </Accordion.Trigger>
            <Accordion.Content
              class="px-6 pb-5 text-sm text-muted-foreground leading-relaxed"
            >
              {faq.a}
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  CTA
════════════════════════════════════════════════════════════════════════════ -->
<section class="relative overflow-hidden py-24 lg:py-32">
  <!-- Background -->
  <div class="absolute inset-0 -z-10">
    <img
      src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
      alt=""
      class="h-full w-full object-cover"
      loading="lazy"
    />
    <div
      class="absolute inset-0 bg-linear-to-br from-gray-950/95 via-gray-950/85 to-primary/40"
    ></div>
  </div>

  <div class="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
    <Badge
      class="mb-6 bg-primary/20 text-primary border-primary/30 text-xs font-semibold tracking-wider uppercase"
    >
      Start for free
    </Badge>
    <h2
      class="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
    >
      Your first video is one prompt away
    </h2>
    <p class="mb-10 text-lg text-white/70 leading-relaxed">
      Describe your idea and watch it become a fully narrated, stitched video in
      under 10 minutes. 500 credits free — no card required.
    </p>
    <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
      <Button
        href={ctaHref}
        size="lg"
        class="h-12 px-10 text-base font-bold shadow-2xl shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200"
      >
        {ctaLabel}
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
      <Button
        href="/pricing"
        variant="outline"
        size="lg"
        class="h-12 px-10 text-base border-white/20 text-white bg-white/5 hover:bg-white/15 hover:border-white/40 backdrop-blur-sm transition-all duration-200"
      >
        View pricing
      </Button>
    </div>
  </div>
</section>

<style>
  @keyframes scroll {
    0%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
    80% {
      transform: translateY(6px);
      opacity: 0.3;
    }
  }
</style>
