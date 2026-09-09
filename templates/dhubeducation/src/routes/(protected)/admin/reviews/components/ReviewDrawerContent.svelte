<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import ImageUpload from "$lib/components/widgets/ImageUpload.svelte";
  import VideoUpload from "$lib/components/widgets/VideoUpload.svelte";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import type { iReview } from "$lib/interface";
  import * as Card from "$lib/components/ui/card/index.js";

  interface Props {
    item: Partial<iReview>;
    mode: "view" | "edit" | "create";
  }

  let { item = $bindable(), mode }: Props = $props();

  const handleImageSuccess = (id: string, directUrl: string) => {
    item.imageId = id;
    item.imageUrl = directUrl;
  };

  const handleVideoSuccess = (id: string, directUrl: string) => {
    item.fileId = id;
    item.videoUrl = directUrl;
  };

  const handleImageRemove = () => {
    item.imageId = null;
    item.imageUrl = null;
  };

  const handleVideoRemove = () => {
    item.fileId = null;
    item.videoUrl = null;
  };
</script>

<div class="grid gap-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="grid gap-2">
      <Label for="name">Reviewer Name</Label>
      <Input
        id="name"
        bind:value={item.name}
        disabled={mode === "view"}
        placeholder="e.g. John Doe"
      />
    </div>

    <div class="grid gap-2">
      <Label for="location">Location / Country (Optional)</Label>
      <Input
        id="location"
        bind:value={item.location}
        disabled={mode === "view"}
        placeholder="e.g. Ghana 🇬🇭 or Nigeria 🇳🇬"
      />
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="grid gap-2">
      <Label for="rating">Rating (1-5)</Label>
      <Input
        id="rating"
        type="number"
        min="1"
        max="5"
        bind:value={item.rating}
        disabled={mode === "view"}
        placeholder="5"
      />
    </div>
  </div>

  <div class="grid gap-2">
    <Label for="review">Review Text</Label>
    {#if mode === "view"}
      <div class="prose prose-sm max-w-full border rounded-xl p-4 bg-muted/30">
        {@html item.review}
      </div>
    {:else}
      <RichEditor bind:value={item.review} class="min-h-[150px]" />
    {/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
    <Card.Root class="border-dashed">
      <Card.Header class="pb-2 text-center">
        <Card.Title class="text-sm font-medium">Reviewer Avatar</Card.Title>
      </Card.Header>
      <Card.Content>
        <ImageUpload
          fileId={item.imageId}
          imageUrl={item.imageUrl}
          onUploadSuccess={handleImageSuccess}
          onRemove={handleImageRemove}
          label=""
        />
      </Card.Content>
    </Card.Root>

    <Card.Root class="border-dashed">
      <Card.Header class="pb-2 text-center">
        <Card.Title class="text-sm font-medium"
          >Video Testimonial (Optional)</Card.Title
        >
      </Card.Header>
      <Card.Content>
        <VideoUpload
          fileId={item.fileId}
          videoUrl={item.videoUrl}
          onUploadSuccess={handleVideoSuccess}
          onRemove={handleVideoRemove}
          label=""
        />
      </Card.Content>
    </Card.Root>
  </div>
</div>
