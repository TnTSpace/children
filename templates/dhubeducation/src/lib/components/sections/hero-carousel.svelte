<script lang="ts">
  import { getStyle } from "$lib/constants";
  import { Button } from "$lib/components/ui/button";
  import { ArrowRight, ChevronLeft, ChevronRight } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  let { heroData = [] } = $props();

  let currentHeroIndex = $state(0);

  function nextHero() {
    if (heroData.length === 0) return;
    currentHeroIndex = (currentHeroIndex + 1) % heroData.length;
  }

  function prevHero() {
    if (heroData.length === 0) return;
    currentHeroIndex =
      (currentHeroIndex - 1 + heroData.length) % heroData.length;
  }
</script>

<section
  class="relative h-[600px] md:h-[700px] lg:h-[800px] w-full overflow-hidden"
>
  {#if heroData.length > 0}
    {#each heroData as hero, i}
      {#if currentHeroIndex === i}
        <div class="absolute inset-0 z-0" transition:fade={{ duration: 1000 }}>
          <!-- Background image -->
          <div
            class="absolute inset-0 scale-105"
            style="{getStyle(
              hero.backgroundImage,
            )} background-size: cover; background-position: center;"
          >
            <div
              class="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-[2px]"
            ></div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"
            ></div>
          </div>

          <!-- Content -->
          <div
            class="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center"
          >
            <div class="flex flex-col gap-8 max-w-5xl items-center">
              <!-- Trust badge -->
              <div
                class="rounded-full inline-flex items-center gap-2 px-6 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all cursor-default uppercase"
                transition:fade={{ delay: 200, duration: 800 }}
              >
                <span class="relative flex h-2 w-2">
                  <span
                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"
                  ></span>
                  <span
                    class="relative inline-flex rounded-full h-2 w-2 bg-primary"
                  ></span>
                </span>
                {hero.subtitle}
              </div>

              <h1
                class="text-5xl font-bold md:text-7xl lg:text-9xl text-white leading-[1.1] drop-shadow-2xl"
                transition:fade={{ delay: 400, duration: 800 }}
              >
                {hero.title.split(" ").slice(0, -2).join(" ")}
                <span class="text-primary italic font-bold"
                  >{hero.title.split(" ").slice(-2).join(" ")}</span
                >
              </h1>

              <p
                class="mx-auto max-w-xl text-sm md:text-base text-white/80 leading-relaxed font-medium"
                transition:fade={{ delay: 600, duration: 800 }}
              >
                {hero.description}
              </p>

              <!-- CTA buttons -->
              <div
                class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center"
                transition:fade={{ delay: 800, duration: 800 }}
              >
                <Button
                  href={hero.primaryCta.href}
                  class="min-w-[180px] rounded-xl shadow-lg transition-all group"
                >
                  {hero.primaryCta.text}
                  <ArrowRight
                    class="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
                  />
                </Button>
                <Button
                  href={hero.secondaryCta.href}
                  variant="outline"
                  class="min-w-[180px] border-white/30 text-white bg-white/5 hover:bg-white/10 transition-all rounded-xl backdrop-blur-xl"
                >
                  {hero.secondaryCta.text}
                </Button>
              </div>
            </div>
          </div>
        </div>
      {/if}
    {/each}

    <!-- Carousel Navigation Overlay -->
    <div class="absolute inset-x-0 bottom-12 z-20 pointer-events-none">
      <div
        class="center mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      >
        <div class="flex gap-3 pointer-events-auto">
          <Button
            variant="outline"
            size="icon"
            class="rounded-full size-12 border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all group"
            onclick={prevHero}
          >
            <ChevronLeft class="h-6 w-6 group-hover:-translate-x-0.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            class="rounded-full size-12 border-white/20 text-white hover:bg-white/10 backdrop-blur-md transition-all group"
            onclick={nextHero}
          >
            <ChevronRight class="h-6 w-6 group-hover:translate-x-0.5" />
          </Button>
        </div>

        <!-- Progressive Indicators -->
        <div class="flex gap-4 pointer-events-auto items-center">
          {#each heroData as _, i}
            <button
              class="group h-1 relative overflow-hidden transition-all {currentHeroIndex ===
              i
                ? 'w-12'
                : 'w-4'}"
              onclick={() => (currentHeroIndex = i)}
            >
              <div class="absolute inset-0 bg-white/20 rounded-full"></div>
              {#if currentHeroIndex === i}
                <div
                  class="absolute inset-0 bg-primary rounded-full animate-progress-line"
                  style="animation-duration: 5000ms"
                ></div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  {:else}
    <div class="absolute inset-0 flex items-center justify-center bg-muted">
      <p class="text-muted-foreground animate-pulse">Loading content...</p>
    </div>
  {/if}
</section>

<style>
  @keyframes progress-line {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .animate-progress-line {
    animation: progress-line linear forwards;
  }
</style>
