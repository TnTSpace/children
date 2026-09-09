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

<div class="grid gap-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <div class="grid gap-2">
        <Label for="title" class="font-bold">Campaign Title</Label>
        <Input
          id="title"
          bind:value={item.title}
          disabled={mode === "view"}
          placeholder="Enter campaign title"
          class="rounded-xl border-muted/20"
        />
      </div>

      <div class="grid gap-2">
        <Label for="description" class="font-bold">A Brief Summary</Label>
        <Textarea
          id="description"
          bind:value={item.description}
          disabled={mode === "view"}
          placeholder="Enter a brief summary"
          class="rounded-xl border-muted/20 min-h-[100px]"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="grid gap-2">
          <Label for="startDate" class="font-bold">Start Date</Label>
          <Input
            type="date"
            id="startDate"
            value={item.startDate
              ? new Date(item.startDate).toISOString().split("T")[0]
              : ""}
            onchange={(e) => (item.startDate = new Date(e.currentTarget.value))}
            disabled={mode === "view"}
            class="rounded-xl border-muted/20"
          />
        </div>
        <div class="grid gap-2">
          <Label for="endDate" class="font-bold">End Date</Label>
          <Input
            type="date"
            id="endDate"
            value={item.endDate
              ? new Date(item.endDate).toISOString().split("T")[0]
              : ""}
            onchange={(e) => (item.endDate = new Date(e.currentTarget.value))}
            disabled={mode === "view"}
            class="rounded-xl border-muted/20"
          />
        </div>
      </div>
    </div>

    <div class="space-y-4">
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
  </div>

  <div class="grid gap-2">
    <Label class="font-bold">Campaign Details / Content</Label>
    {#if mode === "view"}
      <div
        class="prose prose-sm dark:prose-invert max-w-none border rounded-xl p-6 bg-muted/5 shadow-inner"
      >
        {@html item.content}
      </div>
    {:else}
      <div class="rounded-xl border overflow-hidden shadow-sm">
        <RichEditor bind:value={item.content} />
      </div>
    {/if}
  </div>
</div>
