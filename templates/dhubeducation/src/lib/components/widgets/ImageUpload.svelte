<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ImagePlus, X, Loader2, ImageIcon, Edit } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";

  interface Props {
    fileId: string | null | undefined;
    imageUrl: string | null | undefined;
    onUploadSuccess: (fileId: string, url: string) => void;
    onRemove: () => void;
    label?: string;
  }

  let {
    fileId = $bindable(),
    imageUrl = $bindable(),
    onUploadSuccess,
    onRemove,
    label = "Image",
  }: Props = $props();

  let isUploading = $state(false);
  let fileInput: HTMLInputElement;

  const handleUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
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
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    } finally {
      isUploading = false;
      target.value = "";
    }
  };

  const handleRemove = async () => {
    if (!fileId) return;

    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ id: fileId }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.success) {
        onRemove();
        toast.success("Image removed successfully");
      } else {
        throw new Error(result.error || "Failed to remove image");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove image");
      // Even if API fails, we might want to clear local state to allow re-upload
      // but usually better to stick to the actual state.
    }
  };
</script>

<div class="space-y-2">
  <span
    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    {label}
  </span>

  <div class="relative">
    {#if imageUrl}
      <Card.Root
        class="overflow-hidden rounded-xl border-2 border-dashed border-primary/20 group relative h-48 w-full bg-muted/30 shadow-lg"
      >
        <img
          src={imageUrl}
          alt="Preview"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
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
          <span class="text-sm text-muted-foreground">Uploading...</span>
        {:else}
          <div
            class="p-3 rounded-full bg-primary/10 text-primary mb-2 group-hover:scale-110 transition-transform"
          >
            <ImagePlus class="h-6 w-6" />
          </div>
          <span class="text-sm font-semibold">Click to upload image</span>
          <span class="text-xs text-muted-foreground mt-1"
            >PNG, JPG, WebP up to 10MB</span
          >
        {/if}
      </button>
    {/if}

    <input
      type="file"
      class="hidden"
      accept="image/*"
      bind:this={fileInput}
      onchange={handleUpload}
    />
  </div>
</div>

<style>
  /* Optional: any specific micro-animations */
</style>
