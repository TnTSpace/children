<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import type { iPartner } from "$lib/interface";

  interface Props {
    item: Partial<iPartner>;
    mode: "view" | "edit" | "create";
  }

  let { item = $bindable(), mode }: Props = $props();
</script>

<div class="grid gap-4">
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="grid gap-2">
      <Label for="name">Partner Name</Label>
      <Input
        id="name"
        bind:value={item.name}
        disabled={mode === "view"}
        placeholder="Enter partner name"
      />
    </div>
    <div class="grid gap-2">
      <Label for="type">Partner Type</Label>
      <Input
        id="type"
        bind:value={item.type}
        disabled={mode === "view"}
        placeholder="e.g., University, Agency"
      />
    </div>
  </div>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div class="grid gap-2">
      <Label for="website">Website URL</Label>
      <Input
        id="website"
        bind:value={item.website}
        disabled={mode === "view"}
        placeholder="https://example.com"
      />
    </div>
    <div class="grid gap-2">
      <Label for="country">Country</Label>
      <Input
        id="country"
        bind:value={item.country}
        disabled={mode === "view"}
        placeholder="Enter country"
      />
    </div>
  </div>

  <div class="grid gap-2">
    <Label for="content">Additional Info</Label>
    <Textarea
      id="content"
      bind:value={item.content}
      disabled={mode === "view"}
      placeholder="Enter more details about the partner"
      class="min-h-[100px]"
    />
  </div>
</div>
