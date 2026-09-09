<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Filter, X } from "@lucide/svelte";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";
  import { Switch } from "$lib/components/ui/switch";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  export interface FilterOption {
    label: string;
    value: string;
  }

  export interface FilterField {
    name: string;
    label: string;
    type: "select" | "text" | "switch";
    options?: FilterOption[];
    value: any;
    placeholder?: string;
  }

  interface Props {
    filters: FilterField[];
    onApply: (filters: FilterField[]) => void;
    onReset: () => void;
  }

  let { filters = $bindable(), onApply, onReset }: Props = $props();

  let open = $state(false);
  let isDesktop = $state(true);

  // Dynamic imports for Dialog and Drawer (client-side only to avoid SSR errors)
  let Dialog: any = $state(null);
  let Drawer: any = $state(null);

  // Load Dialog and Drawer components on client-side only
  $effect(() => {
    if (browser) {
      import("$lib/components/ui/dialog").then((module) => {
        Dialog = module;
      });
      import("$lib/components/ui/drawer").then((module) => {
        Drawer = module;
      });
    }
  });

  onMount(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    isDesktop = mql.matches;

    const onChange = (e: MediaQueryListEvent) => {
      isDesktop = e.matches;
    };

    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  });

  const handleApply = () => {
    onApply(filters);
    open = false;
  };

  const handleReset = () => {
    onReset();
    open = false;
  };

  // Count active filters
  const activeCount = $derived(
    filters.filter((f) => {
      if (f.type === "switch")
        return f.value !== undefined && f.value !== false;
      return f.value && f.value !== "";
    }).length,
  );
</script>

{#snippet filterContent()}
  <div class="grid gap-4 py-4">
    {#each filters as filter}
      <div class="grid gap-2">
        <Label for={filter.name}>{filter.label}</Label>
        {#if filter.type === "select"}
          <SelectComponent
            options={filter.options || []}
            bind:value={filter.value}
            name={filter.name}
            placeholder={filter.placeholder || `Select ${filter.label}`}
          />
        {:else if filter.type === "text"}
          <Input
            id={filter.name}
            bind:value={filter.value}
            placeholder={filter.placeholder}
          />
        {:else if filter.type === "switch"}
          <div class="flex items-center gap-2">
            <Switch id={filter.name} bind:checked={filter.value} />
            <span class="text-sm text-muted-foreground">
              {filter.value ? "Active" : "Inactive"}
            </span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="flex flex-col gap-2 pt-4 sm:flex-row">
    <Button onclick={handleApply} class="flex-1">Apply Filters</Button>
    <Button variant="outline" onclick={handleReset} class="flex-1">
      Reset
    </Button>
  </div>
{/snippet}

{#if Dialog && Drawer}
  {#if isDesktop}
    <Dialog.Root bind:open>
      <Dialog.Trigger>
        <Button variant="outline" size="sm" class="h-9 gap-2">
          <Filter class="h-4 w-4" />
          <span class="hidden sm:inline">Filter</span>
          {#if activeCount > 0}
            <span
              class="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
            >
              {activeCount}
            </span>
          {/if}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
          <Dialog.Title>Filter</Dialog.Title>
          <Dialog.Description>
            Refine your search results using the filters below.
          </Dialog.Description>
        </Dialog.Header>
        {@render filterContent()}
      </Dialog.Content>
    </Dialog.Root>
  {:else}
    <Drawer.Root bind:open>
      <Drawer.Trigger>
        <Button variant="outline" size="icon" class="h-9 w-9 relative">
          <Filter class="h-4 w-4" />
          {#if activeCount > 0}
            <span
              class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
            >
              {activeCount}
            </span>
          {/if}
        </Button>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header class="text-left">
          <Drawer.Title>Filter</Drawer.Title>
          <Drawer.Description>
            Refine your search results using the filters below.
          </Drawer.Description>
        </Drawer.Header>
        <div class="px-4 pb-8">
          {@render filterContent()}
        </div>
      </Drawer.Content>
    </Drawer.Root>
  {/if}
{:else}
  <!-- Fallback button when Dialog/Drawer not loaded yet -->
  <Button variant="outline" size="sm" class="h-9 gap-2" disabled>
    <Filter class="h-4 w-4" />
    <span class="hidden sm:inline">Filter</span>
  </Button>
{/if}
