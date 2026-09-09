<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Loader2, Plus, X } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import { cn } from "$lib/utils";

  interface Item {
    id: string;
    name: string;
    image?: { url: string } | null;
    [key: string]: any;
  }

  interface Props {
    value?: string;
    name?: string;
    placeholder?: string;
    label?: string;
    entityName?: string;
    createUrl?: string;
    fetchOptions: (query: string) => Promise<Item[]>;
    initialItem?: Item | null;
    onSelect?: (item: Item) => void;
    class?: string;
  }

  let {
    value = $bindable(""),
    name = "",
    placeholder = "Search...",
    label,
    entityName = "Item",
    createUrl,
    fetchOptions,
    initialItem = $bindable(null),
    onSelect,
    class: className,
  }: Props = $props();

  let isSearching = $state(false);
  let hasSearched = $state(false);
  let searchResults = $state<Item[]>([]);
  let searchQuery = $state("");
  let selectedItem = $state<Item | null>(initialItem);

  // Sync selectedItem with initialItem on mount and when initialItem changes
  $effect(() => {
    if (initialItem) {
      selectedItem = initialItem;
      value = initialItem.id;
    }
  });

  // Only clear selectedItem when value is explicitly cleared (not on initial empty value)
  let hasInitialized = false;
  $effect(() => {
    if (hasInitialized && !value) {
      selectedItem = null;
    }
    hasInitialized = true;
  });

  async function handleSearch() {
    if (!searchQuery.trim()) return;

    isSearching = true;
    hasSearched = true;
    try {
      searchResults = await fetchOptions(searchQuery);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to search ${entityName.toLowerCase()}s`);
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleSelect(item: Item) {
    selectedItem = item;
    value = item.id;
    searchQuery = "";
    searchResults = [];
    hasSearched = false;
    if (onSelect) onSelect(item);
  }

  function clearSelection() {
    selectedItem = null;
    value = "";
    if (onSelect) onSelect(null as any);
  }
</script>

<div class={cn("space-y-2", className)}>
  {#if label}
    <Label>{label}</Label>
  {/if}

  {#if selectedItem}
    <div
      class="flex items-center justify-between p-3 border rounded-md bg-muted/20"
    >
      <div class="flex items-center gap-3">
        {#if selectedItem.image?.url}
          <img
            src={selectedItem.image.url}
            alt={selectedItem.name}
            class="h-10 w-10 rounded-full object-cover border"
          />
        {:else}
          <div
            class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold uppercase"
          >
            {selectedItem.name.charAt(0)}
          </div>
        {/if}
        <div>
          <p class="font-medium">{selectedItem.name}</p>
          {#if selectedItem.description}
            <p class="text-xs text-muted-foreground line-clamp-1">
              {selectedItem.description}
            </p>
          {/if}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onclick={clearSelection}
        title="Change Selection"
      >
        Change
      </Button>
    </div>
    <input type="hidden" {name} {value} />
  {:else}
    <div class="space-y-2">
      <div class="flex gap-2">
        <Input
          {placeholder}
          bind:value={searchQuery}
          onkeydown={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleSearch())}
        />
        <Button type="button" onclick={handleSearch} disabled={isSearching}>
          {#if isSearching}
            <Loader2 class="h-4 w-4 animate-spin" />
          {:else}
            Search
          {/if}
        </Button>
      </div>

      {#if !isSearching && hasSearched && searchResults.length === 0}
        <div class="text-center py-4 space-y-2 border rounded-md border-dashed">
          <p class="text-sm text-muted-foreground">
            No {entityName.toLowerCase()}s found for "{searchQuery}".
          </p>
          {#if createUrl}
            <Button
              variant="outline"
              size="sm"
              href={createUrl}
              target="_blank"
            >
              <Plus class="h-4 w-4 mr-2" />
              Create New {entityName}
            </Button>
          {/if}
        </div>
      {/if}

      {#if searchResults.length > 0}
        <div class="border rounded-md max-h-[200px] overflow-y-auto divide-y">
          {#each searchResults as item}
            <button
              type="button"
              class="w-full flex items-center gap-3 p-2 hover:bg-muted/50 transition-colors text-left"
              onclick={() => handleSelect(item)}
            >
              {#if item.image?.url}
                <img
                  src={item.image.url}
                  alt={item.name}
                  class="h-8 w-8 rounded-full object-cover"
                />
              {:else}
                <div
                  class="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase shrink-0"
                >
                  {item.name.charAt(0)}
                </div>
              {/if}
              <div>
                <p class="text-sm font-medium">{item.name}</p>
                {#if item.description}
                  <p class="text-xs text-muted-foreground line-clamp-1">
                    {item.description}
                  </p>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>
