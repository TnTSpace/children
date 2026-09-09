<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { Sparkles, Plus, Loader2 } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { cn } from "$lib/utils";
  import { goto } from "$app/navigation";

  // ============================================================
  // <CreditBalance>
  //
  // Floating chip + popover that mirrors the OpenArt credit
  // widget the user wanted ("12,000 / 12,000 credits left" with a
  // progress bar and a "Purchase Extra Credit" CTA).
  //
  // Surface: rendered in the header (HeaderActions.svelte) for
  // every signed-in user. Self-fetches via /api/credits/balance
  // on mount + every 60 s while the tab is visible. A custom
  // `xepho:credits-changed` event lets other parts of the app
  // (e.g. an AI handler that just spent credits) request an
  // immediate refresh without waiting for the next poll.
  //
  // Click → opens a popover with:
  //   • Big balance + monthly cap
  //   • Progress bar with red/amber/green band
  //   • Last 5 transactions (compact)
  //   • "Buy more credits" + "Upgrade plan" buttons
  //
  // Defensive: parses text-first to survive Cloudflare error
  // pages, polls only while the tab is visible, never throws to
  // the user — the chip just hides on irrecoverable errors.
  // ============================================================

  let { class: className = "" }: { class?: string } = $props();

  type Tx = {
    id: string;
    amount: number;
    balanceAfter: number;
    type: string;
    operation: string | null;
    description: string | null;
    createdAt: string | Date;
  };

  let balance = $state<number | null>(null);
  let allocation = $state<number>(0);
  let topup = $state<number>(0);
  let recent = $state<Tx[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let popoverOpen = $state(false);

  // Which pack tile is mid-checkout. Drives the spinner overlay on
  // a single tile so the user can tell their click registered AND
  // sees that we're talking to Stripe — not a silent dead button.
  let buyingPack = $state<string | null>(null);

  // Derived UX state — drives the chip colour band + low-credit
  // warning copy. Tuned to the OpenArt thresholds.
  const percent = $derived.by(() => {
    if (balance == null || allocation <= 0) return 100;
    return Math.max(0, Math.min(100, Math.round((balance / allocation) * 100)));
  });
  const tone = $derived.by<"ok" | "warn" | "low">(() => {
    if (percent > 50) return "ok";
    if (percent > 15) return "warn";
    return "low";
  });

  async function refresh() {
    try {
      const res = await fetch("/api/credits/balance", { credentials: "include" });
      const text = await res.text();
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = null;
      }
      if (!res.ok || !payload?.ok) {
        // 401 just means the user isn't signed in yet — the
        // header gates the widget on auth so we shouldn't see
        // this in practice, but degrade gracefully if we do.
        if (res.status === 401) {
          balance = null;
        } else {
          error = payload?.error || `HTTP ${res.status}`;
        }
        return;
      }
      balance = payload.balance ?? 0;
      allocation = payload.monthlyAllocation ?? 0;
      topup = payload.topupBalance ?? 0;
      recent = (payload.recent || []).slice(0, 5);
      error = null;
    } catch (err: any) {
      // Network blip — leave the previous value alone.
      console.warn("[credits] balance refresh failed:", err?.message);
    } finally {
      loading = false;
    }
  }

  let pollTimer: ReturnType<typeof setInterval> | null = null;
  function startPolling() {
    stopPolling();
    pollTimer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) refresh();
    }, 15_000);
  }
  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  // Public bus other code can use to nudge the widget after
  // spending credits. Use as:
  //   window.dispatchEvent(new CustomEvent('xepho:credits-changed'))
  function onCreditsChanged() {
    refresh();
  }

  onMount(() => {
    refresh();
    startPolling();
    window.addEventListener("xepho:credits-changed", onCreditsChanged);
    document.addEventListener("visibilitychange", refresh);
  });
  onDestroy(() => {
    stopPolling();
    if (typeof window !== "undefined") {
      window.removeEventListener("xepho:credits-changed", onCreditsChanged);
    }
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", refresh);
    }
  });

  function fmt(n: number): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 10_000) return Math.round(n / 1_000) + "k";
    return n.toLocaleString();
  }

  function txLabel(t: Tx): string {
    if (t.description) return t.description;
    if (t.operation) return `AI: ${t.operation}`;
    if (t.type === "topup") return "Credit pack purchase";
    if (t.type === "allocation") return "Monthly allocation";
    if (t.type === "refund") return "Refund";
    return t.type;
  }

  async function buyPack(packKey: "starter" | "builder" | "power" | "mega") {
    // Guard against double-click while the previous call is still
    // in flight to Stripe. The spinner shows on the same tile so
    // the user can SEE the click registered.
    if (buyingPack) return;
    buyingPack = packKey;
    try {
      const res = await fetch("/api/credits/packs/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pack: packKey }),
      });
      const text = await res.text();
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {}
      if (!res.ok || !payload?.url) {
        // Keep the spinner state cleared so a retry click reactivates the tile.
        buyingPack = null;
        alert(payload?.error || "Could not start checkout.");
        return;
      }
      // Don't clear `buyingPack` here — we're about to hard-navigate
      // away. Leaving the spinner up is the right "still working"
      // signal during the Stripe page load.
      window.location.href = payload.url;
    } catch (err: any) {
      buyingPack = null;
      alert(err?.message || "Network error starting checkout.");
    }
  }
</script>

{#if balance != null}
  <Popover.Root bind:open={popoverOpen}>
    <Popover.Trigger>
      {#snippet child({ props })}
        <button
          {...props}
          class={cn(
            "inline-flex items-center gap-1.5 h-8 rounded-full px-3 text-xs font-bold border transition-all",
            tone === "ok"
              ? "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
              : tone === "warn"
                ? "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                : "border-red-500/40 bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-500/10",
            className,
          )}
          title="Credit balance"
          aria-label={`${balance} credits remaining`}
        >
          <Sparkles class="size-3.5" />
          <span class="tabular-nums">{fmt(balance ?? 0)}</span>
        </button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-80 p-0" align="end" sideOffset={8}>
      <div class="p-4 space-y-3 border-b border-border">
        <div class="flex items-baseline justify-between gap-2">
          <div>
            <p
              class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
            >
              Credits left
            </p>
            <p class="text-2xl font-bold tabular-nums">{balance.toLocaleString()}</p>
          </div>
          <p class="text-xs text-muted-foreground tabular-nums">
            of {allocation.toLocaleString()}
            {topup > 0 ? `+${topup.toLocaleString()} pack` : ""}
          </p>
        </div>
        <div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            class={cn(
              "h-full rounded-full transition-all",
              tone === "ok"
                ? "bg-primary"
                : tone === "warn"
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
            style={`width:${percent}%`}
          ></div>
        </div>
        {#if tone === "low"}
          <p class="text-[11px] text-red-600 dark:text-red-400 leading-snug">
            You're almost out. Top up to keep your AI features uninterrupted.
          </p>
        {:else if tone === "warn"}
          <p class="text-[11px] text-amber-600 dark:text-amber-400 leading-snug">
            Less than 15% remaining — consider topping up before your next heavy session.
          </p>
        {/if}
      </div>

      <!-- Quick-buy packs -->
      <div class="px-4 py-3 space-y-2 border-b border-border">
        <p
          class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
        >
          Buy more
        </p>
        <!-- Pack tiles. Each shows a live spinner overlay while
             its checkout call is in flight, so the user can SEE
             that their click triggered something. Tiles disable
             during ANY in-flight call to prevent buying two
             packs in one session by mistake. -->
        <div class="grid grid-cols-2 gap-2">
          {#each [
            { key: "starter", label: "Starter", desc: "+500 · $5", featured: false },
            { key: "builder", label: "Builder", desc: "+2,000 · $15", featured: true },
            { key: "power",   label: "Power",   desc: "+6,000 · $40", featured: false },
            { key: "mega",    label: "Mega",    desc: "+20,000 · $100", featured: false },
          ] as p (p.key)}
            <button
              type="button"
              onclick={() => buyPack(p.key as any)}
              disabled={buyingPack !== null}
              aria-busy={buyingPack === p.key}
              class={cn(
                "relative flex flex-col gap-0.5 p-2 rounded-lg border text-left transition-colors",
                p.featured
                  ? "border-primary/40 bg-primary/5 hover:bg-primary/10"
                  : "border-border hover:border-primary/60 hover:bg-primary/5",
                buyingPack !== null && buyingPack !== p.key && "opacity-40",
                "disabled:cursor-wait",
              )}
            >
              <span class="text-xs font-bold">{p.label}</span>
              <span class="text-[10px] text-muted-foreground">{p.desc}</span>
              {#if buyingPack === p.key}
                <span
                  class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"
                >
                  <Loader2 class="size-4 animate-spin text-primary" />
                </span>
              {/if}
            </button>
          {/each}
        </div>
      </div>

      <!-- Recent activity -->
      {#if recent.length > 0}
        <div class="px-4 py-3 space-y-1.5 max-h-48 overflow-y-auto">
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Recent activity
          </p>
          {#each recent as t (t.id)}
            <div class="flex items-center justify-between gap-3 text-xs">
              <span class="text-muted-foreground truncate">{txLabel(t)}</span>
              <span
                class={cn(
                  "tabular-nums font-bold shrink-0",
                  t.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
                )}
              >
                {t.amount >= 0 ? "+" : ""}{t.amount}
              </span>
            </div>
          {/each}
        </div>
      {/if}

      <div class="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          class="text-xs"
          onclick={() => {
            popoverOpen = false;
            goto("/pricing");
          }}
        >
          Upgrade plan
        </Button>
        <Button
          size="sm"
          class="text-xs"
          onclick={() => {
            popoverOpen = false;
            goto("/settings/billing");
          }}
        >
          <Plus class="size-3.5" /> All credits
        </Button>
      </div>
    </Popover.Content>
  </Popover.Root>
{/if}
