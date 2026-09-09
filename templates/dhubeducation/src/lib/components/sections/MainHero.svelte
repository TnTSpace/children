<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Pause,
    Play,
    Loader2,
  } from "@lucide/svelte";
  import { fade, slide } from "svelte/transition";
  import { onMount } from "svelte";
  import VideoDialog from "$lib/components/widgets/VideoDialog.svelte";
  import { getStyle } from "$lib/constants";

  let { items = [] } = $props();

  let currentHeroIndex = $state(0);
  let isPaused = $state(false);
  let videoOpen = $state(false);
  let intervalId: any = null;

  function nextHero() {
    if (items.length === 0) return;
    currentHeroIndex = (currentHeroIndex + 1) % items.length;
  }

  function prevHero() {
    if (items.length === 0) return;
    currentHeroIndex = (currentHeroIndex - 1 + items.length) % items.length;
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    } else if (!isPaused) {
      startAutoAdvance();
    }
  }

  function startAutoAdvance() {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(nextHero, 8000); // 8 seconds per slide
  }

  onMount(() => {
    startAutoAdvance();
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  });
</script>

<section class="relative min-h-[65vh] md:min-h-0 md:aspect-[16/6] w-full overflow-hidden">
  {#if items.length > 0}
    {#each items as hero, i}
      {#if currentHeroIndex === i}
        <div class="absolute inset-0 z-0" transition:fade={{ duration: 1000 }}>
          <!-- Background image with premium treatment -->
          <div
            class="absolute inset-0 scale-105"
            style={hero.backgroundImage
              ? getStyle(hero.backgroundImage)
              : `background-image: url(/homepage_sliders/${["dhub", "blog", "contact"][i % 3]}_1600x900.webp); background-size: cover; background-position: center;`}
          >
            <div
              class="absolute inset-0 bg-black/40 dark:bg-background/60"
            ></div>
          </div>

          <!-- Content wrapper - Pushed up on mobile to avoid nav collision -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-0 md:pb-0"
          >
            <div class="flex flex-col gap-4 text-center max-w-5xl items-center">
              <!-- Animated Trust Badge -->
              <div
                class="rounded-full inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-primary/20 text-white border border-white/20 backdrop-blur-md"
                transition:slide={{ axis: "y", duration: 800 }}
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 bg-white"
                  ></span>
                </span>
                {hero.subtitle}
              </div>

              <!-- Title with dynamic separation -->
              <h1
                class="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9]"
                transition:fade={{ delay: 200, duration: 800 }}
              >
                {hero.title.split(" ").slice(0, -2).join(" ")}
                <span class="text-primary block sm:inline"
                  >{hero.title.split(" ").slice(-2).join(" ")}</span
                >
              </h1>

              <p
                class="mx-auto max-w-2xl text-white/90 text-sm md:text-base lg:text-lg leading-relaxed font-medium line-clamp-3 md:line-clamp-none"
                transition:fade={{ delay: 400, duration: 800 }}
              >
                {hero.description}
              </p>

              <!-- CTA Area -->
              <div
                class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2 md:mt-4"
                transition:fade={{ delay: 600, duration: 800 }}
              >
                <Button href={hero.primaryCta.href} class="group min-w-[200px]">
                  {hero.primaryCta.text}
                  <ArrowRight
                    class="ml-2 size-4 transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <Button
                  variant="outline"
                  class="border-white/20 text-white bg-white/5 transition-all backdrop-blur-md hover:bg-white/10 min-w-[200px]"
                  onclick={() => (videoOpen = true)}
                >
                  <Play class="mr-2 size-4 fill-current" />
                  Watch Video
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Visual Enhancements: Grid Pattern Overlay -->
    <div class="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none">
      <div
        class="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      ></div>
    </div>

    <!-- Carousel Nav Controls -->
    <div
      class="absolute inset-x-0 bottom-6 md:bottom-12 z-10 pointer-events-none"
    >
      <div
        class="center mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <div class="flex gap-2 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 w-12 bg-transparent/20"
            onclick={prevHero}
            aria-label="Previous slide"
          >
            <ChevronLeft class="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 w-12 bg-transparent/20"
            onclick={nextHero}
            aria-label="Next slide"
          >
            <ChevronRight class="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 w-12 bg-transparent/20"
            onclick={togglePause}
            aria-label={isPaused ? "Play slide" : "Pause slide"}
          >
            {#if isPaused}
              <Play class="h-5 w-5 fill-current" />
            {:else}
              <Pause class="h-5 w-5 fill-current" />
            {/if}
          </Button>
        </div>

        <!-- Indicators -->
        <div class="flex gap-3 pointer-events-auto items-center">
          {#each items as _, i}
            <button
              class="h-1.5 rounded-full transition-all duration-500 {currentHeroIndex ===
              i
                ? 'bg-primary w-12'
                : 'bg-white/40 w-3 hover:bg-white/60'}"
              onclick={() => (currentHeroIndex = i)}
              aria-label="Go to slide {i + 1}"
            ></button>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="flex h-full items-center justify-center bg-muted/20">
      <Loader2 class="size-8 animate-spin text-primary/50" />
    </div>
  {/if}
</section>

<VideoDialog bind:open={videoOpen} />

<style>
  /* Optional: Custom float animations can be added here if needed */
  :global(.animate-float) {
    animation: float 6s ease-in-out infinite;
  }
  @keyframes float {
    0%,
    100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }
</style>
