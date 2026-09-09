<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { ChevronLeft, Save, Loader2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  let {
    title,
    isSubmitting = false,
    onSave,
    backUrl = "/admin/pages",
  } = $props();
</script>

<div
  class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b pb-4 -mx-4 px-4 pt-4 flex flex-col md:flex-row gap-2 items-center justify-between"
>
  <div class="flex justify-start items-center gap-4 w-full md:w-fit">
    <Button
      variant="ghost"
      size="icon"
      onclick={() => goto(backUrl)}
      class="rounded-full"
    >
      <ChevronLeft class="size-5" />
    </Button>
    <div>
      <h1 class="text-xl font-bold tracking-tight">{title}</h1>
    </div>
  </div>
  <div class="flex items-center gap-3 w-full md:w-fit">
    <Button
      onclick={onSave}
      disabled={isSubmitting}
      class="gap-2 shadow-lg shadow-primary/20 rounded-xl w-full sm:w-fit"
    >
      {#if isSubmitting}
        <Loader2 class="size-4 animate-spin" />
        Saving...
      {:else}
        <Save class="size-4" />
        Save Changes
      {/if}
    </Button>
  </div>
</div>
