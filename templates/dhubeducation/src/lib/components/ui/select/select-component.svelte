<script lang="ts" module>
  export interface iSelect {
    label: string;
    value: string;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";
  import { browser } from "$app/environment";

  interface Props {
    options: iSelect[];
    value?: any;
    placeholder: string;
    name: string;
    class?: string;
    disabled?: boolean;
    onValueChange?: (val: string) => void;
  }

  let {
    options = $bindable([]),
    value = $bindable(""),
    placeholder,
    class: className,
    name,
    disabled = false,
    onValueChange,
  }: Props = $props();

  const triggerContent = $derived(
    options.find((f) => f.value === value)?.label ?? placeholder,
  );

  // Dynamic import for Select components (client-side only)
  let Select: any = $state(null);

  // Load Select components on client-side only
  $effect(() => {
    if (browser) {
      import("$lib/components/ui/select/index.js").then((module) => {
        Select = module;
      });
    }
  });
</script>

{#if Select}
  <Select.Root type="single" {name} bind:value {disabled} {onValueChange}>
    <Select.Trigger
      class={cn("w-[180px] capitalize", className)}
      aria-label={name}
    >
      {triggerContent}
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        {#each options as option (option.value)}
          <Select.Item
            value={option.value}
            label={option.label}
            class="capitalize"
          >
            {option.label}
          </Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
{:else}
  <!-- Fallback during SSR or while loading -->
  <button
    type="button"
    class={cn(
      "flex h-10 w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 capitalize",
      className,
    )}
    disabled
    aria-label={name}
  >
    {triggerContent}
  </button>
{/if}
