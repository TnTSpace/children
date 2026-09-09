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
    GraduationCap,
    Clock,
    Banknote,
    ArrowRight,
    AlertCircle,
    Sparkles,
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

  const courses = $derived(data.courses?.data?.data || []);
  const total = $derived(data.courses?.data?.total || 0);
</script>

<Metatag title="Global Courses" />

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
          >Course Catalog</Badge
        >
        <h1 class="text-6xl font-bold sm:text-8xl leading-[0.85] mb-8">
          Your Future, <span class="text-primary">Unlocked.</span>
        </h1>
        <p class="text-lg text-muted-foreground font-medium leading-relaxed">
          Explore hundreds of world-class programs across our partner
          universities. Find the perfect fit for your academic goals and career
          aspirations.
        </p>
      </div>

      <div class="w-full md:w-96">
        <div class="relative group">
          <div
            class="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500"
          ></div>
          <div class="relative">
            <Search
              class="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5"
            />
            <Input
              bind:value={searchTerm}
              placeholder="Search courses..."
              class="pl-12 h-14 rounded-xl border-primary/10 bg-background/80 backdrop-blur-xl transition-all focus-visible:ring-primary/20 text-lg font-medium"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Alert / Notice -->
    <div
      class="flex items-center gap-4 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 mb-12 animate-in fade-in slide-in-from-left-4 duration-700"
    >
      <AlertCircle class="size-5 shrink-0" />
      <p class="text-sm font-bold uppercase">
        Limited availability: Some courses are specifically verified for UK
        placements. Contact an expert for details.
      </p>
    </div>
  </div>
</section>

<!-- Content Grid -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    {#if courses.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {#each courses as course, i (course.id)}
          <div in:fade={{ delay: i * 50, duration: 500 }} out:fade>
            <Card
              class="rounded-xl border-primary/5 bg-background shadow-lg hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden hover:-translate-y-4"
            >
              <div
                class="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors duration-500"
              ></div>
              <CardHeader class="p-10 pb-6">
                <div class="flex justify-between items-start mb-6">
                  <div
                    class="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500"
                  >
                    <GraduationCap class="size-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    class="rounded-lg px-3 py-1 font-bold text-[10px] uppercase"
                    >Verified</Badge
                  >
                </div>
                <CardTitle
                  class="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-500"
                >
                  {course.name}
                </CardTitle>
                {#if course.title}
                  <CardDescription
                    class="text-primary font-bold text-sm uppercase mt-2"
                    >{course.title}</CardDescription
                  >
                {/if}
              </CardHeader>
              <CardContent class="p-10 pt-0 grow">
                <p
                  class="text-muted-foreground font-medium leading-relaxed line-clamp-3 mb-8"
                >
                  {course.description}
                </p>

                <div class="space-y-4 pt-6 border-t border-muted">
                  <div
                    class="flex items-center gap-3 text-foreground/80 font-bold"
                  >
                    <Clock class="size-4 text-primary" />
                    <span class="text-sm">Flexible Intakes</span>
                  </div>
                  <div
                    class="flex items-center gap-3 text-foreground/80 font-bold"
                  >
                    <Banknote class="size-4 text-primary" />
                    <span class="text-sm">Scholarships Available</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter class="p-10 pt-0">
                <Button
                  href="/auth/login?redirectTo=/dashboard"
                  class="w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all group"
                >
                  Start Application <ArrowRight
                    class="ml-3 size-5 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </CardFooter>
            </Card>
          </div>
        {/each}
      </div>

      {#if total > courses.length}
        <div class="mt-20 text-center">
          <Button
            variant="outline"
            class="rounded-xl border-primary/20 transition-all"
          >
            Load More Courses
          </Button>
        </div>
      {/if}
    {:else}
      <div
        class="flex flex-col items-center justify-center py-8 text-center"
        in:fade
      >
        <div
          class="size-24 rounded-xl bg-muted/50 flex items-center justify-center mb-8 relative"
        >
          <Search class="size-10 text-muted-foreground" />
          <div
            class="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg animate-bounce"
          >
            <Sparkles class="size-4" />
          </div>
        </div>
        <h3 class="text-3xl font-bold mb-4">No Courses Found</h3>
        <p class="text-muted-foreground max-w-md font-medium px-4">
          Try adjusting your search terms or contact our experts to find
          specialized programs.
        </p>
        <Button
          variant="outline"
          class="mt-10 rounded-xl border-primary/20"
          onclick={() => (searchTerm = "")}
        >
          Clear Search
        </Button>
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
      Don't See Your Dream Course?
    </h2>
    <p
      class="text-primary-foreground/80 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12"
    >
      We partner with 500+ universities worldwide. Our advisors can help you
      find exactly what you're looking for.
    </p>
    <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
      <Button
        href="/contact"
        variant="secondary"
        class="bg-white text-primary hover:bg-white/90 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg"
      >
        Consult an Advisor
      </Button>
    </div>
  </div>
</section>
