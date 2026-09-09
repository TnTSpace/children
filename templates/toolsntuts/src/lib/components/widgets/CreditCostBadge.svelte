<script lang="ts">
  import { Sparkles } from "@lucide/svelte";
  import { creditCosts } from "$lib/states/credit-costs.svelte";
  import { cn } from "$lib/utils";

  // ============================================================
  // <CreditCostBadge operation="image_generate" />
  //
  // Drop-in pill that reads the live cost from the
  // `creditCosts` store and renders "—10 credits".
  // Used inline next to AI buttons:
  //
  //   <Button onclick={generate}>
  //     Generate
  //     <CreditCostBadge operation="image_generate" />
  //   </Button>
  //
  // The badge is intentionally subtle — gold/amber tint, small
  // tabular-nums font. It's a hint, not the headline.
  // ============================================================

  let {
    operation,
    quantity = 1,
    class: className,
    showDescription = false,
  }: {
    operation: string;
    quantity?: number;
    class?: string;
    showDescription?: boolean;
  } = $props();

  const entry = $derived(creditCosts.cost(operation));
  const total = $derived(entry.credits * quantity);
</script>

<span
  class={cn(
    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
    "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    className,
  )}
  title={showDescription ? entry.description : `Costs ${total} credits`}
>
  <Sparkles class="size-2.5" />
  <span class="tabular-nums">{total.toLocaleString()}</span>
  {#if showDescription}
    <span class="font-normal normal-case tracking-normal opacity-80">credits</span>
  {/if}
</span>
