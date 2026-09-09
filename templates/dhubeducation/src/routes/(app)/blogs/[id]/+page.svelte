<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Calendar,
    Clock,
    ArrowLeft,
    Share2,
    MessageCircle,
    Facebook,
    Twitter,
    Linkedin,
    ImageIcon,
    User,
    ArrowRight,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import NewsletterForm from "$lib/components/sections/NewsletterForm.svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
  import { blogPath, clamp } from "$lib/seo";

  let { data }: { data: PageServerData } = $props();
  const post = $derived(data.blog);
  const relatedBlogs = $derived(data.relatedBlogs || []);

  // Prefer the keyword-tuned title/description the generator produced, falling
  // back to the editorial ones for hand-written posts.
  const metaTitle = $derived(clamp(data.seo?.metaTitle || post.title, 60));
  const metaDescription = $derived(
    clamp(data.seo?.metaDescription || post.description, 158),
  );
  const metaKeywords = $derived(
    [
      data.seo?.primaryKeyword,
      ...(data.seo?.secondaryKeywords ?? []),
      post.category && post.category !== "General" ? post.category : null,
      "study abroad",
      "Dhub Education",
    ].filter(Boolean) as string[],
  );

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<Metatag
  title={metaTitle}
  description={metaDescription}
  keywords={metaKeywords}
  ogImage={post.imageUrl}
  ogType="article"
  canonical={data.canonical}
  publishedTime={new Date(post.createdAt).toISOString()}
  modifiedTime={new Date(post.updatedAt ?? post.createdAt).toISOString()}
  section={post.category ?? undefined}
  jsonLd={data.jsonLd}
/>

<!-- Hero Banner Image -->
<section class="relative bg-background">
  <!-- Back Button - overlaid on image -->
  <div class="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
    <Button
      href="/blogs"
      variant="ghost"
      class="bg-background/80 backdrop-blur-sm hover:bg-background text-foreground transition-all rounded-xl group"
    >
      <ArrowLeft
        class="mr-2 size-4 group-hover:-translate-x-1 transition-transform"
      /> Back to Insights
    </Button>
  </div>

  <!-- Featured Image - full width, landscape, no cropping -->
  <div class="w-full aspect-video bg-muted overflow-hidden">
    {#if post.imageUrl}
      <img
        src={post.imageUrl}
        alt={post.title}
        class="size-full object-cover animate-in fade-in zoom-in-95 duration-700"
      />
    {:else}
      <div class="size-full flex items-center justify-center">
        <ImageIcon class="size-20 text-muted-foreground/20" />
      </div>
    {/if}
  </div>
</section>

<!-- Article Header -->
<section class="bg-background border-b border-border">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
    <div class="max-w-4xl mx-auto">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <Badge
          variant="outline"
          class="border-primary/20 bg-primary/5 text-primary px-3 py-1 rounded-lg uppercase text-[10px] font-bold"
        >
          {post.category || "Insights"}
        </Badge>
      </div>

      <h1
        class="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500"
      >
        {post.title}
      </h1>

      {#if post.description}
        <p class="text-lg text-muted-foreground font-medium mb-6 max-w-2xl">
          {post.description}
        </p>
      {/if}

      <div
        class="flex flex-wrap items-center gap-6 text-xs font-medium text-muted-foreground"
      >
        <div class="flex items-center gap-2">
          <Calendar class="size-4 text-primary" />
          <span>{formatDate(post.createdAt)}</span>
        </div>
        <div class="flex items-center gap-2">
          <Clock class="size-4 text-primary" />
          <span>{data.readingMinutes} min read</span>
        </div>
        <div class="flex items-center gap-2">
          <User class="size-4 text-primary" />
          <span>Dhub Editorial</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Article Content -->
<section class="py-12 md:py-16 bg-background">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
      <!-- Content -->
      <div class="lg:col-span-8">
        <div
          class="prose prose-zinc lg:prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-muted-foreground prose-headings:text-foreground prose-headings:font-bold prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        >
          {@html post.content}
        </div>

        <!-- Share & Tags -->
        <div
          class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
        >
          <div class="flex items-center gap-4">
            <span class="text-xs font-bold uppercase text-muted-foreground"
              >Share:</span
            >
            <div class="flex gap-2">
              {#each [Facebook, Twitter, Linkedin, Share2] as SocialIcon}
                <Button
                  variant="outline"
                  size="icon"
                  class="rounded-lg border-border hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <SocialIcon class="size-4" />
                </Button>
              {/each}
            </div>
          </div>

          <div class="flex gap-2">
            <Badge
              variant="secondary"
              class="rounded-lg px-3 py-1 font-bold text-[10px] uppercase"
              >Education</Badge
            >
            <Badge
              variant="secondary"
              class="rounded-lg px-3 py-1 font-bold text-[10px] uppercase"
              >Planning</Badge
            >
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 space-y-8 lg:sticky lg:top-24">
        <!-- Newsletter -->
        <div
          class="p-6 md:p-8 rounded-xl bg-muted/20 border border-border relative overflow-hidden group"
        >
          <div
            class="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"
          ></div>
          <h4 class="text-lg font-bold mb-3">Stay Informed</h4>
          <p class="text-sm text-muted-foreground font-medium mb-6">
            Get the latest insights on global education delivered directly to
            your inbox.
          </p>
          <NewsletterForm variant="full" />
        </div>

        <!-- Call to Action -->
        <div
          class="p-6 md:p-8 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"
        >
          <h4 class="text-xl font-bold mb-4">Need expert advice?</h4>
          <p class="text-primary-foreground/80 font-medium mb-6 text-sm">
            Our advisors can help you design your future. Book a free
            consultation today.
          </p>
          <Button variant="secondary" href="/contact" class="w-full">
            Talk to an Expert
          </Button>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- More Stories -->
{#if relatedBlogs.length > 0}
  <section class="py-12 md:py-16 bg-muted/10 border-t border-border">
    <div class="center mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-10">Read More Stories</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each relatedBlogs as blog, i}
          <div in:fade={{ delay: i * 50, duration: 500 }}>
            <a
              href={blogPath(blog)}
              class="rounded-xl bg-background border border-border text-left overflow-hidden group hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-500 flex flex-col h-full"
            >
              {#if blog.imageUrl}
                <div class="aspect-video overflow-hidden">
                  <img
                    src={blog.imageUrl}
                    alt={blog.title}
                    class="size-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              {:else}
                <div
                  class="aspect-video bg-muted/30 flex items-center justify-center"
                >
                  <ImageIcon class="size-10 text-muted-foreground/20" />
                </div>
              {/if}
              <div class="p-6 flex-1 flex flex-col">
                <h3
                  class="text-base font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors"
                >
                  {blog.title}
                </h3>
                <p
                  class="text-sm text-muted-foreground font-medium line-clamp-2 mb-4"
                >
                  {blog.description}
                </p>
                <div
                  class="mt-auto flex items-center gap-2 text-primary text-xs font-bold"
                >
                  Read More <ArrowRight
                    class="size-3 group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>
      <div class="mt-10">
        <Button variant="outline" href="/blogs" class="border-primary/20"
          >View All Articles</Button
        >
      </div>
    </div>
  </section>
{/if}
