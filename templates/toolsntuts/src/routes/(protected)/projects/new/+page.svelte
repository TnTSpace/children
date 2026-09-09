<script lang="ts">
  import type { PageProps } from './$types';
  import { goto } from '$app/navigation';
  import { untrack } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Label } from '$lib/components/ui/label';
  import * as Card from '$lib/components/ui/card/index.js';
  import { FORMATS, ASPECT_RATIOS } from '$lib/constants/media';
  import { pendingBuild } from '$lib/states/pending-build.svelte';
  import {
    Sparkles, AlertCircle, DollarSign, Film, Mic2,
    CheckCircle2, Circle, Loader2, Clapperboard, Minus
  } from '@lucide/svelte';

  let { form }: PageProps = $props();

  let format = $state(untrack(() => (form?.format as string) ?? 'narrated_short'));
  let aspectRatio = $state(untrack(() => (form?.aspectRatio as string) ?? '16:9'));
  let targetDurationSec = $state<number>(untrack(() => (form?.targetDurationSec as number) ?? 45));

  let submitting = $state(false);
  let buildStep = $state(0);
  let buildError = $state<string | null>(null);
  // True once we have a projectId+jobId from the first SSE event — enables minimize
  let canMinimize = $state(false);

  const STEPS = [
    { label: 'Parsing your creative brief',   detail: 'Reading your idea' },
    { label: 'Reserving your project slot',   detail: 'Setting up the workspace' },
    { label: 'AI is writing your story',      detail: 'This takes 20–40 seconds' },
    { label: 'Building your scene structure', detail: 'Creating shots and references' },
    { label: 'Launching your studio',         detail: 'Almost there!' }
  ];

  // WaveSpeed cost estimate (Jun 2026 rates)
  const CLIP_SEC = 8;
  const PRICE_VIDEO_PER_SEC = 0.014;
  const PRICE_TTS_FIXED = 0.01;

  const clipCount     = $derived(Math.ceil(targetDurationSec / CLIP_SEC));
  const videoCost     = $derived(clipCount * CLIP_SEC * PRICE_VIDEO_PER_SEC);
  const totalCost     = $derived(videoCost + PRICE_TTS_FIXED);

  // Reader reference — cancelled on minimize so server can continue uninterrupted
  let activeReader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (submitting) return;
    submitting = true;
    buildStep = 1;
    buildError = null;
    canMinimize = false;

    const fd = new FormData(e.target as HTMLFormElement);

    try {
      const res = await fetch('/api/projects/create', { method: 'POST', body: fd });
      if (!res.body) throw new Error('No response stream');

      const reader = res.body.getReader();
      activeReader = reader;
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        const lines = buf.split('\n');
        buf = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let payload: {
            step?: number; label?: string; jobId?: string; projectId?: string;
            error?: string; done?: boolean;
          };
          try { payload = JSON.parse(line.slice(6)); } catch { continue; }

          // First event always carries jobId + projectId — unlock minimize
          if (payload.projectId && payload.jobId) {
            pendingBuild.start(payload.projectId, payload.jobId, payload.step ?? 1, payload.label ?? STEPS[0].label);
            canMinimize = true;
          }

          if (payload.step) {
            buildStep = payload.step;
            pendingBuild.update(payload.step, payload.label ?? '', payload.jobId);
          }

          if (payload.error) {
            buildError = payload.error;
            pendingBuild.fail(payload.error);
            submitting = false;
            buildStep = 0;
            canMinimize = false;
            return;
          }

          if (payload.done && payload.projectId && !payload.error) {
            buildStep = 5;
            pendingBuild.finish(payload.projectId);
            await goto(`/projects/${payload.projectId}?autoStart=storyboards`);
            return;
          }
        }
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return; // user minimized — not an error
      buildError = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      submitting = false;
      buildStep = 0;
      canMinimize = false;
    }
  }

  /**
   * Hide the overlay and let the server finish in the background.
   * The protected layout's floating chip + pendingBuild polling take over.
   */
  function handleMinimize() {
    // Cancel the stream reader (server keeps running, polling takes over)
    activeReader?.cancel().catch(() => {});
    activeReader = null;
    submitting = false;
    pendingBuild.minimize();
    goto('/dashboard');
  }
</script>

<svelte:head><title>New project | toolsntuts Studio</title></svelte:head>

<!-- Build progress overlay -->
{#if submitting}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm">
    <div class="w-full max-w-sm mx-4 rounded-2xl border bg-card shadow-2xl overflow-hidden">

      <!-- Header -->
      <div class="border-b bg-muted/30 px-6 py-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Clapperboard class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold leading-tight">Building your project</h3>
              <p class="text-xs text-muted-foreground mt-0.5">
                {buildStep >= 1 && buildStep <= 5 ? STEPS[buildStep - 1].detail : 'Starting up…'}
              </p>
            </div>
          </div>

          <!-- Minimize — only available once we have project+job IDs -->
          {#if canMinimize}
            <button
              onclick={handleMinimize}
              title="Minimize — build continues in the background"
              class="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Minimize"
            >
              <Minus class="h-4 w-4" />
            </button>
          {/if}
        </div>

        <!-- Progress track -->
        <div class="mt-4 flex items-center gap-1">
          {#each STEPS as _s, i}
            <div
              class="h-1 flex-1 rounded-full transition-all duration-500
                {i + 1 < buildStep ? 'bg-primary' :
                 i + 1 === buildStep ? 'bg-primary/50' :
                 'bg-muted'}"
            ></div>
          {/each}
        </div>
      </div>

      <!-- Steps list -->
      <div class="px-6 py-5 space-y-3.5">
        {#each STEPS as step, i}
          {@const n = i + 1}
          {@const done   = buildStep > n}
          {@const active = buildStep === n}
          {@const pending = buildStep < n}
          <div class="flex items-center gap-3 {pending ? 'opacity-40' : ''}">
            <div class="shrink-0 h-5 w-5 flex items-center justify-center">
              {#if done}
                <CheckCircle2 class="h-5 w-5 text-primary" />
              {:else if active}
                <Loader2 class="h-5 w-5 animate-spin text-primary" />
              {:else}
                <Circle class="h-5 w-5 text-muted-foreground" />
              {/if}
            </div>
            <span class="text-sm {active ? 'font-medium text-foreground' : done ? 'text-foreground' : 'text-muted-foreground'}">
              {step.label}
            </span>
          </div>
        {/each}
      </div>

      {#if buildError}
        <div class="mx-6 mb-5 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
          <span>{buildError}</span>
        </div>
      {:else}
        <p class="text-center text-xs text-muted-foreground pb-5">
          {#if canMinimize}
            You can minimize — the build continues in the background
          {:else}
            Sit tight — AI is at work
          {/if}
        </p>
      {/if}
    </div>
  </div>
{/if}

<div class="mx-auto w-full max-w-3xl py-4">
  <div class="mb-6">
    <h1 class="text-2xl font-bold tracking-tight">Create a project</h1>
    <p class="text-sm text-muted-foreground">
      Describe your idea. We'll break it into scenes and shots, then you approve a storyboard before any video is generated.
    </p>
  </div>

  {#if form?.error}
    <div class="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
      <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
      <span>{form.error}</span>
    </div>
  {/if}

  <form onsubmit={handleSubmit} class="space-y-6">
    <!-- Format -->
    <div class="space-y-2">
      <Label>Format</Label>
      <div class="grid gap-3 sm:grid-cols-2">
        {#each FORMATS as f (f.key)}
          <button
            type="button"
            disabled={!f.available}
            onclick={() => (format = f.key)}
            class="flex items-start gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary/50 disabled:opacity-40
              {format === f.key ? 'border-primary bg-primary/5 ring-1 ring-primary' : ''}"
          >
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <f.icon class="h-5 w-5" />
            </div>
            <div>
              <div class="text-sm font-medium">{f.label}</div>
              <div class="text-xs text-muted-foreground">{f.tagline}</div>
            </div>
          </button>
        {/each}
      </div>
      <input type="hidden" name="format" value={format} />
    </div>

    <!-- Title -->
    <div class="space-y-2">
      <Label for="title">Title <span class="text-muted-foreground">(optional)</span></Label>
      <Input id="title" name="title" placeholder="e.g. How black holes bend time" value={(form?.title as string) ?? ''} />
    </div>

    <!-- Brief -->
    <div class="space-y-2">
      <Label for="brief">Your idea</Label>
      <Textarea
        id="brief"
        name="brief"
        rows={5}
        placeholder="Describe the video you want. The more detail (subject, tone, key beats), the better the breakdown."
        value={(form?.brief as string) ?? ''}
      />
    </div>

    <div class="grid gap-6 sm:grid-cols-2">
      <!-- Aspect ratio -->
      <div class="space-y-2">
        <Label>Aspect ratio</Label>
        <div class="flex flex-wrap gap-2">
          {#each ASPECT_RATIOS as ar (ar)}
            <button
              type="button"
              onclick={() => (aspectRatio = ar)}
              class="rounded-md border px-3 py-1.5 text-sm transition-colors hover:border-primary/50
                {aspectRatio === ar ? 'border-primary bg-primary/5 font-medium text-primary' : ''}"
            >{ar}</button>
          {/each}
        </div>
        <input type="hidden" name="aspectRatio" value={aspectRatio} />
      </div>

      <!-- Duration -->
      <div class="space-y-2">
        <Label for="dur">Target length: <span class="font-semibold text-foreground">{targetDurationSec}s</span></Label>
        <input id="dur" type="range" min="15" max="180" step="5" bind:value={targetDurationSec} class="w-full accent-primary" />
        <input type="hidden" name="targetDurationSec" value={targetDurationSec} />
      </div>
    </div>

    <!-- Cost estimate -->
    <Card.Root class="border-primary/20 bg-primary/5">
      <Card.Header class="pb-2 pt-4 px-4">
        <Card.Title class="flex items-center gap-2 text-sm font-semibold">
          <DollarSign class="h-4 w-4 text-primary" />
          Estimated generation cost
        </Card.Title>
        <Card.Description class="text-xs">
          Based on WaveSpeed published rates (Jun 2026). Breakdown is free — credits are charged only when you generate video.
        </Card.Description>
      </Card.Header>
      <Card.Content class="px-4 pb-4">
        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="rounded-lg border bg-background p-3">
            <div class="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1"><Film class="h-3 w-3" /> Clips</div>
            <div class="text-xl font-bold">{clipCount}</div>
            <div class="text-xs text-muted-foreground">{CLIP_SEC}s each</div>
          </div>
          <div class="rounded-lg border bg-background p-3">
            <div class="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1"><Film class="h-3 w-3" /> Video</div>
            <div class="text-xl font-bold">${videoCost.toFixed(2)}</div>
            <div class="text-xs text-muted-foreground">$0.014/s × {clipCount * CLIP_SEC}s</div>
          </div>
          <div class="rounded-lg border bg-background p-3">
            <div class="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1"><Mic2 class="h-3 w-3" /> Total</div>
            <div class="text-xl font-bold text-primary">${totalCost.toFixed(2)}</div>
            <div class="text-xs text-muted-foreground">+${PRICE_TTS_FIXED.toFixed(2)} narration</div>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <div class="flex items-center justify-end gap-3">
      <Button href="/projects" variant="ghost" type="button">Cancel</Button>
      <Button type="submit" disabled={submitting} class="gap-2 min-w-44">
        {#if submitting}
          <Loader2 class="h-4 w-4 animate-spin" /> Building…
        {:else}
          <Sparkles class="h-4 w-4" /> Generate breakdown
        {/if}
      </Button>
    </div>
  </form>
</div>
