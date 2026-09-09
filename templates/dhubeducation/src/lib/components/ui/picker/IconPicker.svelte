<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Input } from "$lib/components/ui/input";
  import * as LucideIcons from "@lucide/svelte";
  import { Search, ChevronDown, Check, X } from "@lucide/svelte";
  import { cn } from "$lib/utils";
  import { tick } from "svelte";

  interface Props {
    value?: string;
    onSelect?: (iconName: string) => void;
    class?: string;
    label?: string;
  }

  let {
    value = $bindable(),
    onSelect,
    class: className,
    label = "Select Icon",
  }: Props = $props();

  let open = $state(false);
  let searchQuery = $state("");

  const iconNames = Object.keys(LucideIcons)
    .filter((key) => /^[A-Z][a-zA-Z0-9]*$/.test(key))
    .filter(
      (key) =>
        typeof (LucideIcons as any)[key] === "function" ||
        (typeof (LucideIcons as any)[key] === "object" &&
          (LucideIcons as any)[key]?.render),
    )
    .filter((key) => !["LucideIcon", "createLucideIcon"].includes(key))
    .sort();

  let filteredIcons = $derived(
    iconNames.filter((name) =>
      name.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  function handleSelect(name: string) {
    value = name;
    open = false;
    if (onSelect) onSelect(name);
  }

  function clearSelection() {
    value = "";
    if (onSelect) onSelect("");
  }

  // Helper to render icon by name
  function getIcon(name: string) {
    // @ts-ignore
    return LucideIcons[name] || LucideIcons.HelpCircle;
  }
</script>

<div class={cn("space-y-2", className)}>
  {#if label}
    <span
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >{label}</span
    >
  {/if}

  {#if value}
    {@const Icon = getIcon(value)}
    <div
      class="flex items-center justify-between p-3 border rounded-lg bg-muted/20"
    >
      <div class="flex items-center gap-3">
        <div
          class="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0"
        >
          <Icon class="size-5" />
        </div>
        <div>
          <p class="font-medium text-sm">{value}</p>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onclick={clearSelection}
          title="Clear Selection"
          class="size-8 p-0"
        >
          <X class="size-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  {:else}
    <div class="space-y-2">
      <div class="relative">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground opacity-50"
        />
        <Input
          placeholder="Search 1,000+ icons..."
          bind:value={searchQuery}
          class="pl-10 h-10 rounded-lg border-muted-foreground/20"
        />
      </div>

      {#if searchQuery.length >= 2}
        {#if filteredIcons.length === 0}
          <div
            class="text-center py-4 border rounded-lg border-dashed text-xs text-muted-foreground"
          >
            No icons found for "{searchQuery}".
          </div>
        {:else}
          <div
            class="border rounded-lg max-h-[250px] overflow-y-auto divide-y bg-card shadow-sm custom-scrollbar"
          >
            {#each filteredIcons.slice(0, 50) as name}
              {@const Icon = getIcon(name)}
              <button
                type="button"
                class="w-full flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors text-left group"
                onclick={() => handleSelect(name)}
              >
                <div
                  class="size-8 rounded-md bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0"
                >
                  <Icon class="size-4" />
                </div>
                <span class="text-sm font-medium">{name}</span>
              </button>
            {/each}
            {#if filteredIcons.length > 50}
              <div
                class="p-2 text-center text-[10px] text-muted-foreground bg-muted/5"
              >
                Showing first 50 of {filteredIcons.length} matches
              </div>
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.2);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.3);
  }
</style>
