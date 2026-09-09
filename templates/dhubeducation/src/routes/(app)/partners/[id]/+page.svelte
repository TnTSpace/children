<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    School,
    Globe,
    MapPin,
    ArrowLeft,
    ExternalLink,
    GraduationCap,
    Users,
    Sparkles,
    ImageIcon,
    ShieldCheck,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data }: { data: PageServerData } = $props();
  const partner = $derived(data.partner);
</script>

<Metatag
  title="{partner.name} | Partner Institution"
  description={`Explore our partner institution: ${partner.name} in ${partner.country}. Your gateway to global excellence.`}
  ogImage={partner.imageUrl}
/>

<!-- Partner Header -->
<section
  class="relative pt-48 pb-24 md:pt-64 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 skew-x-12 translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-5xl mx-auto text-center">
      <Button
        href="/partners"
        variant="ghost"
        class="mb-12 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl group"
      >
        <ArrowLeft
          class="mr-2 size-4 group-hover:-translate-x-1 transition-transform"
        /> Back to Partners
      </Button>

      <div class="flex justify-center mb-8">
        <Badge
          variant="outline"
          class="border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
        >
          Global Partner Institution
        </Badge>
      </div>

      <h1
        class="text-6xl md:text-8xl font-bold leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {partner.name}
      </h1>

      <div
        class="flex flex-wrap items-center justify-center gap-10 text-xs font-bold uppercase text-muted-foreground"
      >
        <div class="flex items-center gap-2">
          <MapPin class="size-4 text-primary" />
          {partner.country}
        </div>
        <div class="flex items-center gap-2">
          <Globe class="size-4 text-primary" /> World-Class Ranking
        </div>
        <div class="flex items-center gap-2">
          <School class="size-4 text-primary" />
          {partner.type}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Institution Showcase -->
<section class="px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32">
  <div class="max-w-6xl mx-auto">
    <div
      class="aspect-21/9 rounded-xl overflow-hidden shadow-lg border-12 border-background bg-muted animate-in fade-in zoom-in duration-1000"
    >
      {#if partner.imageUrl}
        <img
          src={partner.imageUrl}
          alt={partner.name}
          class="size-full object-cover"
        />
      {:else}
        <div class="size-full flex items-center justify-center">
          <School class="size-24 text-muted-foreground/20" />
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Content & Profile -->
<section class="py-8 bg-background">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
      <!-- Institution Profile -->
      <div class="lg:col-span-8">
        <div class="space-y-20">
          <div>
            <h2 class="text-4xl font-bold mb-8">About the Institution</h2>
            <div
              class="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none font-medium leading-[1.8] text-muted-foreground"
            >
              {@html partner.content}
            </div>
          </div>

          <!-- Institutional Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted text-center group hover:border-primary/20 transition-all"
            >
              <Users class="size-8 text-primary mx-auto mb-6" />
              <p class="text-3xl font-bold mb-2">15k+</p>
              <p class="text-[10px] font-bold uppercase text-muted-foreground">
                Students
              </p>
            </div>
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted text-center group hover:border-primary/20 transition-all"
            >
              <GraduationCap class="size-8 text-primary mx-auto mb-6" />
              <p class="text-3xl font-bold mb-2">95%</p>
              <p class="text-[10px] font-bold uppercase text-muted-foreground">
                Employment Rate
              </p>
            </div>
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted text-center group hover:border-primary/20 transition-all"
            >
              <Sparkles class="size-8 text-primary mx-auto mb-6" />
              <p class="text-3xl font-bold mb-2">Top 1%</p>
              <p class="text-[10px] font-bold uppercase text-muted-foreground">
                Global Ranking
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Sidebar -->
      <aside class="lg:col-span-4 space-y-10 sticky top-32">
        <div
          class="bg-background rounded-xl border border-primary/10 p-10 shadow-lg relative overflow-hidden"
        >
          <div
            class="absolute -top-12 -right-12 size-48 bg-primary/5 rounded-full blur-[80px]"
          ></div>

          <div class="flex items-center gap-4 mb-10">
            <div
              class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"
            >
              <ShieldCheck class="size-6" />
            </div>
            <h4 class="text-xl font-bold leading-tight">
              Official Partner Representation
            </h4>
          </div>

          <p
            class="text-sm text-muted-foreground font-medium mb-12 leading-relaxed"
          >
            DHUB Education is an officially authorized recruitment partner for {partner.name}.
            We provide priority processing and verified documentation services
            for all applicants.
          </p>

          <div class="space-y-4">
            <Button
              class="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Apply to {partner.name}
            </Button>
            <Button
              variant="outline"
              href={partner.website}
              target="_blank"
              class="w-full border-primary/10 hover:bg-primary/5 group"
            >
              Visit Official Site <ExternalLink
                class="ml-2 size-4 opacity-0 group-hover:opacity-100 transition-all"
              />
            </Button>
          </div>
        </div>

        <!-- Location Card -->
        <div class="p-10 rounded-xl bg-muted/30 border border-muted">
          <h4 class="text-xs font-bold uppercase text-muted-foreground mb-8">
            Primary Campus
          </h4>
          <div class="flex items-start gap-4">
            <div
              class="size-10 rounded-xl bg-background flex items-center justify-center shadow-sm shrink-0"
            >
              <MapPin class="size-5 text-primary" />
            </div>
            <div>
              <p class="text-sm font-bold mb-1">{partner.country}</p>
              <p class="text-xs text-muted-foreground font-medium">
                International Admissions Center
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- Call to Action -->
<section class="py-8 bg-primary relative overflow-hidden">
  <div
    class="absolute inset-0 bg-[radial-gradient(circle_at_70%_120%,rgba(255,255,255,0.1),transparent)]"
  ></div>
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <h2 class="text-5xl font-bold text-white mb-12">
      Start Your Journey at {partner.name.split(" ")[0]}
    </h2>
    <p
      class="text-primary-foreground/80 text-xl font-medium max-w-2xl mx-auto mb-12"
    >
      Our admissions experts have a 98% success rate for applications to this
      institution. Let us guide you through the process today.
    </p>
    <Button
      href="/contact"
      class="bg-white text-primary hover:bg-white/90 rounded-xl transition-all hover:scale-105 shadow-lg"
    >
      Speak with an Advisor
    </Button>
  </div>
</section>
