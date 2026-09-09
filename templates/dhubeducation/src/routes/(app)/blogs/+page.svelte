<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { blogPath } from "$lib/seo";
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
    User,
    ArrowRight,
    ImageIcon,
    Sparkles,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { Debounced } from "runed";
  import NewsletterForm from "$lib/components/sections/NewsletterForm.svelte";
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

  const blogs = $derived(data.blogs?.data?.data || []);
  const featuredBlog = $derived(blogs.length > 0 ? blogs[0] : null);
  const otherBlogs = $derived(blogs.length > 1 ? blogs.slice(1) : []);
  const total = $derived(data.blogs?.data?.total || 0);

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<Metatag title="Insights & News" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 -skew-x-12 translate-x-1/4"
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
          >Our Stories</Badge
        >
        <h1 class="text-6xl font-bold sm:text-8xl leading-[0.85] mb-8">
          Insights for your <span class="text-primary italic">Success.</span>
        </h1>
        <p class="text-lg text-muted-foreground font-medium leading-relaxed">
          Stay informed with the latest trends in international education,
          admission tips, and stories from our global student community.
        </p>
      </div>

      <div class="w-full md:w-96">
        <div class="relative group">
          <Search
            class="absolute z-50 left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5"
          />
          <Input
            bind:value={searchTerm}
            placeholder="Search articles..."
            class="pl-12 border-primary/10 bg-background/80 backdrop-blur-xl transition-all focus-visible:ring-primary/20"
          />
        </div>
      </div>
    </div>

    <!-- Featured Post -->
    {#if featuredBlog && !searchTerm}
      <div in:fade={{ duration: 800 }}>
        <a
          href={blogPath(featuredBlog)}
          class="block group relative overflow-hidden rounded-xl bg-muted/20 border border-muted hover:border-primary/20 transition-all duration-700"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2">
            <div class="aspect-16/10 overflow-hidden">
              {#if featuredBlog.imageUrl}
                <img
                  src={featuredBlog.imageUrl}
                  alt={featuredBlog.title}
                  class="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
              {:else}
                <div
                  class="size-full bg-muted flex items-center justify-center"
                >
                  <ImageIcon class="size-12 text-muted-foreground/20" />
                </div>
              {/if}
            </div>
            <div class="p-10 md:p-16 flex flex-col justify-center">
              <Badge
                variant="secondary"
                class="w-fit mb-6 px-4 py-1 rounded-full font-bold text-[10px] uppercase"
                >Featured Story</Badge
              >
              <h2
                class="text-4xl md:text-5xl font-bold leading-[0.9] mb-8 group-hover:text-primary transition-colors"
              >
                {featuredBlog.title}
              </h2>
              <p
                class="text-lg text-muted-foreground font-medium leading-relaxed mb-10 line-clamp-3"
              >
                {featuredBlog.description}
              </p>
              <div
                class="flex items-center gap-6 mb-10 text-xs font-bold uppercase text-muted-foreground"
              >
                <div class="flex items-center gap-2">
                  <Calendar class="size-4" />
                  {formatDate(featuredBlog.createdAt)}
                </div>
                <div class="flex items-center gap-2">
                  <Clock class="size-4" /> 5 min read
                </div>
              </div>
              <div
                class="flex items-center gap-3 text-primary font-bold text-sm uppercase group-hover:translate-x-2 transition-transform"
              >
                Read Full Article <ArrowRight class="size-4" />
              </div>
            </div>
          </div>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Blog Grid -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    {#if blogs.length > (searchTerm ? 0 : 1)}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {#each searchTerm ? blogs : otherBlogs as post, i (post.id)}
          <div in:fade={{ delay: i * 50, duration: 500 }}>
            <a href={blogPath(post)} class="block group h-full">
              <Card
                class="rounded-xl border-primary/5 bg-background shadow-lg hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden border hover:border-primary/20 hover:-translate-y-4 h-full flex flex-col"
              >
                <div class="aspect-video overflow-hidden">
                  {#if post.imageUrl}
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      class="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110"
                    />
                  {:else}
                    <div
                      class="size-full bg-muted flex items-center justify-center"
                    >
                      <ImageIcon class="size-8 text-muted-foreground/20" />
                    </div>
                  {/if}
                </div>
                <CardHeader class="p-8 pb-4">
                  <div
                    class="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase text-muted-foreground"
                  >
                    <span class="flex items-center gap-1.5"
                      ><Calendar class="size-3" />
                      {formatDate(post.createdAt)}</span
                    >
                  </div>
                  <CardTitle
                    class="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2"
                  >
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent class="p-8 pt-0 grow">
                  <p
                    class="text-sm text-muted-foreground font-medium leading-relaxed line-clamp-3"
                  >
                    {post.description}
                  </p>
                </CardContent>
                <CardFooter
                  class="p-8 pt-0 flex items-center justify-between mt-auto"
                >
                  <span
                    class="text-xs font-bold uppercase text-primary opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1"
                    >Read More</span
                  >
                  <div
                    class="size-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500"
                  >
                    <ArrowRight class="size-4" />
                  </div>
                </CardFooter>
              </Card>
            </a>
          </div>
        {/each}
      </div>

      {#if total > blogs.length}
        <div class="mt-20 text-center">
          <Button
            variant="outline"
            class="rounded-xl border-primary/20 transition-all"
          >
            Load More Insights
          </Button>
        </div>
      {/if}
    {:else if !searchTerm || blogs.length === 0}
      <div class="py-8 text-center">
        <div
          class="size-24 rounded-xl bg-muted/50 flex items-center justify-center mb-8 mx-auto relative"
        >
          <Search class="size-10 text-muted-foreground" />
          {#if blogs.length === 0}
            <div
              class="absolute -top-2 -right-2 bg-primary text-white p-2 rounded-full shadow-lg animate-bounce"
            >
              <Sparkles class="size-4" />
            </div>
          {/if}
        </div>
        <h3 class="text-3xl font-bold mb-4">No insights found</h3>
        <p class="text-muted-foreground max-w-md mx-auto font-medium">
          Try adjusting your search terms or check back later for new articles
          and updates.
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

<!-- Bottom Section -->
<section class="py-8 bg-muted/10">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <Badge
      variant="outline"
      class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
      >Stay in the loop</Badge
    >
    <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-8">
      Follow Our Global Updates
    </h2>
    <p class="max-w-xl mx-auto text-lg text-muted-foreground font-medium mb-12">
      Join our community of over 10,000+ students and get the latest educational
      insights delivered to your inbox.
    </p>
    <NewsletterForm variant="inline" />
  </div>
</section>
