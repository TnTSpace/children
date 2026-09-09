<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { onMount } from "svelte";
  import { browser } from "$app/environment";

  interface Props {
    open: boolean;
    title: string;
    description?: string;
    mode: "view" | "edit" | "create";
    onOpenChange: (open: boolean) => void;
    onSave?: () => void;
    children: import("svelte").Snippet;
  }

  let {
    open = $bindable(),
    title,
    description,
    mode,
    onOpenChange,
    onSave,
    children,
  }: Props = $props();

  let isDesktop = $state(true);

  onMount(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    isDesktop = mql.matches;
    const onChange = (e: MediaQueryListEvent) => (isDesktop = e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  });
</script>

{#if isDesktop}
  <Dialog.Root bind:open {onOpenChange}>
    <Dialog.Content
      class="sm:max-w-[700px] max-h-[90vh] rounded-xl shadow-lg border-border"
    >
      <Dialog.Header>
        <Dialog.Title class="font-bold text-2xl">{title}</Dialog.Title>
        {#if description}
          <Dialog.Description class="text-muted-foreground"
            >{description}</Dialog.Description
          >
        {/if}
      </Dialog.Header>
      <ScrollArea class="max-h-[60vh] pr-4">
        <div class="grid gap-4 py-4">
          {@render children()}
        </div>
      </ScrollArea>
      <Dialog.Footer class="gap-2">
        <Button variant="outline" onclick={() => onOpenChange(false)}>
          {mode === "view" ? "Close" : "Cancel"}
        </Button>
        {#if mode !== "view" && onSave}
          <Button onclick={onSave}>
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        {/if}
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open {onOpenChange}>
    <Drawer.Content class="rounded-t-xl">
      <Drawer.Header class="text-left">
        <Drawer.Title class="font-bold text-xl">{title}</Drawer.Title>
        {#if description}
          <Drawer.Description class="text-muted-foreground"
            >{description}</Drawer.Description
          >
        {/if}
      </Drawer.Header>
      <div class="px-4 py-4 grid gap-4 overflow-y-auto max-h-[70vh]">
        {@render children()}
      </div>
      <Drawer.Footer class="pt-2 gap-2">
        {#if mode !== "view" && onSave}
          <Button onclick={onSave}>
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        {/if}
        <Drawer.Close asChild>
          {#snippet child({ props })}
            <Button variant="outline" {...props}>
              {mode === "view" ? "Close" : "Cancel"}
            </Button>
          {/snippet}
        </Drawer.Close>
      </Drawer.Footer>
    </Drawer.Content>
  </Drawer.Root>
{/if}
