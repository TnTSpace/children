<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import RichEditor from "$lib/components/ui/editor/rich-editor.svelte";
  import type { iService } from "$lib/interface";

  interface Props {
    item: Partial<iService>;
    mode: "view" | "edit" | "create";
  }

  let { item = $bindable(), mode }: Props = $props();
</script>

<div class="grid gap-4">
  <div class="grid gap-2">
    <Label for="name">Service Name</Label>
    <Input
      id="name"
      bind:value={item.name}
      disabled={mode === "view"}
      placeholder="Enter service name"
    />
  </div>

  <div class="grid gap-2">
    <Label for="description">Short Description</Label>
    <Textarea
      id="description"
      bind:value={item.description}
      disabled={mode === "view"}
      placeholder="Enter a brief summary"
    />
  </div>

  <div class="grid gap-2">
    <Label>Content</Label>
    {#if mode === "view"}
      <div
        class="prose prose-sm dark:prose-invert max-w-none border rounded-lg p-4 bg-muted/10"
      >
        {@html item.content}
      </div>
    {:else}
      <RichEditor bind:value={item.content} />
    {/if}
  </div>
</div>
