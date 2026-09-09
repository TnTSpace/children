<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageProps } from './$types';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card/index.js';
  import { CheckCircle2, Sparkles, AlertCircle, Coins } from '@lucide/svelte';
  import { Constants } from '$lib/constants';

  let { data }: PageProps = $props();

  onMount(() => {
    // Notify the CreditBalance widget (header) to refresh immediately
    window.dispatchEvent(new CustomEvent('xepho:credits-changed'));
  });
</script>

<svelte:head>
  <title>Payment successful | {Constants.BRANDNAME}</title>
</svelte:head>

<div class="flex min-h-[70vh] items-center justify-center px-4">
  <Card.Root class="w-full max-w-sm">
    <Card.Header class="text-center pb-2">
      {#if data.credited}
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
          <CheckCircle2 class="h-7 w-7 text-green-500" />
        </div>
        <Card.Title class="text-xl">Credits added!</Card.Title>
        <Card.Description>
          Your <span class="font-semibold text-foreground">{data.packLabel}</span> is ready to use.
        </Card.Description>
      {:else}
        <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/20">
          <AlertCircle class="h-7 w-7 text-amber-500" />
        </div>
        <Card.Title class="text-xl">Payment received</Card.Title>
        <Card.Description>
          Your <span class="font-semibold text-foreground">{data.packLabel}</span> payment was confirmed.
          Credits will appear shortly — check your balance in a moment.
        </Card.Description>
      {/if}
    </Card.Header>

    {#if data.credited && data.newBalance != null}
      <Card.Content class="pt-2 pb-4">
        <div class="flex items-center justify-center gap-2 rounded-xl border bg-muted/40 px-4 py-3">
          <Coins class="h-4 w-4 text-amber-500 shrink-0" />
          <span class="text-sm text-muted-foreground">New balance:</span>
          <span class="text-lg font-bold tabular-nums">{data.newBalance.toLocaleString()}</span>
        </div>
      </Card.Content>
    {:else}
      <Card.Content class="pt-2 pb-4">
        <p class="text-center text-sm text-muted-foreground">
          Credits are available immediately for AI generation.
        </p>
      </Card.Content>
    {/if}

    <Card.Footer class="flex flex-col gap-2 pt-0">
      <Button href="/projects" class="w-full gap-2">
        <Sparkles class="h-4 w-4" /> Start creating
      </Button>
      <Button href="/credits" variant="outline" class="w-full">
        View my credits
      </Button>
    </Card.Footer>
  </Card.Root>
</div>
