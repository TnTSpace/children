<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  let { links = [] } = $props();

  function scrollTo(id: string) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
</script>

<div
  class="sticky top-[117px] md:top-[4.5rem] z-40 flex flex-wrap gap-2 p-1.5 bg-background/95 backdrop-blur-sm rounded-xl border border-border/50 shadow-sm transition-all"
>
  {#each links as link}
    <Button
      variant="ghost"
      size="sm"
      onclick={() => scrollTo(link.id)}
      class="gap-2 rounded-lg text-xs font-medium"
    >
      {#if link.icon}
        <link.icon class="size-3" />
      {/if}
      {link.label}
    </Button>
  {/each}
</div>
