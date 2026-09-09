<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Input } from "$lib/components/ui/input";
  import { ChevronDown, Check, X, Palette } from "@lucide/svelte";
  import { cn } from "$lib/utils";

  interface Props {
    value?: string;
    onSelect?: (colorClass: string) => void;
    class?: string;
    label?: string;
    mode?: "text" | "background" | "gradient" | "any";
    id?: string;
  }

  let {
    value = $bindable(""),
    onSelect,
    class: className,
    label = "Select Color",
    mode = "any",
    id = "color-picker-" + Math.random().toString(36).substring(2, 9),
  }: Props = $props();

  let open = $state(false);

  // Standard Tailwind colors (v4 compatible)
  const colors = [
    "slate",
    "gray",
    "zinc",
    "neutral",
    "stone",
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
  ];

  const semantic = ["primary", "secondary", "accent", "destructive", "muted"];

  const shades = [500, 600, 700, 400]; // Common shades for picker

  // Pre-defined common combinations
  const gradients = [
    "from-blue-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-purple-600 to-fuchsia-600",
    "from-orange-600 to-red-600",
    "from-rose-600 to-pink-600",
    "from-cyan-600 to-blue-600",
    "from-amber-500 to-orange-600",
    "from-lime-500 to-green-600",
    "from-slate-700 to-slate-900",
    "from-primary to-primary/80",
  ];

  function handleSelect(color: string) {
    value = color;
    open = false;
    if (onSelect) onSelect(color);
  }

  function clearSelection() {
    value = "";
    if (onSelect) onSelect("");
  }

  function getPreviewClass(colorClass: string) {
    if (colorClass.startsWith("text-")) return colorClass;
    if (colorClass.startsWith("bg-")) return colorClass;
    if (colorClass.includes("from-")) return "bg-gradient-to-br " + colorClass;

    // Default fallback depends on current mode
    if (mode === "text") return "text-" + colorClass;
    return "bg-" + colorClass;
  }
</script>

<div class={cn("flex flex-col gap-1", className)}>
  {#if label}
    <span
      class="text-xs font-bold uppercase tracking-wider text-muted-foreground"
      >{label}</span
    >
  {/if}

  <Popover.Root bind:open>
    <Popover.Trigger>
      <Button
        {id}
        variant="outline"
        role="combobox"
        aria-expanded={open}
        class="w-full justify-between rounded-lg border-muted-foreground/20 h-10 px-3 overflow-hidden"
      >
        <div class="flex items-center gap-2 overflow-hidden truncate">
          {#if value}
            <div
              class={cn(
                "size-4 rounded-full border border-border/50",
                value.includes("from-")
                  ? "bg-gradient-to-br " + value
                  : value.startsWith("text-")
                    ? "bg-current " + value
                    : value.startsWith("bg-")
                      ? value
                      : "bg-" + value,
              )}
            ></div>
            <span class="truncate">{value}</span>
          {:else}
            <span class="text-muted-foreground">Select color...</span>
          {/if}
        </div>
        <div class="flex items-center gap-1 shrink-0">
          {#if value}
            <button
              type="button"
              class="p-0.5 hover:bg-muted rounded-full transition-colors"
              aria-label="Clear selection"
              onclick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
            >
              <X class="size-3 text-muted-foreground" />
            </button>
          {/if}
          <ChevronDown class="size-4 opacity-50" />
        </div>
      </Button>
    </Popover.Trigger>
    <Popover.Content
      class="w-[300px] p-4 rounded-xl shadow-lg border-border/50 bg-popover"
      align="start"
    >
      <div class="space-y-4">
        {#if mode === "any" || mode === "text" || mode === "background"}
          <div class="space-y-2">
            <h4
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Tailwind Colors
            </h4>
            <div class="grid grid-cols-6 gap-2">
              {#each colors as color}
                <button
                  type="button"
                  class={cn(
                    "size-8 rounded-lg border border-border/20 transition-all hover:scale-110 shadow-sm transition-colors",
                    `bg-${color}-500`,
                  )}
                  onclick={() =>
                    handleSelect(
                      mode === "text"
                        ? `text-${color}-500`
                        : mode === "background"
                          ? `bg-${color}-500`
                          : `${color}-500`,
                    )}
                  title={color}
                  aria-label={color}
                >
                </button>
              {/each}
            </div>
          </div>

          <div class="space-y-2">
            <h4
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Semantic
            </h4>
            <div class="flex flex-wrap gap-2">
              {#each semantic as color}
                <button
                  type="button"
                  class={cn(
                    "px-2 py-1 text-[10px] rounded-md border border-border/20 transition-all hover:bg-muted",
                    `bg-${color} text-${color}-foreground`,
                  )}
                  onclick={() =>
                    handleSelect(
                      mode === "text"
                        ? `text-${color}`
                        : mode === "background"
                          ? `bg-${color}`
                          : color,
                    )}
                >
                  {color}
                </button>
              {/each}
            </div>
          </div>
        {/if}

        {#if mode === "any" || mode === "gradient"}
          <div class="space-y-2">
            <h4
              class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
            >
              Gradients
            </h4>
            <div class="grid grid-cols-2 gap-2">
              {#each gradients as grad, i}
                <button
                  type="button"
                  class={cn(
                    "h-8 rounded-lg border border-border/20 transition-all hover:scale-105 bg-gradient-to-br shadow-sm",
                    grad,
                  )}
                  onclick={() => handleSelect(grad)}
                  title={grad}
                  aria-label="Gradient color"
                ></button>
              {/each}
            </div>
          </div>
        {/if}

        <div class="pt-2 border-t">
          <Input
            placeholder="Custom class (e.g. blue-500)..."
            bind:value
            class="h-8 text-xs font-mono"
            onchange={() => onSelect?.(value)}
          />
        </div>
      </div>
    </Popover.Content>
  </Popover.Root>
</div>
