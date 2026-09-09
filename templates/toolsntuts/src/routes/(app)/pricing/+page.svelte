<script lang="ts">
  import { page } from "$app/state";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import { cn } from "$lib/utils";
  import { Constants } from "$lib/constants";
  import {
    Check,
    Sparkles,
    Zap,
    Coins,
    ArrowRight,
    Loader2,
    Star,
    ShieldCheck,
    RefreshCw,
    Film,
    Music,
  } from "@lucide/svelte";
  import type { User } from "$lib/auth";

  const user = $derived(page.data.user as User | undefined);
  const startHref = $derived(
    user ? "/projects/new" : "/auth/login?redirectTo=/projects/new",
  );

  const tiers = $derived([
    {
      name: "Starter",
      price: "Free",
      period: "",
      blurb: "Try the full AI pipeline — no card required.",
      credits: "500 credits included",
      featured: false,
      cta: "Get started free",
      href: startHref,
      badge: null as string | null,
      features: [
        "All 4 video formats (cinematic, viral, lesson, ad)",
        "AI storyboard generation (free, unlimited)",
        "Video clip generation with Kling v3",
        "Voiceover & narration (ElevenLabs)",
        "Auto-stitched ffmpeg timeline",
        "Credits refunded on failure",
      ],
    },
    {
      name: "Creator",
      price: "$19",
      period: "/mo",
      blurb: "For creators publishing consistently.",
      credits: "6,000 credits / month",
      featured: true,
      cta: "Start creating",
      href: startHref,
      badge: "Most popular" as string | null,
      features: [
        "Everything in Starter",
        "Priority generation queue",
        "HD exports (1080p)",
        "No watermark",
        "Extended video length (up to 2 min)",
        "Email support",
      ],
    },
    {
      name: "Studio",
      price: "$49",
      period: "/mo",
      blurb: "For teams and content studios.",
      credits: "20,000 credits / month",
      featured: false,
      cta: "Contact us",
      href: "mailto:support@toolsntuts.com",
      badge: null as string | null,
      features: [
        "Everything in Creator",
        "Top-tier models (Kling v3 Pro)",
        "Bulk generation API",
        "Early access to new models",
        "Team seats (up to 5)",
        "Dedicated Slack support",
      ],
    },
  ]);

  const packs = [
    {
      key: "starter",
      label: "Starter",
      credits: 500,
      price: "$5",
      perCredit: "$0.010",
      featured: false,
      tag: null,
    },
    {
      key: "builder",
      label: "Builder",
      credits: 2000,
      price: "$15",
      perCredit: "$0.0075",
      featured: true,
      tag: "Best value",
    },
    {
      key: "power",
      label: "Power",
      credits: 6000,
      price: "$40",
      perCredit: "$0.0067",
      featured: false,
      tag: null,
    },
    {
      key: "mega",
      label: "Mega",
      credits: 20000,
      price: "$100",
      perCredit: "$0.005",
      featured: false,
      tag: null,
    },
  ] as const;

  const creditItems = [
    {
      label: "Storyboard image",
      cost: "2 credits",
      icon: Sparkles,
      note: "Per shot — review before committing to video generation.",
    },
    {
      label: "Video clip (5s)",
      cost: "40 credits",
      icon: Film,
      note: "Kling v3 Turbo per 5-second clip. 10s = 80 credits.",
    },
    {
      label: "Voiceover line",
      cost: "1 credit",
      icon: Music,
      note: "Per narration line generated via ElevenLabs TTS.",
    },
    {
      label: "Script breakdown",
      cost: "Free",
      icon: Zap,
      note: "Scene-by-scene breakdown always free, unlimited.",
    },
  ];

  const pricingFaqs = [
    {
      q: "Do credits expire?",
      a: "One-time pack credits never expire. Monthly subscription credits reset each billing period but carry over for 90 days.",
    },
    {
      q: "What happens if I run out of credits mid-generation?",
      a: "Shots already completed are saved. The pipeline stops and returns the clips you have — you can top up and continue from where it stopped.",
    },
    {
      q: "Is there a free trial?",
      a: "Yes. Every new account starts with 500 free credits — enough to generate 1–2 complete 90-second videos. No credit card required.",
    },
    {
      q: "Can I mix subscription credits with pack credits?",
      a: "Yes. Pack credits stack on top of your monthly allocation. Monthly credits are spent first, then pack credits.",
    },
    {
      q: "Do you offer refunds?",
      a: "Credits are refunded automatically on generation failure. For billing refunds, contact support within 14 days of purchase.",
    },
  ];

  let buyingPack = $state<string | null>(null);

  async function buyPack(packKey: string) {
    if (buyingPack) return;
    if (!user) {
      window.location.href = "/auth/login?redirectTo=/pricing";
      return;
    }
    buyingPack = packKey;
    try {
      const res = await fetch("/api/credits/packs/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pack: packKey }),
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        alert(data?.error || "Could not start checkout.");
        buyingPack = null;
        return;
      }
      window.location.href = data.url;
    } catch {
      buyingPack = null;
    }
  }
</script>

<svelte:head>
  <title>Pricing | {Constants.BRANDNAME} — Simple, credit-based pricing</title>
  <meta
    name="description"
    content="Simple credit-based pricing. Storyboards are always free. Pay only for video clips, voiceovers, and images. Start with 500 free credits."
  />
</svelte:head>

<!-- ════════════════════════════════════════════════════════════════════════════
  HERO
════════════════════════════════════════════════════════════════════════════ -->
<section class="relative overflow-hidden py-20 sm:py-28">
  <!-- Subtle gradient background -->
  <div
    class="absolute inset-0 -z-10 bg-linear-to-b from-muted/60 to-background"
  ></div>
  <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div
      class="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]"
    ></div>
  </div>

  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl text-center">
      <Badge
        variant="secondary"
        class="mb-5 text-xs font-semibold tracking-wider uppercase"
        >Pricing</Badge
      >
      <h1
        class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-4"
      >
        Simple, credit-based pricing
      </h1>
      <p class="text-lg text-muted-foreground leading-relaxed">
        Script breakdown is always free. Credits are spent on storyboard images
        and video clips — and automatically refunded if a generation fails.
      </p>
      <div
        class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
      >
        <span class="flex items-center gap-1.5"
          ><ShieldCheck class="h-4 w-4 text-emerald-500" /> 500 free credits to start</span
        >
        <span class="flex items-center gap-1.5"
          ><RefreshCw class="h-4 w-4 text-blue-500" /> Auto-refund on failure</span
        >
        <span class="flex items-center gap-1.5"
          ><Check class="h-4 w-4 text-primary" /> Commercial use included</span
        >
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  TIER CARDS
════════════════════════════════════════════════════════════════════════════ -->
<section class="pb-20">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
    >
      {#each tiers as tier (tier.name)}
        <div
          class={cn(
            "relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:shadow-lg",
            tier.featured &&
              "border-primary shadow-md ring-1 ring-primary shadow-primary/10 scale-[1.02]",
          )}
        >
          {#if tier.badge}
            <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge class="shadow-md px-4">{tier.badge}</Badge>
            </div>
          {/if}

          <div class="flex flex-col flex-1 p-6">
            <!-- Header -->
            <div class="mb-6">
              <h2 class="text-lg font-bold">{tier.name}</h2>
              <p class="text-sm text-muted-foreground mt-1">{tier.blurb}</p>
              <div class="mt-4 flex items-end gap-1">
                <span class="text-4xl font-bold tabular-nums">{tier.price}</span
                >
                {#if tier.period}
                  <span class="mb-1.5 text-sm text-muted-foreground"
                    >{tier.period}</span
                  >
                {/if}
              </div>
              <div
                class="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary"
              >
                <Coins class="h-3 w-3" />
                {tier.credits}
              </div>
            </div>

            <!-- Features -->
            <ul class="flex-1 space-y-3 mb-8">
              {#each tier.features as f}
                <li class="flex items-start gap-2.5 text-sm">
                  <Check class="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  <span>{f}</span>
                </li>
              {/each}
            </ul>

            <!-- CTA -->
            <Button
              href={tier.href}
              class="w-full font-semibold"
              variant={tier.featured ? "default" : "outline"}
              size="lg"
            >
              {tier.cta}
              {#if tier.featured}<ArrowRight class="ml-1.5 h-4 w-4" />{/if}
            </Button>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  CREDIT PACKS
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-20 bg-muted/30 dark:bg-zinc-900/40">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      <div class="mb-12 text-center">
        <Badge
          variant="outline"
          class="mb-4 text-xs font-semibold tracking-wider uppercase gap-1.5"
        >
          <Coins class="h-3 w-3" /> Credit packs
        </Badge>
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Top up anytime
        </h2>
        <p class="mt-3 text-muted-foreground">
          One-time purchases — no subscription. Credits never expire.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each packs as pack (pack.key)}
          <div
            class={cn(
              "relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
              pack.featured && "border-primary ring-1 ring-primary",
            )}
          >
            {#if pack.tag}
              <div class="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge class="shadow-sm text-xs px-3">{pack.tag}</Badge>
              </div>
            {/if}

            <div class="mb-4">
              <span
                class="text-sm font-bold text-muted-foreground uppercase tracking-wider"
                >{pack.label}</span
              >
            </div>
            <div class="text-3xl font-bold tabular-nums mb-1">{pack.price}</div>
            <div class="text-lg font-bold text-primary mb-0.5">
              +{pack.credits.toLocaleString()} credits
            </div>
            <div class="text-xs text-muted-foreground mb-6">
              {pack.perCredit} per credit
            </div>

            <Button
              onclick={() => buyPack(pack.key)}
              disabled={buyingPack !== null}
              class="w-full font-semibold mt-auto"
              variant={pack.featured ? "default" : "outline"}
            >
              {#if buyingPack === pack.key}
                <Loader2 class="mr-2 h-4 w-4 animate-spin" /> Processing…
              {:else}
                <Sparkles class="mr-2 h-4 w-4" /> Buy {pack.label}
              {/if}
            </Button>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  WHAT COSTS CREDITS
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-20">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-4xl">
      <div class="mb-12 text-center">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
          What costs credits?
        </h2>
        <p class="mt-3 text-muted-foreground">
          Credits are only spent on AI generation — never for browsing, editing,
          reviewing, or script breakdown.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {#each creditItems as item}
          <div
            class="flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10"
              >
                <item.icon class="h-4 w-4 text-primary" />
              </div>
              <Badge
                variant={item.cost === "Free" ? "secondary" : "outline"}
                class="tabular-nums font-bold"
              >
                {item.cost}
              </Badge>
            </div>
            <div>
              <div class="text-sm font-bold">{item.label}</div>
              <div class="text-xs text-muted-foreground mt-1 leading-relaxed">
                {item.note}
              </div>
            </div>
          </div>
        {/each}
      </div>

      <p class="mt-8 text-center text-xs text-muted-foreground">
        Script breakdown is always free · Credits are refunded automatically on
        generation failure · Commercial use included
      </p>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  TESTIMONIAL STRIP
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-16 bg-gray-950">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <blockquote class="mx-auto max-w-3xl text-center">
      <div class="flex justify-center gap-1 mb-6">
        {#each Array(5).fill(0) as _}
          <Star class="h-5 w-5 fill-amber-400 text-amber-400" />
        {/each}
      </div>
      <p class="text-xl font-medium text-white leading-relaxed sm:text-2xl">
        "Turned our product brief into a 90-second ad in under 10 minutes. The
        Kling v3 quality is genuinely cinematic — clients can't believe it's
        AI."
      </p>
      <footer class="mt-8 flex items-center justify-center gap-3">
        <img
          src="https://i.pravatar.cc/48?img=68"
          alt="Marcus L."
          class="h-11 w-11 rounded-full ring-2 ring-white/20"
          loading="lazy"
        />
        <div class="text-left">
          <div class="text-sm font-bold text-white">Marcus L.</div>
          <div class="text-xs text-gray-400">
            Creative Director, Bloom Agency
          </div>
        </div>
      </footer>
    </blockquote>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  PRICING FAQ
════════════════════════════════════════════════════════════════════════════ -->
<section class="py-20">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-2xl">
      <div class="mb-10 text-center">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
          Pricing questions
        </h2>
      </div>

      <Accordion.Root type="multiple" class="space-y-3">
        {#each pricingFaqs as faq, i}
          <Accordion.Item
            value="pfaq-{i}"
            class="rounded-xl border bg-card shadow-sm overflow-hidden"
          >
            <Accordion.Trigger
              class="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold hover:bg-muted/50 transition-colors data-[state=open]:bg-muted/50"
            >
              {faq.q}
            </Accordion.Trigger>
            <Accordion.Content
              class="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
            >
              {faq.a}
            </Accordion.Content>
          </Accordion.Item>
        {/each}
      </Accordion.Root>

      <p class="mt-8 text-center text-sm text-muted-foreground">
        More questions? <a
          href="mailto:{Constants.SUPPORTEMAIL}"
          class="text-primary hover:underline">Email us</a
        > — we typically reply within 24 hours.
      </p>
    </div>
  </div>
</section>

<!-- ════════════════════════════════════════════════════════════════════════════
  CTA
════════════════════════════════════════════════════════════════════════════ -->
<section
  class="py-20 bg-linear-to-br from-primary/90 via-primary to-blue-600 text-white"
>
  <div class="container mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
    <h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
      Start with 500 free credits
    </h2>
    <p class="text-lg text-white/80 mb-8">
      No credit card. No commitment. Just sign up and start generating.
    </p>
    <Button
      href={user ? "/projects/new" : "/auth/login?redirectTo=/projects/new"}
      size="lg"
      variant="secondary"
      class="h-12 px-10 text-base font-bold shadow-xl hover:-translate-y-0.5 transition-all duration-200"
    >
      {user ? "Create a video" : "Get started free"}
      <ArrowRight class="ml-2 h-4 w-4" />
    </Button>
  </div>
</section>
