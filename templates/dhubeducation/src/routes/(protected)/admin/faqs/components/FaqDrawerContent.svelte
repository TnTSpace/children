<script lang="ts">
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import type { iFaq } from "$lib/interface";

  interface Props {
    item: iFaq;
    mode: "view" | "edit" | "create";
  }

  let { item = $bindable(), mode }: Props = $props();

  const categories = [
    { label: "Courses", value: "Courses" },
    { label: "Admission", value: "Admission" },
    { label: "Partnership", value: "Partnership" },
    { label: "General", value: "General" },
  ];
</script>

<div class="grid gap-6">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div class="space-y-4">
      <div class="grid gap-2">
        <Label
          for="category"
          class="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >Category</Label
        >
        {#if mode === "view"}
          <Input
            id="category"
            value={item.category}
            disabled
            class="rounded-xl border-muted/20"
          />
        {:else}
          <SelectComponent
            name="category"
            placeholder="Select a category"
            options={categories}
            bind:value={item.category}
            class="w-full rounded-xl border-muted/20"
          />
        {/if}
      </div>

      <div class="grid gap-2">
        <Label
          for="question"
          class="font-bold text-xs uppercase tracking-wider text-muted-foreground"
          >Question</Label
        >
        <Input
          id="question"
          bind:value={item.question}
          disabled={mode === "view"}
          placeholder="Enter the question"
          class="rounded-xl border-muted/20 font-bold"
        />
      </div>
    </div>
  </div>

  <div class="grid gap-2">
    <Label
      for="answer"
      class="font-bold text-xs uppercase tracking-wider text-muted-foreground"
      >Answer</Label
    >
    <Textarea
      id="answer"
      bind:value={item.answer}
      disabled={mode === "view"}
      placeholder="Enter the detailed answer"
      class="rounded-xl border-muted/20 min-h-[200px] leading-relaxed"
    />
  </div>
</div>
