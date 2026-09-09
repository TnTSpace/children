<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from "$lib/components/ui/card/index.js";
  import {
    Globe,
    Building2,
    ExternalLink,
    ShieldCheck,
    MapPin,
    Search,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { Debounced } from "runed";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
  import { Input } from "$lib/components/ui/input/index.js";

  let { data }: { data: PageServerData } = $props();

  let searchTerm = $state(page.url.searchParams.get("search") || "");
  const debouncedSearch = new Debounced(() => searchTerm, 300);

  $effect(() => {
    const term = debouncedSearch.current;
    if (!browser) return;
    const url = new URL(page.url);
    const prevTerm = url.searchParams.get("search") || "";
    const prevOffset = url.searchParams.get("offset") || "0";

    if (term === prevTerm && prevOffset === "0") return;

    if (term) {
      url.searchParams.set("search", term);
    } else {
      url.searchParams.delete("search");
    }
    url.searchParams.set("offset", "0");
    goto(url.toString(), { keepFocus: true, noScroll: true });
  });

  const partners = $derived(data.partners?.data?.data || []);
  const total = $derived(data.partners?.data?.total || 0);
</script>

<Metatag title="Our Global Partners" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 -skew-x-12 translate-x-1/4"
    ></div>
    <div
      class="absolute bottom-0 left-0 w-1/3 h-full bg-primary/2 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-12 mb-16"
    >
      <div class="max-w-2xl">
        <Badge
          variant="outline"
          class="mb-6 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
          >Global Network</Badge
        >
        <h1 class="text-6xl font-bold sm:text-8xl leading-[0.85] mb-8">
          Partnering for <span class="text-primary italic">Excellence.</span>
        </h1>
        <p class="text-lg text-muted-foreground font-medium leading-relaxed">
          We collaborate with top-tier universities and world-class educational
          providers to ensure every student has access to the best opportunities
          globally.
        </p>
      </div>

      <div class="w-full md:w-96">
        <div class="relative group">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5"
          />
          <Input
            bind:value={searchTerm}
            placeholder="Search partners..."
            class="pl-12 border-primary/10 bg-background/80 backdrop-blur-xl transition-all focus-visible:ring-primary/20"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Partner Grid -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    {#if partners.length > 0}
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {#each partners as partner, i (partner.id)}
          <a
            href="/partners/{partner.id}"
            class="flex flex-col items-center justify-center bg-background border border-primary/5 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-2 transition-all duration-500 group cursor-pointer aspect-square"
            in:fade={{ delay: i * 50, duration: 500 }}
          >
            <div
              class="size-full bg-muted/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors overflow-hidden"
            >
              {#if partner.imageUrl}
                <img
                  src={partner.imageUrl}
                  alt={partner.name}
                  class="size-full object-cover"
                />
              {:else}
                <Building2
                  class="size-10 text-muted-foreground/20 group-hover:text-primary transition-colors duration-500"
                />
              {/if}
            </div>
            <div class="p-2 flex flex-col gap-1 items-center">
              <p
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors text-center line-clamp-2"
              >
                {partner.name}
              </p>
              <Badge
                variant="secondary"
                class="rounded-full px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]"
              >
                {partner.country}
              </Badge>
            </div>
          </a>
        {/each}
      </div>
    {:else}
      <div
        class="py-8 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10"
      >
        <Globe
          class="size-20 text-muted-foreground/20 mx-auto mb-8 animate-pulse"
        />
        <h3 class="text-3xl font-bold mb-4">Expanding Our Network</h3>
        <p class="text-muted-foreground max-w-md mx-auto font-medium">
          We are continuously vetting new institutions to provide more
          opportunities. Check back soon or contact us for specific university
          partnerships.
        </p>
      </div>
    {/if}
  </div>
</section>

<!-- Bottom Section -->
<section class="py-8 bg-muted/30 relative overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
      <div>
        <Badge
          variant="outline"
          class="mb-6 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
          >Become a Partner</Badge
        >
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-10">
          Build the Future Together
        </h2>
        <p
          class="text-lg text-muted-foreground font-medium leading-relaxed mb-10"
        >
          Are you an educational institution looking to attract top
          international talent? Partner with DHUB Education and gain access to
          our extensive network of qualified students.
        </p>
        <Button
          href="/contact"
          class="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
        >
          Partner with Us
        </Button>
      </div>
      <div class="grid grid-cols-2 gap-6">
        <div
          class="p-10 bg-background rounded-xl border border-muted shadow-sm flex flex-col items-center text-center"
        >
          <span class="text-5xl font-bold text-primary mb-4">500+</span>
          <span class="text-xs font-bold uppercase text-muted-foreground"
            >Institutions</span
          >
        </div>
        <div
          class="p-10 bg-background rounded-xl border border-muted shadow-sm flex flex-col items-center text-center"
        >
          <span class="text-5xl font-bold text-primary mb-4">15+</span>
          <span class="text-xs font-bold uppercase text-muted-foreground"
            >Countries</span
          >
        </div>
        <div
          class="p-10 bg-background rounded-xl border border-muted shadow-sm flex flex-col items-center text-center"
        >
          <span class="text-5xl font-bold text-primary mb-4">100%</span>
          <span class="text-xs font-bold uppercase text-muted-foreground"
            >Verified</span
          >
        </div>
        <div
          class="p-10 bg-background rounded-xl border border-muted shadow-sm flex flex-col items-center text-center"
        >
          <span class="text-5xl font-bold text-primary mb-4">24/7</span>
          <span class="text-xs font-bold uppercase text-muted-foreground"
            >Support</span
          >
        </div>
      </div>
    </div>
  </div>
</section>
