<script lang="ts">
  import Autoplay from 'embla-carousel-autoplay';
  import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '$lib/components/ui/carousel';
  import BlogCard from './BlogCard.svelte';

  interface EpisodeCard {
    id: string;
    dayNumber: number;
    category: string;
    title: string;
    description: string;
    scriptureRef?: string | null;
    coverImageUrl?: string | null;
  }

  let { episodes }: { episodes: EpisodeCard[] } = $props();

  const autoplay = Autoplay({ delay: 3200, stopOnInteraction: false, stopOnMouseEnter: true });
</script>

{#if episodes.length}
  <Carousel
    opts={{ loop: true, align: 'start', dragFree: true, skipSnaps: false }}
    plugins={[autoplay]}
    class="w-full"
  >
    <CarouselContent>
      {#each episodes as ep (ep.id)}
        <CarouselItem class="basis-[82%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
          <BlogCard episode={ep} class="h-full" />
        </CarouselItem>
      {/each}
    </CarouselContent>

    <!-- Inset rather than the default off-canvas position, so the buttons
         never clip regardless of how much room the surrounding container
         gives on either side. -->
    <CarouselPrevious class="start-2 size-9 border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white sm:start-4" />
    <CarouselNext class="end-2 size-9 border-white/20 bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 hover:text-white sm:end-4" />
  </Carousel>
{/if}
