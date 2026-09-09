<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import {
    Search,
    HelpCircle,
    MessageCircle,
    ArrowRight,
    Sparkles,
    Plus,
    Minus,
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

  const faqs = $derived(data.faqs?.data?.data || []);
</script>

<Metatag title="Frequently Asked Questions" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute bottom-0 left-0 w-1/2 h-full bg-primary/3 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <Badge
      variant="outline"
      class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
      >Help Center</Badge
    >
    <h1 class="text-6xl font-bold sm:text-9xl leading-[0.85] mb-12">
      Your Questions, <span class="text-primary italic">Resolved.</span>
    </h1>
    <p
      class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto mb-16"
    >
      Everything you need to know about international study, admissions, visas,
      and global educational support.
    </p>

    <!-- Search Bar -->
    <div class="max-w-xl mx-auto relative group">
      <Search
        class="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground size-6 group-focus-within:text-primary transition-colors"
      />
      <Input
        bind:value={searchTerm}
        placeholder="Search for answers..."
        class="pl-16 h-16 rounded-xl border-primary/10 bg-background/80 backdrop-blur-2xl transition-all focus-visible:ring-primary/20 text-lg font-medium shadow-lg"
      />
    </div>
  </div>
</section>

<!-- FAQ Accordion -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      {#if faqs.length > 0}
        <Accordion.Root type="single" class="space-y-6">
          {#each faqs as faq, i (faq.id)}
            <div in:fly={{ y: 20, delay: i * 50, duration: 500 }}>
              <Accordion.Item
                value={faq.id}
                class="rounded-xl border border-primary/5 bg-background shadow-lg hover:shadow-lg transition-all duration-500 overflow-hidden px-4"
              >
                <Accordion.Trigger class="px-6 py-8 hover:no-underline group">
                  <div class="flex items-start gap-6 text-left">
                    <div
                      class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500"
                    >
                      <HelpCircle class="size-5" />
                    </div>
                    <span
                      class="text-xl font-bold leading-tight group-hover:text-primary transition-colors"
                    >
                      {faq.question}
                    </span>
                  </div>
                </Accordion.Trigger>
                <Accordion.Content class="px-10 pb-10 pt-4">
                  <div
                    class="prose prose-zinc dark:prose-invert max-w-none text-muted-foreground font-medium text-lg leading-relaxed ml-10"
                  >
                    {@html faq.answer}
                  </div>
                </Accordion.Content>
              </Accordion.Item>
            </div>
          {/each}
        </Accordion.Root>
      {:else}
        <div class="py-8 text-center">
          <div
            class="size-24 rounded-xl bg-muted/50 flex items-center justify-center mb-8 mx-auto"
          >
            <Search class="size-10 text-muted-foreground" />
          </div>
          <h3 class="text-3xl font-bold mb-4">No results found</h3>
          <p class="text-muted-foreground max-w-md mx-auto font-medium">
            We couldn't find any answers matching your search. Try different
            keywords or contact our support hub.
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
  </div>
</section>

<!-- Still have questions? -->
<section class="py-8 bg-muted/10">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="relative rounded-xl bg-background border border-primary/10 p-12 md:p-24 overflow-hidden shadow-lg"
    >
      <div
        class="absolute -top-24 -right-24 size-96 bg-primary/5 rounded-full blur-[100px]"
      ></div>
      <div
        class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
      >
        <div>
          <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-8">
            Still Have <span class="text-primary italic">Questions?</span>
          </h2>
          <p class="text-xl text-muted-foreground font-medium mb-12">
            Our team is ready to provide personalized clarity on any aspect of
            your educational journey.
          </p>
          <div class="flex flex-wrap gap-4">
            <Button
              href="/contact"
              class="rounded-xl shadow-lg hover:scale-105 transition-all"
            >
              Contact Support Hub
            </Button>
            <Button
              variant="outline"
              href="https://api.whatsapp.com/send/?phone=%2B447930739927&text=Hello"
              class="rounded-xl border-primary/10 hover:bg-primary/5"
            >
              WhatsApp Us
            </Button>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-6">
          <div
            class="p-8 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
          >
            <MessageCircle class="size-8 text-primary mb-6" />
            <h4 class="font-bold mb-2">Live Chat</h4>
            <p class="text-xs text-muted-foreground font-medium">
              Connect with an expert in real-time.
            </p>
          </div>
          <div
            class="p-8 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
          >
            <Sparkles class="size-8 text-primary mb-6" />
            <h4 class="font-bold mb-2">Expert Tips</h4>
            <p class="text-xs text-muted-foreground font-medium">
              Get curated advice for your profile.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
