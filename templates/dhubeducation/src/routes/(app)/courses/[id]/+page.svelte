<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { blogPath } from "$lib/seo";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import {
    GraduationCap,
    Clock,
    Globe,
    ArrowLeft,
    CheckCircle2,
    BookOpen,
    ImageIcon,
    ArrowRight,
    Sparkles,
    Send,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data }: { data: PageServerData } = $props();
  const course = $derived(data.course);
  const blogs = $derived(data.blogs?.data || []);
</script>

<Metatag
  title="{course.name} | Study Abroad with DHUB Education"
  description={course.description ||
    `Study ${course.name} abroad with DHUB Education. Professional guidance and pathways.`}
  ogImage={course.imageUrl}
/>

<!-- Course Header -->
<section
  class="relative pt-48 pb-24 md:pt-64 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 -skew-x-12 translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-4xl mx-auto text-center">
      <Button
        href="/courses"
        variant="ghost"
        class="mb-12 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl group"
      >
        <ArrowLeft
          class="mr-2 size-4 group-hover:-translate-x-1 transition-transform"
        /> Back to Catalog
      </Button>

      <Badge
        variant="outline"
        class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
        >Academic Program</Badge
      >
      <h1
        class="text-5xl md:text-8xl font-bold leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {course.name}
      </h1>

      <div
        class="flex flex-wrap items-center justify-center gap-12 text-sm font-bold uppercase text-muted-foreground"
      >
        <div class="flex items-center gap-2">
          <Clock class="size-5 text-primary" /> Full-Time / Modular
        </div>
        <div class="flex items-center gap-2">
          <Globe class="size-5 text-primary" /> Global Recognition
        </div>
        <div class="flex items-center gap-2">
          <GraduationCap class="size-5 text-primary" /> Expert Tutors
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Featured Image -->
<section class="px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32">
  <div class="max-w-6xl mx-auto">
    <div
      class="aspect-21/9 rounded-xl overflow-hidden shadow-lg border-12 border-background bg-muted animate-in fade-in zoom-in duration-1000"
    >
      {#if course.imageUrl}
        <img
          src={course.imageUrl}
          alt={course.name}
          class="size-full object-cover"
        />
      {:else}
        <div class="size-full flex items-center justify-center">
          <BookOpen class="size-24 text-muted-foreground/20" />
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Course Details -->
<section class="py-8 bg-background">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
      <!-- Main Content -->
      <div class="lg:col-span-8">
        <div class="space-y-16">
          <div>
            <h2
              class="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/50"
            >
              Program Overview
            </h2>
            <div
              class="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none font-medium leading-[1.8] text-muted-foreground"
            >
              {@html course.content}
            </div>
          </div>

          <!-- Curriculum / Features -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
            >
              <div
                class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all"
              >
                <CheckCircle2 class="size-6" />
              </div>
              <h3 class="text-xl font-bold mb-4">Accredited Excellence</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                This program is recognized by top global accreditation bodies,
                ensuring your certification holds value worldwide.
              </p>
            </div>
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
            >
              <div
                class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all"
              >
                <Sparkles class="size-6" />
              </div>
              <h3 class="text-xl font-bold mb-4">Practical Learning</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                Gain hands-on experience through workshops, real-world projects,
                and expert-led modules designed for career success.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Inquiry Sidebar -->
      <aside class="lg:col-span-4 space-y-12 sticky top-32">
        <div
          class="bg-background rounded-xl border border-primary/10 p-10 shadow-lg overflow-hidden relative"
        >
          <div
            class="absolute -top-12 -right-12 size-48 bg-primary/5 rounded-full blur-[80px]"
          ></div>
          <h4 class="text-2xl font-bold mb-10">Registration Inquiry</h4>

          <form class="space-y-6">
            <div class="space-y-2">
              <Label
                for="name"
                class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                >Full Name</Label
              >
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                class="h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="email"
                class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                >Email Address</Label
              >
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                class="h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div class="space-y-2">
              <Label
                for="phone"
                class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                >Phone Number</Label
              >
              <Input
                id="phone"
                type="tel"
                placeholder="+233..."
                class="h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <Button
              class="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group"
            >
              Submit Interest <Send
                class="ml-3 size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
              />
            </Button>

            <p
              class="text-center text-[10px] text-muted-foreground font-medium px-4"
            >
              One of our education experts will contact you within 24 hours to
              discuss your enrollment.
            </p>
          </form>
        </div>

        <!-- Contact Options -->
        <div
          class="p-10 rounded-xl bg-muted/30 border border-muted text-center space-y-6"
        >
          <h4 class="text-xs font-bold uppercase text-muted-foreground">
            Quick Contact
          </h4>
          <div class="flex flex-col gap-4">
            <a
              href="https://api.whatsapp.com/send/?phone=%2B447930739927&text=Course%20Inquiry:%20{course.name}"
              class="flex items-center justify-center gap-3 h-14 rounded-xl bg-background border border-muted font-bold text-sm hover:bg-primary/5 transition-all"
            >
              Chat on WhatsApp
            </a>
            <a
              href="mailto:dhubeducation@gmail.com"
              class="flex items-center justify-center gap-3 h-14 rounded-xl bg-background border border-muted font-bold text-sm hover:bg-primary/5 transition-all"
            >
              Request Brochure
            </a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- Explore Related Articles -->
<section class="py-8 bg-muted/10">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-4xl font-bold mb-16">Explore Related Articles</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {#each blogs.slice(0, 3) as blog}
        <a
          href={blogPath(blog)}
          class="rounded-xl bg-background border border-muted text-left overflow-hidden group hover:-translate-y-1 hover:shadow-md hover:border-primary/20 transition-all duration-500 flex flex-col"
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
              <BookOpen class="size-10 text-primary/20" />
            </div>
          {/if}
          <div class="p-8 flex-1 flex flex-col">
            <h3
              class="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors"
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
      {/each}
    </div>
    <div class="mt-16">
      <Button variant="outline" href="/blogs" class="border-primary/20"
        >View All Articles</Button
      >
    </div>
  </div>
</section>
