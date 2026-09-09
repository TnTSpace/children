<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { BookOpen } from '@lucide/svelte';

  interface EpisodeCard {
    id: string;
    dayNumber: number;
    category: string;
    title: string;
    description: string;
    scriptureRef?: string | null;
    coverImageUrl?: string | null;
  }

  let { episode, class: className = '' }: { episode: EpisodeCard; class?: string } = $props();
</script>

<a
  href="/blogs/{episode.id}"
  class="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 {className}"
>
  <div class="relative aspect-video w-full overflow-hidden bg-muted">
    {#if episode.coverImageUrl}
      <img
        src={episode.coverImageUrl}
        alt={episode.title}
        loading="lazy"
        class="size-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    {/if}
    <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-black/0"></div>
    <Badge class="absolute top-3 left-3 border-white/20 bg-black/50 text-white backdrop-blur-sm">Day {episode.dayNumber}</Badge>
  </div>

  <div class="flex flex-1 flex-col gap-2 p-5">
    <Badge variant="outline" class="w-fit border-primary/20 bg-primary/5 text-xs text-primary uppercase">{episode.category}</Badge>
    <h3 class="line-clamp-2 text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
      {episode.title}
    </h3>
    <div class="flex-1">
      <p class="line-clamp-2 text-sm text-muted-foreground">{episode.description}</p>
    </div>
    {#if episode.scriptureRef}
      <div class="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary/80">
        <BookOpen class="size-3.5" />
        {episode.scriptureRef}
      </div>
    {/if}
  </div>
</a>
