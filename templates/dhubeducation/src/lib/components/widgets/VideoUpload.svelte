<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Video, X, Loader2, Play, Edit, Film } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";

  interface Props {
    fileId: string | null | undefined;
    videoUrl: string | null | undefined;
    onUploadSuccess: (fileId: string, url: string) => void;
    onRemove: () => void;
    label?: string;
  }

  let {
    fileId = $bindable(),
    videoUrl = $bindable(),
    onUploadSuccess,
    onRemove,
    label = "Video Testimonial",
  }: Props = $props();

  let isUploading = $state(false);
  let fileInput: HTMLInputElement;

  const handleUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file");
      return;
    }

    try {
      isUploading = true;
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        onUploadSuccess(result.id, result.directUrl);
        toast.success("Video uploaded successfully");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload video");
    } finally {
      isUploading = false;
      target.value = "";
    }
  };

  const handleRemove = () => {
    onRemove();
  };
</script>

<div class="space-y-2">
  <span
    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {label}
  </span>

  <div class="relative">
    {#if videoUrl}
      <Card.Root
        class="overflow-hidden rounded-xl border-2 border-dashed border-primary/20 group relative h-48 w-full bg-muted/30 shadow-lg flex items-center justify-center"
      >
        <video
          src={videoUrl}
          class="h-full w-full object-cover opacity-50 transition-opacity group-hover:opacity-70"
        >
          <track kind="captions" />
        </video>

        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="p-4 rounded-full bg-primary/20 text-primary backdrop-blur-sm group-hover:scale-110 transition-transform"
          >
            <Play class="h-8 w-8 fill-primary" />
          </div>
        </div>

        <div
          class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
        >
          <Button
            variant="destructive"
            size="icon"
            class="rounded-full shadow-lg h-8 w-8"
            onclick={handleRemove}
          >
            <X class="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            class="rounded-full shadow-lg h-8 w-8"
            onclick={() => fileInput.click()}
          >
            <Edit class="h-4 w-4" />
          </Button>
        </div>
      </Card.Root>
    {:else}
      <button
        type="button"
        onclick={() => fileInput.click()}
        disabled={isUploading}
        class="flex flex-col items-center justify-center h-48 w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 hover:bg-muted/20 hover:border-primary/50 transition-all group"
      >
        {#if isUploading}
          <Loader2 class="h-8 w-8 animate-spin text-primary mb-2" />
          <span class="text-sm text-muted-foreground">Uploading video...</span>
        {:else}
          <div
            class="p-3 rounded-full bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform"
          >
            <Film class="h-6 w-6" />
          </div>
          <span class="text-sm font-semibold">Click to upload video</span>
          <span class="text-xs text-muted-foreground mt-1"
            >MP4, WebM up to 50MB</span
          >
        {/if}
      </button>
    {/if}

    <input
      type="file"
      class="hidden"
      accept="video/*"
      bind:this={fileInput}
      onchange={handleUpload}
    />
  </div>
</div>
