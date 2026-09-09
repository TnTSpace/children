<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Calendar,
    ArrowLeft,
    Rocket,
    Timer,
    CheckCircle2,
    Info,
    Share2,
    ImageIcon,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data }: { data: PageServerData } = $props();
  const campaign = $derived(data.campaign);

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function getStatus(endDate: Date | string) {
    const now = new Date();
    const end = new Date(endDate);
    return now > end ? "Expired" : "Active";
  }
</script>

<Metatag
  title="{campaign.title} | DHUB Education Campaign"
  description={campaign.description}
  ogImage={campaign.imageUrl}
  ogType="article"
/>

<!-- Campaign Hero -->
<section class="relative py-8 overflow-hidden bg-background">
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 left-0 w-1/2 h-full bg-primary/3 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-4xl mx-auto text-center">
      <Button
        href="/campaigns"
        variant="ghost"
        class="mb-12 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl group"
      >
        <ArrowLeft
          class="mr-2 size-4 group-hover:-translate-x-1 transition-transform"
        /> Back to Campaigns
      </Button>

      <div class="flex justify-center mb-8">
        <Badge
          class="{getStatus(campaign.endDate) === 'Active'
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-red-500/20 text-red-600 border-red-500/20'} px-6 py-2 rounded-full font-bold text-xs uppercase shadow-lg"
        >
          {getStatus(campaign.endDate)} Campaign
        </Badge>
      </div>

      <h1
        class="text-5xl md:text-8xl font-bold leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {campaign.title}
      </h1>

      <p
        class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed mb-12"
      >
        {campaign.description}
      </p>

      <div
        class="flex flex-wrap items-center justify-center gap-12 text-sm font-bold uppercase"
      >
        <div class="flex flex-col items-center gap-3">
          <span class="text-muted-foreground text-[10px]">Start Date</span>
          <div class="flex items-center gap-2 text-primary">
            <Calendar class="size-5" />
            {formatDate(campaign.startDate)}
          </div>
        </div>
        <div class="flex flex-col items-center gap-3">
          <span class="text-muted-foreground text-[10px]">End Date</span>
          <div class="flex items-center gap-2 text-primary">
            <Timer class="size-5" />
            {formatDate(campaign.endDate)}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Campaign Visual -->
<section class="px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32">
  <div class="max-w-6xl mx-auto">
    <div
      class="aspect-21/9 rounded-xl overflow-hidden shadow-lg border-12 border-background bg-muted animate-in fade-in zoom-in duration-1000"
    >
      {#if campaign.imageUrl}
        <img
          src={campaign.imageUrl}
          alt={campaign.title}
          class="size-full object-contain"
        />
      {:else}
        <div class="size-full flex items-center justify-center">
          <Rocket class="size-24 text-muted-foreground/20" />
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Detailed Content -->
<section class="py-8 bg-background">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
      <!-- Content -->
      <div class="lg:col-span-8">
        <div
          class="prose prose-zinc dark:prose-invert max-w-none font-medium leading-[1.8] text-muted-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline text-base"
        >
          {@html campaign.content}
        </div>

        <div
          class="mt-24 p-12 rounded-xl bg-muted/20 border border-muted flex flex-col md:flex-row items-center gap-12"
        >
          <div
            class="size-20 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/30"
          >
            <Rocket class="size-10" />
          </div>
          <div>
            <h3 class="text-2xl font-bold mb-4">
              Ready to join this campaign?
            </h3>
            <p class="text-muted-foreground font-medium">
              Limited spots available for the current cycle. Apply today to
              secure your place.
            </p>
          </div>
          <Button
            href="/contact"
            class="rounded-xl shadow-lg hover:scale-105 transition-all"
            >Apply Now</Button
          >
        </div>
      </div>

      <!-- Info Box -->
      <aside class="lg:col-span-4 space-y-12 sticky top-32">
        <div
          class="bg-background rounded-xl border border-primary/10 p-10 shadow-lg overflow-hidden relative"
        >
          <div
            class="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl"
          ></div>
          <h4 class="text-xl font-bold mb-10 flex items-center gap-3">
            <Info class="size-5 text-primary" /> Key Information
          </h4>

          <div class="space-y-8">
            <div class="flex gap-4">
              <div
                class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
              >
                <CheckCircle2 class="size-5" />
              </div>
              <div>
                <p class="text-sm font-bold mb-1">Expert Guidance</p>
                <p class="text-xs text-muted-foreground font-medium">
                  Personalized support throughout the campaign cycle.
                </p>
              </div>
            </div>
            <div class="flex gap-4">
              <div
                class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
              >
                <CheckCircle2 class="size-5" />
              </div>
              <div>
                <p class="text-sm font-bold mb-1">Fast-Track Entry</p>
                <p class="text-xs text-muted-foreground font-medium">
                  Accelerated processing for campaign participants.
                </p>
              </div>
            </div>
            <div class="flex gap-4">
              <div
                class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
              >
                <CheckCircle2 class="size-5" />
              </div>
              <div>
                <p class="text-sm font-bold mb-1">Resource Access</p>
                <p class="text-xs text-muted-foreground font-medium">
                  Exclusive templates and prep materials included.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            class="w-full mt-12 rounded-xl border-primary/20 font-bold flex items-center justify-between"
          >
            Share Opportunity <Share2 class="size-4" />
          </Button>
        </div>

        <!-- Contact Hub -->
        <div
          class="p-10 rounded-xl bg-muted/30 border border-muted text-center"
        >
          <p class="text-xs font-bold uppercase text-muted-foreground mb-6">
            Questions about this?
          </p>
          <div class="flex flex-col gap-4">
            <Button
              variant="ghost"
              href="tel:+447930739927"
              class="rounded-xl font-bold border border-muted bg-background"
              >Call Admissions</Button
            >
            <Button
              variant="ghost"
              href="/contact"
              class="rounded-xl font-bold border border-muted bg-background"
              >Email Support</Button
            >
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>
