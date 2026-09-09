<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { X } from "@lucide/svelte";

  let { open = $bindable(false), videoUrl = "" } = $props();

  // Helper to determine if it's an embed or direct link
  const isEmbed = $derived(
    videoUrl.includes("youtube.com") ||
      videoUrl.includes("youtu.be") ||
      videoUrl.includes("vimeo.com"),
  );

  // Helper to get correct embed URL for YouTube/Vimeo
  const processedUrl = $derived(() => {
    if (!videoUrl) return "";
    if (videoUrl.includes("youtube.com/watch?v=")) {
      return videoUrl.replace("watch?v=", "embed/");
    }
    if (videoUrl.includes("youtu.be/")) {
      return `https://www.youtube.com/embed/${videoUrl.split("/").pop()}`;
    }
    return videoUrl;
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content
    class="sm:max-w-[800px] p-0 overflow-hidden bg-black border-primary/20 rounded-xl shadow-2xl"
  >
    <div
      class="relative aspect-video w-full bg-black flex items-center justify-center"
    >
      {#if isEmbed}
        <iframe
          src={processedUrl()}
          title="Video Player"
          class="absolute inset-0 h-full w-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      {:else}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video src={videoUrl} controls autoplay class="max-h-full max-w-full"
        ></video>
      {/if}

      <div class="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          class="rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-md size-10"
          onclick={() => (open = false)}
        >
          <X class="size-6" />
        </Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
