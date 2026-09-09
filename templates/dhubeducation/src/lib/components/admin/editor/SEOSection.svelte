<script lang="ts">
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Globe, Trash2, ImageIcon, Upload, Loader2 } from "@lucide/svelte";

  let {
    title = $bindable(),
    description = $bindable(),
    ogImage = $bindable(),
    isUploadingOg = false,
    onImageUpload,
  } = $props();
</script>

<section id="seo" class="scroll-mt-32 space-y-6">
  <div class="flex items-center gap-2 px-1">
    <div class="bg-primary/10 p-2 rounded-lg text-primary">
      <Globe class="size-5" />
    </div>
    <div>
      <h2 class="text-lg font-bold">Search Engine Optimization</h2>
      <p class="text-sm text-muted-foreground leading-none">
        Meta tags and OG image for shareability
      </p>
    </div>
  </div>

  <Card.Root class="overflow-hidden border-border/60 shadow-md">
    <Card.Content class="p-4 space-y-8">
      <div class="grid gap-6 md:grid-cols-2">
        <div class="space-y-4">
          <div class="space-y-2">
            <Label
              for="meta-title"
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Page Meta Title</Label
            >
            <Input
              id="meta-title"
              bind:value={title}
              placeholder="e.g. Home | DHUB Education"
              class="rounded-lg border-muted-foreground/20 focus-visible:ring-primary"
            />
          </div>
          <div class="space-y-2">
            <Label
              for="meta-desc"
              class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >Page Meta Description</Label
            >
            <Textarea
              id="meta-desc"
              bind:value={description}
              placeholder="Brief description for search engines"
              rows={4}
              class="rounded-xl border-muted-foreground/20 focus-visible:ring-primary"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label
            class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
            >OG Image (1200x630)</Label
          >
          <div
            class="relative aspect-[1.91/1] rounded-xl overflow-hidden bg-muted/30 border-2 border-dashed border-border/60 group"
          >
            {#if ogImage}
              <img
                src={ogImage}
                alt="OG Preview"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/60 transition-all"
              >
                <Button
                  variant="destructive"
                  size="icon"
                  class="rounded-full h-10 w-10 shadow-lg"
                  onclick={() => (ogImage = "")}
                >
                  <Trash2 class="size-5" />
                </Button>
              </div>
            {:else}
              <div
                class="flex flex-col items-center justify-center h-full gap-2 text-center p-4"
              >
                <ImageIcon class="size-8 text-muted-foreground/40" />
                <p class="text-xs text-muted-foreground">
                  Share image for social media
                </p>
              </div>
            {/if}
            {#if isUploadingOg}
              <div
                class="absolute inset-0 bg-background/80 flex items-center justify-center"
              >
                <Loader2 class="size-6 animate-spin text-primary" />
              </div>
            {/if}
          </div>
          <div class="flex gap-2">
            <Input
              bind:value={ogImage}
              placeholder="Or paste URL here..."
              class="text-xs h-8"
            />
            <label class="cursor-pointer shrink-0">
              <div
                class="flex items-center gap-2 h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium transition-colors"
              >
                {#if isUploadingOg}
                  <Loader2 class="size-3 animate-spin" />
                  Uploading...
                {:else}
                  <Upload class="size-3" />
                  Upload
                {/if}
              </div>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                onchange={(e) => onImageUpload && onImageUpload(e, "og")}
                disabled={isUploadingOg}
              />
            </label>
          </div>
        </div>
      </div>
    </Card.Content>
  </Card.Root>
</section>
