<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import ImageUpload from "$lib/components/widgets/ImageUpload.svelte";
  import type { iCampaign } from "$lib/interface";

  interface Props {
    item: Partial<iCampaign>;
    mode: "view" | "edit" | "create";
  }

  let { item = $bindable(), mode }: Props = $props();
</script>

<div class="grid gap-8">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">
      <div class="grid gap-2">
        <Label for="title" class="text-base font-bold">Campaign Title</Label>
        <Input
          id="title"
          bind:value={item.title}
          disabled={mode === "view"}
          placeholder="Enter a compelling campaign title"
          class="rounded-xl border-muted/20 h-12 text-lg shadow-sm focus:ring-primary/20"
        />
      </div>

      <div class="grid gap-2">
        <Label for="description" class="text-base font-bold">A Brief Summary</Label>
        <Textarea
          id="description"
          bind:value={item.description}
          disabled={mode === "view"}
          placeholder="What is this campaign about? (A short hook for the preview)"
          class="rounded-xl border-muted/20 min-h-[120px] shadow-sm resize-none focus:ring-primary/20"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="grid gap-2">
          <Label for="startDate" class="text-base font-bold">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            value={item.startDate
              ? new Date(item.startDate).toISOString().split("T")[0]
              : ""}
            onchange={(e) => (item.startDate = new Date(e.currentTarget.value))}
            disabled={mode === "view"}
            class="rounded-xl border-muted/20 h-11 shadow-sm focus:ring-primary/20"
          />
        </div>
        <div class="grid gap-2">
          <Label for="endDate" class="text-base font-bold">End Date</Label>
          <Input
            type="date"
            id="endDate"
            value={item.endDate
              ? new Date(item.endDate).toISOString().split("T")[0]
              : ""}
            onchange={(e) => (item.endDate = new Date(e.currentTarget.value))}
            disabled={mode === "view"}
            class="rounded-xl border-muted/20 h-11 shadow-sm focus:ring-primary/20"
          />
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="p-1 rounded-2xl bg-muted/5 border border-muted/20 shadow-sm">
        <ImageUpload
          label="Campaign Banner / Image"
          bind:fileId={item.fileId}
          bind:imageUrl={item.imageUrl}
          onUploadSuccess={(id, url) => {
            item.fileId = id;
            item.imageUrl = url;
          }}
          onRemove={() => {
            item.fileId = null;
            item.imageUrl = null;
          }}
        />
      </div>
      
      <div class="p-6 rounded-2xl bg-primary/5 border border-primary/10">
        <h4 class="font-bold text-primary mb-2">Campaign Tips</h4>
        <ul class="text-sm space-y-2 text-muted-foreground list-disc pl-4">
          <li>Use high-resolution images for better engagement.</li>
          <li>Set a clear start and end date for seasonal promos.</li>
          <li>Keep the summary concise but punchy.</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="grid gap-3">
    <Label class="text-base font-bold">Detailed Content</Label>
    {#if mode === "view"}
      <div
        class="prose prose-lg dark:prose-invert max-w-none border rounded-2xl p-8 bg-background shadow-inner min-h-[300px]"
      >
        {@html item.content}
      </div>
    {:else}
      <div class="rounded-2xl border overflow-hidden shadow-md bg-background focus-within:ring-2 ring-primary/20 transition-all">
        <RichEditor bind:value={item.content} />
      </div>
    {/if}
  </div>
</div>
