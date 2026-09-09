<script lang="ts">
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import { Coins, Loader2, RefreshCw, AlertTriangle } from "@lucide/svelte";
  import { creditsState } from "$lib/states/credits.svelte";
  import { onMount, onDestroy } from "svelte";

  onMount(() => {
    creditsState.refresh();
    creditsState.startPolling(60_000);
  });

  onDestroy(() => {
    creditsState.stopPolling();
  });

  // Top up at the WaveSpeed console.
  const TOPUP_URL = "https://wavespeed.ai/dashboard";
  // Warn when the balance dips under this USD floor.
  const LOW_BALANCE = 5;

  function fmt(n: number): string {
    if (n >= 1000) return `$${n.toFixed(0)}`;
    if (n >= 10) return `$${n.toFixed(2)}`;
    return `$${n.toFixed(4)}`;
  }

  const remainingLabel = $derived.by(() => {
    const d = creditsState.data;
    if (!d) return "—";
    return fmt(d.remaining);
  });

  const lowBalance = $derived.by(() => {
    const d = creditsState.data;
    if (!d) return false;
    return d.remaining < LOW_BALANCE;
  });
</script>

<Popover.Root>
  <Popover.Trigger
    class={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-md border border-border bg-card hover:bg-muted transition text-xs font-bold ${lowBalance ? 'text-destructive border-destructive/40' : 'text-foreground'}`}
    aria-label="WaveSpeed credits"
  >
    {#if creditsState.loading && !creditsState.data}
      <Loader2 class="size-3.5 animate-spin" />
    {:else if creditsState.error}
      <AlertTriangle class="size-3.5 text-destructive" />
    {:else if lowBalance}
      <AlertTriangle class="size-3.5" />
    {:else}
      <Coins class="size-3.5 text-primary" />
    {/if}
    <span class="tabular-nums">{remainingLabel}</span>
  </Popover.Trigger>

  <Popover.Content align="end" class="w-72 p-4 space-y-3">
    <div class="flex items-center justify-between">
      <p class="text-sm font-bold">WaveSpeed credits</p>
      <button
        type="button"
        aria-label="Refresh"
        class="text-muted-foreground hover:text-foreground transition disabled:opacity-50"
        disabled={creditsState.loading}
        onclick={() => creditsState.refresh()}
      >
        {#if creditsState.loading}
          <Loader2 class="size-3.5 animate-spin" />
        {:else}
          <RefreshCw class="size-3.5" />
        {/if}
      </button>
    </div>

    {#if creditsState.error}
      <!-- Error block. Keep this BENIGN — most of the time it's a
           transient dev-server reload or a brief 502, and the next
           60-second poll will recover on its own. We show the last
           known good values underneath so the popover still feels
           informative. -->
      <div class="rounded-md border border-destructive/30 bg-destructive/5 p-2.5 space-y-2">
        <div class="flex items-start gap-2 text-xs text-destructive">
          <AlertTriangle class="size-3.5 shrink-0 mt-0.5" />
          <span class="leading-snug">{creditsState.error}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="w-full h-7 text-[11px]"
          disabled={creditsState.loading}
          onclick={() => creditsState.refresh()}
        >
          {#if creditsState.loading}
            <Loader2 class="size-3 animate-spin" /> Retrying…
          {:else}
            <RefreshCw class="size-3" /> Try again
          {/if}
        </Button>
      </div>
      {#if creditsState.data}
        <p class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
          Last known
        </p>
        <div class="space-y-1 opacity-70">
          <div class="flex items-center justify-between text-xs">
            <span class="text-muted-foreground">Remaining</span>
            <span class="font-bold tabular-nums">{fmt(creditsState.data.remaining)}</span>
          </div>
        </div>
      {/if}
    {:else if creditsState.data}
      <div class="flex items-baseline justify-between">
        <span class="text-xs text-muted-foreground">Remaining balance</span>
        <span class={`text-lg font-bold tabular-nums ${lowBalance ? 'text-destructive' : 'text-foreground'}`}>
          {fmt(creditsState.data.remaining)}
        </span>
      </div>

      {#if lowBalance}
        <p class="text-[11px] text-destructive">Low balance — media & AI generation may start failing.</p>
      {/if}

      <Button href={TOPUP_URL} target="_blank" rel="noopener" variant={lowBalance ? "default" : "outline"} class="w-full" size="sm">
        Top up credits
      </Button>
    {:else}
      <p class="text-xs text-muted-foreground">No data yet.</p>
    {/if}
  </Popover.Content>
</Popover.Root>
