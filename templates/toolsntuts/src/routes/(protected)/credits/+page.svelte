<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageProps } from './$types';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as Table from '$lib/components/ui/table/index.js';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Coins, TrendingUp, Loader2, Zap } from '@lucide/svelte';
  import { invalidateAll } from '$app/navigation';

  let { data }: PageProps = $props();

  const PACKS = [
    { key: 'starter', label: 'Starter',  credits: '500',    price: '$5',   featured: false },
    { key: 'builder', label: 'Builder',  credits: '2,000',  price: '$15',  featured: true  },
    { key: 'power',   label: 'Power',    credits: '6,000',  price: '$40',  featured: false },
    { key: 'mega',    label: 'Mega',     credits: '20,000', price: '$100', featured: false },
  ];

  let buyingPack = $state<string | null>(null);

  async function buyPack(packKey: string) {
    if (buyingPack) return;
    buyingPack = packKey;
    try {
      const res = await fetch('/api/credits/packs/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ pack: packKey })
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.url) {
        alert(payload?.error || 'Could not start checkout.');
        buyingPack = null;
        return;
      }
      window.location.href = payload.url;
    } catch {
      buyingPack = null;
      alert('Network error. Please try again.');
    }
  }

  // Refresh server data when any credit event fires (purchase, generation, etc.)
  function onCreditsChanged() { invalidateAll(); }
  onMount(() => { window.addEventListener('xepho:credits-changed', onCreditsChanged); });
  onDestroy(() => { if (typeof window !== 'undefined') window.removeEventListener('xepho:credits-changed', onCreditsChanged); });

  const prettyReason = (r: string) => r.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const fmtDate = (d: string | Date) =>
    new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
</script>

<svelte:head><title>Credits | toolsntuts Studio</title></svelte:head>

<div class="py-4 space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Credits</h1>
    <p class="text-sm text-muted-foreground">
      Storyboards and video generation spend credits. Failed generations are refunded automatically.
    </p>
  </div>

  <!-- Balance summary -->
  <div class="grid gap-4 sm:grid-cols-2">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Balance</Card.Title>
        <Coins class="h-4 w-4 text-amber-500" />
      </Card.Header>
      <Card.Content>
        <div class="text-3xl font-bold tabular-nums">{data.wallet.balance.toLocaleString()}</div>
        <p class="text-xs text-muted-foreground mt-1">credits available</p>
      </Card.Content>
    </Card.Root>
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Lifetime spent</Card.Title>
        <TrendingUp class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-3xl font-bold tabular-nums">{data.wallet.lifetimeSpent.toLocaleString()}</div>
        <p class="text-xs text-muted-foreground mt-1">credits used total</p>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Buy more credits -->
  <Card.Root>
    <Card.Header class="pb-3">
      <Card.Title class="text-base flex items-center gap-2">
        <Zap class="h-4 w-4 text-primary" /> Buy more credits
      </Card.Title>
      <Card.Description>Credits are added to your account instantly after payment.</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="grid gap-3 grid-cols-2 sm:grid-cols-4">
        {#each PACKS as p (p.key)}
          <button
            type="button"
            onclick={() => buyPack(p.key)}
            disabled={buyingPack !== null}
            class="relative flex flex-col gap-1 rounded-xl border p-3 text-left transition-all
              hover:border-primary/60 hover:bg-primary/5 disabled:cursor-wait
              {p.featured ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20' : 'border-border'}
              {buyingPack !== null && buyingPack !== p.key ? 'opacity-40' : ''}"
          >
            {#if p.featured}
              <Badge variant="default" class="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0">
                Popular
              </Badge>
            {/if}
            <span class="text-sm font-bold mt-1">{p.label}</span>
            <span class="text-xl font-bold text-primary tabular-nums">+{p.credits}</span>
            <span class="text-xs text-muted-foreground">{p.price}</span>
            {#if buyingPack === p.key}
              <span class="absolute inset-0 flex items-center justify-center rounded-xl bg-background/80 backdrop-blur-sm">
                <Loader2 class="h-5 w-5 animate-spin text-primary" />
              </span>
            {/if}
          </button>
        {/each}
      </div>
    </Card.Content>
  </Card.Root>

  <!-- Activity ledger -->
  <Card.Root>
    <Card.Header><Card.Title>Activity</Card.Title></Card.Header>
    <Card.Content class="p-0">
      {#if data.ledger.length === 0}
        <div class="py-10 text-center text-sm text-muted-foreground">No activity yet.</div>
      {:else}
        <div class="overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>When</Table.Head>
                <Table.Head>Reason</Table.Head>
                <Table.Head class="text-right">Amount</Table.Head>
                <Table.Head class="text-right">Balance</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.ledger as entry (entry.id)}
                <Table.Row>
                  <Table.Cell class="text-muted-foreground whitespace-nowrap">{fmtDate(entry.createdAt)}</Table.Cell>
                  <Table.Cell>{prettyReason(entry.reason)}</Table.Cell>
                  <Table.Cell class="text-right font-mono font-medium {entry.amount < 0 ? 'text-destructive' : 'text-green-600'}">
                    {entry.amount > 0 ? '+' : ''}{entry.amount.toLocaleString()}
                  </Table.Cell>
                  <Table.Cell class="text-right font-mono text-muted-foreground">{entry.balanceAfter.toLocaleString()}</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>
</div>
