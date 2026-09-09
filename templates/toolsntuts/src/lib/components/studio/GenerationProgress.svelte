<script lang="ts">
  import { Check, Loader2, Circle, AlertCircle } from '@lucide/svelte';
  import type { Prog, Step } from './progress-types';

  let { prog }: { prog: Prog } = $props();

  // Live ticking clock so the active step shows elapsed time in real time.
  let now = $state(Date.now());
  $effect(() => {
    const id = setInterval(() => (now = Date.now()), 200);
    return () => clearInterval(id);
  });

  const fmtMs = (ms: number) => (ms < 1000 ? `${Math.max(0, ms)}ms` : `${(ms / 1000).toFixed(1)}s`);
  const totalElapsed = $derived(now - prog.startedAt);

  function stepTime(step: Step): string {
    if (step.status === 'done' && step.durationMs != null) return fmtMs(step.durationMs);
    if (step.status === 'active' && step.startedAt) return fmtMs(now - step.startedAt);
    return '';
  }
</script>

<div class="absolute inset-0 flex flex-col justify-center gap-1.5 overflow-y-auto bg-background/90 p-3 text-left backdrop-blur-sm">
  <div class="mb-1 flex items-center justify-between">
    <span class="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {prog.error ? 'Failed' : prog.steps.every((s) => s.status === 'done') ? 'Complete' : 'Generating'}
    </span>
    <span class="tabular-nums text-[10px] text-muted-foreground">{fmtMs(totalElapsed)}</span>
  </div>

  {#each prog.steps as step (step.key)}
    <div class="flex items-center gap-2 text-xs">
      <span class="flex h-4 w-4 shrink-0 items-center justify-center">
        {#if step.status === 'done'}
          <Check class="h-3.5 w-3.5 text-green-500" />
        {:else if step.status === 'active' && prog.error}
          <AlertCircle class="h-3.5 w-3.5 text-destructive" />
        {:else if step.status === 'active'}
          <Loader2 class="h-3.5 w-3.5 animate-spin text-primary" />
        {:else}
          <Circle class="h-2 w-2 text-muted-foreground/40" />
        {/if}
      </span>
      <span class="flex-1 truncate {step.status === 'pending' ? 'text-muted-foreground/50' : step.status === 'active' ? 'font-medium' : ''}">
        {step.label}{#if step.detail}<span class="text-muted-foreground"> · {step.detail}</span>{/if}
      </span>
      <span class="shrink-0 tabular-nums text-[10px] text-muted-foreground">{stepTime(step)}</span>
    </div>

    {#if step.status === 'active' && step.key === 'generate'}
      <div class="ml-6 h-1 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-all duration-300" style="width:{Math.max(4, prog.pct)}%"></div>
      </div>
    {/if}
    {#if step.status === 'active' && (step.key === 'download' || step.key === 'upload') && step.pctBytes != null}
      <div class="ml-6 h-1 overflow-hidden rounded-full bg-muted">
        <div class="h-full rounded-full bg-primary transition-all duration-150" style="width:{Math.max(4, step.pctBytes)}%"></div>
      </div>
    {/if}
  {/each}

  {#if prog.error}
    <p class="mt-1 text-[11px] leading-snug text-destructive">{prog.error}</p>
  {/if}
</div>
