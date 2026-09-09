<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from "$lib/components/ui/card/index.js";
  import {
    Search,
    Calendar,
    Clock,
    ArrowRight,
    ImageIcon,
    Sparkles,
    Rocket,
    Timer,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { Debounced } from "runed";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

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

  const campaigns = $derived(data.campaigns?.data?.data || []);
  const total = $derived(data.campaigns?.data?.total || 0);

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getStatus(endDate: Date | string) {
    const now = new Date();
    const end = new Date(endDate);
    return now > end ? "Expired" : "Active";
  }
</script>

<Metatag title="Active Campaigns" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 left-0 w-1/2 h-full bg-primary/3 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div
      class="flex flex-col md:flex-row justify-between items-end gap-12 mb-16 text-left"
    >
      <div class="max-w-2xl">
        <Badge
          variant="outline"
          class="mb-6 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
          >Limited Opportunities</Badge
        >
        <h1 class="text-6xl font-bold sm:text-8xl leading-[0.85] mb-8">
          Accelerate Your <span class="text-primary italic">Ambition.</span>
        </h1>
        <p class="text-lg text-muted-foreground font-medium leading-relaxed">
          Join our specialized recruitment campaigns and scholarship programs.
          Each campaign is designed to fast-track your journey to global
          excellence.
        </p>
      </div>

      <div class="w-full md:w-96">
        <div class="relative group">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5"
          />
          <Input
            bind:value={searchTerm}
            placeholder="Search campaigns..."
            class="pl-12 h-14 rounded-xl border-primary/10 bg-background/80 backdrop-blur-xl transition-all focus-visible:ring-primary/20 text-lg font-medium"
          />
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Campaign Grid -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    {#if campaigns.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {#each campaigns as campaign, i (campaign.id)}
          <div in:fade={{ delay: i * 50, duration: 500 }}>
            <a href="/campaigns/{campaign.id}" class="block group h-full">
              <Card
                class="rounded-xl border-primary/5 bg-background shadow-lg hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden border hover:border-primary/20 hover:-translate-y-4 h-full flex flex-col"
              >
                <div
                  class="aspect-square lg:aspect-video overflow-hidden relative"
                >
                  {#if campaign.imageUrl}
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      class="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    />
                  {:else}
                    <div
                      class="size-full bg-muted flex items-center justify-center"
                    >
                      <Rocket class="size-12 text-muted-foreground/20" />
                    </div>
                  {/if}
                  <div class="absolute top-6 right-6">
                    <Badge
                      class="{getStatus(campaign.endDate) === 'Active'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500/20 text-red-600 border-red-500/20'} px-4 py-1.5 rounded-full font-bold text-[10px] uppercase shadow-lg"
                    >
                      {getStatus(campaign.endDate)}
                    </Badge>
                  </div>
                </div>
                <CardHeader class="p-8 pb-4">
                  <div
                    class="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase text-muted-foreground"
                  >
                    <span class="flex items-center gap-1.5"
                      ><Calendar class="size-3" />
                      {formatDate(campaign.startDate)} - {formatDate(
                        campaign.endDate,
                      )}</span
                    >
                  </div>
                  <CardTitle
                    class="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2"
                  >
                    {campaign.title}
                  </CardTitle>
                </CardHeader>
                <CardContent class="p-8 pt-0 grow">
                  <p
                    class="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3"
                  >
                    {campaign.description}
                  </p>
                </CardContent>
                <CardFooter
                  class="p-8 pt-0 flex items-center justify-between mt-auto"
                >
                  <div
                    class="flex items-center gap-2 text-primary font-bold text-xs uppercase group-hover:translate-x-1 transition-all"
                  >
                    View Details <ArrowRight class="size-4" />
                  </div>
                  <div
                    class="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500"
                  >
                    <Timer class="size-4" />
                  </div>
                </CardFooter>
              </Card>
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="py-8 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10"
      >
        <Rocket
          class="size-20 text-muted-foreground/20 mx-auto mb-8 animate-pulse"
        />
        <h3 class="text-3xl font-bold mb-4">New Campaigns Launching Soon</h3>
        <p class="text-muted-foreground max-w-md mx-auto font-medium">
          We are preparing exclusive recruitment cycles and student support
          initiatives. Stay tuned for notifications or contact us to be the
          first to know.
        </p>
        <Button href="/contact" class="mt-12 rounded-xl shadow-lg"
          >Contact for More Info</Button
        >
      </div>
    {/if}
  </div>
</section>

<!-- Stats / CTA Footer -->
<section class="py-8 bg-primary relative overflow-hidden">
  <div
    class="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent)]"
  ></div>
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <h2 class="text-4xl md:text-6xl font-bold text-white mb-12">
      Empowering 3,000+ Students Annually
    </h2>
    <p
      class="text-primary-foreground/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
    >
      Our campaigns provide the necessary support for international students to
      transition seamlessly into global academic life.
    </p>
    <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
      <Button
        href="/contact"
        variant="secondary"
        class="bg-white text-primary hover:bg-white/90 rounded-xl transition-all hover:scale-105 shadow-lg"
      >
        Join the Next Cycle
      </Button>
    </div>
  </div>
</section>
