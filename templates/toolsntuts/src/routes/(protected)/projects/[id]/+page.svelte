<script lang="ts">
  import type { PageProps } from './$types';
  import { invalidateAll } from '$app/navigation';
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import * as Card from '$lib/components/ui/card/index.js';
  import {
    FORMATS,
    PROJECT_STATUS_LABEL,
    SHOT_STATUS_LABEL,
    statusVariant,
    modelCredits,
    DEFAULT_IMAGE_MODEL,
    DEFAULT_VIDEO_MODEL
  } from '$lib/constants/media';
  import type { Shot, Asset } from '$lib/db/media';
  import GenerationProgress from '$lib/components/studio/GenerationProgress.svelte';
  import SeedFromProjectDialog from '$lib/components/studio/SeedFromProjectDialog.svelte';
  import { type Prog, type StepKey, STEP_ORDER } from '$lib/components/studio/progress-types';
  import {
    Coins, Image, Clapperboard, Loader2, Link2, AlertCircle, ArrowLeft,
    Sparkles, RefreshCw, Film, Download, Mic, FolderOpen, Zap, ChevronRight
  } from '@lucide/svelte';
  import { page } from '$app/state';
  import type { User } from '$lib/auth';

  let { data }: PageProps = $props();
  const isAdmin = $derived((page.data.user as User)?.role === 'admin' || (page.data.user as User)?.role === 'superadmin');

  let errorMsg = $state<string | null>(null);
  let creditWarning = $state<string | null>(null);
  let seedDialogShotId = $state<string | null>(null);
  let seedDialogOpen = $state(false);
  let pipelineRunning = $state(false);

  let retrying = $state(false);
  async function retryBreakdown() {
    retrying = true;
    errorMsg = null;
    try {
      const res = await fetch(`/api/projects/${data.project.id}/retry`, { method: 'POST' });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Could not rebuild the breakdown');
      }
      await invalidateAll();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Retry failed';
    } finally {
      retrying = false;
    }
  }

  const assetById = $derived(new Map<string, Asset>(data.assets.map((a) => [a.id, a])));
  const shotsByScene = $derived((sceneId: string) => data.shots.filter((s) => s.sceneId === sceneId));
  const assetUrl = (id: string | null) => (id ? assetById.get(id)?.url ?? null : null);

  const imgCost = modelCredits(DEFAULT_IMAGE_MODEL);
  const vidCost = modelCredits(DEFAULT_VIDEO_MODEL);
  const needsStoryboard = $derived(data.shots.filter((s) => !s.keyframeAssetId).length);
  const needsVideo = $derived(data.shots.filter((s) => s.keyframeAssetId && !s.videoAssetId).length);
  const needsVoiceover = $derived(data.shots.filter((s) => (s.narration ?? '').trim() && !s.voiceAssetId).length);
  const allVideosReady = $derived(data.shots.length > 0 && data.shots.every((s) => s.videoAssetId));
  const finalVideoUrl = $derived(data.render?.outputAssetId ? assetUrl(data.render.outputAssetId) : null);
  const displayStatus = (s: Shot) => (s.videoAssetId ? 'ready' : s.keyframeAssetId ? 'storyboard_ready' : s.status);

  // Overall production progress (0-100)
  const totalShots = $derived(data.shots.length);
  const doneStoryboards = $derived(data.shots.filter((s) => s.keyframeAssetId).length);
  const doneVideos = $derived(data.shots.filter((s) => s.videoAssetId).length);
  const overallPct = $derived(totalShots > 0 ? Math.round(((doneStoryboards + doneVideos) / (totalShots * 2)) * 100) : 0);

  // Pipeline cost preview
  const pipelineCreditCost = $derived(needsStoryboard * imgCost + needsVideo * vidCost);

  // ── Live generation progress (SSE-driven) ──
  let progress = $state<Record<string, Prog>>({});
  const mb = (n: number) => (n / 1048576).toFixed(1);
  const activeCount = $derived(Object.keys(progress).length);

  function makeProg(kind: 'video' | 'image'): Prog {
    const now = Date.now();
    return {
      kind, pct: 0, startedAt: now,
      steps: [
        { key: 'submit', label: 'Submitting to AI', status: 'active', startedAt: now },
        { key: 'generate', label: kind === 'video' ? 'Generating video' : 'Generating storyboard', status: 'pending' },
        { key: 'download', label: 'Downloading result', status: 'pending' },
        { key: 'upload', label: 'Saving to storage', status: 'pending' },
        { key: 'done', label: 'Done', status: 'pending' }
      ]
    };
  }

  function advance(p: Prog, toKey: StepKey, now: number, detail?: string, pctBytes?: number | null): Prog {
    const toIdx = STEP_ORDER.indexOf(toKey);
    const steps = p.steps.map((s) => {
      const idx = STEP_ORDER.indexOf(s.key);
      if (idx < toIdx) return s.status === 'done' ? s : { ...s, status: 'done' as const, durationMs: s.startedAt ? now - s.startedAt : s.durationMs };
      if (idx === toIdx) return { ...s, status: 'active' as const, startedAt: s.status === 'active' ? s.startedAt : now, detail: detail ?? s.detail, pctBytes: pctBytes !== undefined ? pctBytes : s.pctBytes };
      return s;
    });
    return { ...p, steps };
  }

  function finishAll(p: Prog, now: number): Prog {
    return { ...p, steps: p.steps.map((s) => (s.status === 'done' ? s : { ...s, status: 'done' as const, durationMs: s.startedAt ? now - s.startedAt : 0 })) };
  }

  function clearProg(id: string) {
    const next = { ...progress };
    delete next[id];
    progress = next;
  }

  function bytesDetail(loaded: number, total: number) {
    return total ? `${mb(loaded)} / ${mb(total)} MB` : `${mb(loaded)} MB`;
  }

  interface GenResult { ok: boolean; creditExhausted: boolean }

  function runGeneration(shot: Shot, type: 'storyboard' | 'video'): Promise<GenResult> {
    return new Promise<GenResult>((resolve) => {
      errorMsg = null;
      creditWarning = null;
      const kind: 'video' | 'image' = type === 'video' ? 'video' : 'image';
      progress = { ...progress, [shot.id]: makeProg(kind) };

      const update = (fn: (p: Prog) => Prog) => {
        const cur = progress[shot.id];
        if (cur) progress = { ...progress, [shot.id]: fn(cur) };
      };

      let done = false;
      const finish = async (ok: boolean, creditExhausted = false, err?: string, es?: EventSource) => {
        if (done) return;
        done = true;
        es?.close();
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('xepho:credits-changed'));
        if (!ok && err && !creditExhausted) errorMsg = err;
        await invalidateAll();
        if (ok) clearProg(shot.id);
        else setTimeout(() => clearProg(shot.id), 4000);
        resolve({ ok, creditExhausted });
      };

      (async () => {
        let jobId: string;
        try {
          const res = await fetch(`/api/shots/${shot.id}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
          });
          if (!res.ok) {
            const body = await res.json().catch(() => ({} as Record<string, unknown>));
            const creditExhausted = res.status === 402 || body.code === 'wavespeed_credits_exhausted';
            const errMsg = (body.message as string) || `Could not start generation (${res.status})`;
            update((p) => ({ ...p, error: creditExhausted ? 'Credit limit reached' : errMsg }));
            await finish(false, creditExhausted, creditExhausted ? undefined : errMsg);
            return;
          }
          jobId = (await res.json()).jobId;
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : 'Could not start generation';
          update((p) => ({ ...p, error: errMsg }));
          await finish(false, false, errMsg);
          return;
        }

        const es = new EventSource(`/api/jobs/${jobId}/stream`);
        es.onmessage = (ev) => {
          let m: { stage: string; progress?: number; loaded?: number; total?: number; error?: string };
          try { m = JSON.parse(ev.data); } catch { return; }
          const now = Date.now();
          switch (m.stage) {
            case 'submitted': update((p) => advance(p, 'generate', now)); break;
            case 'generating': update((p) => ({ ...advance(p, 'generate', now), pct: typeof m.progress === 'number' ? m.progress : p.pct })); break;
            case 'downloading': update((p) => advance(p, 'download', now, bytesDetail(m.loaded ?? 0, m.total ?? 0), m.total ? Math.round(((m.loaded ?? 0) / m.total) * 100) : null)); break;
            case 'uploading': update((p) => advance(p, 'upload', now, bytesDetail(m.loaded ?? 0, m.total ?? 0), m.total ? Math.round(((m.loaded ?? 0) / m.total) * 100) : null)); break;
            case 'completed': update((p) => finishAll(p, now)); finish(true, false, undefined, es); break;
            case 'failed': update((p) => ({ ...p, error: m.error || 'Generation failed' })); finish(false, false, m.error || 'Generation failed', es); break;
          }
        };
        es.onerror = () => finish(false, false, 'Connection lost during generation.', es);
      })();
    });
  }

  /**
   * Run shots through generation with a bounded worker pool.
   * Returns true if credit exhaustion was hit.
   */
  async function runParallel(shots: Shot[], type: 'storyboard' | 'video', concurrency: number): Promise<boolean> {
    const queue = [...shots];
    let exhausted = false;
    async function worker() {
      while (true) {
        if (exhausted) break;
        const shot = queue.shift();
        if (!shot) break;
        const r = await runGeneration(shot, type);
        if (r.creditExhausted) { exhausted = true; queue.length = 0; }
      }
    }
    const n = Math.min(concurrency, shots.length);
    if (n === 0) return false;
    await Promise.all(Array.from({ length: n }, worker));
    return exhausted;
  }

  async function generateAllStoryboards() {
    const pending = data.shots.filter((s) => !s.keyframeAssetId && !progress[s.id]);
    const exhausted = await runParallel(pending, 'storyboard', 4);
    if (exhausted) {
      const ready = data.shots.filter((s) => s.keyframeAssetId).length;
      creditWarning = `Credit limit reached after ${ready} storyboard${ready !== 1 ? 's' : ''}. Top up to continue.`;
    }
  }

  async function generateAllVideos() {
    const pending = data.shots.filter((s) => s.keyframeAssetId && !s.videoAssetId && !progress[s.id]);
    const exhausted = await runParallel(pending, 'video', 2);
    if (exhausted) {
      await invalidateAll();
      const ready = data.shots.filter((s) => s.videoAssetId).length;
      creditWarning = `Credit limit reached after ${ready} clip${ready !== 1 ? 's' : ''}. Auto-assembling what's ready…`;
      if (ready > 0) assemble();
    }
  }

  /** One-click pipeline: storyboards → videos in sequence, each phase parallel */
  async function generatePipeline() {
    pipelineRunning = true;
    try {
      // Phase 1: storyboards (4 parallel)
      const needImg = data.shots.filter((s) => !s.keyframeAssetId && !progress[s.id]);
      if (needImg.length > 0) {
        const exhausted = await runParallel(needImg, 'storyboard', 4);
        if (exhausted) {
          const ready = data.shots.filter((s) => s.keyframeAssetId).length;
          creditWarning = `Credit limit reached at storyboard phase after ${ready} images.`;
          return;
        }
      }
      // Phase 2: videos (2 parallel — expensive, controlled)
      await invalidateAll();
      const needVid = data.shots.filter((s) => s.keyframeAssetId && !s.videoAssetId && !progress[s.id]);
      if (needVid.length > 0) {
        const exhausted = await runParallel(needVid, 'video', 2);
        if (exhausted) {
          await invalidateAll();
          const ready = data.shots.filter((s) => s.videoAssetId).length;
          creditWarning = `Credit limit reached at video phase after ${ready} clips.`;
          if (ready > 0) assemble();
          return;
        }
      }
    } finally {
      pipelineRunning = false;
    }
  }

  // ── Assembly progress ──
  let stageProg = $state<{ label: string; pct: number; detail?: string; error?: string } | null>(null);
  function assemble() {
    if (stageProg) return;
    errorMsg = null;
    stageProg = { label: 'Starting…', pct: 1 };
    const es = new EventSource(`/api/projects/${data.project.id}/assemble`);
    let done = false;
    const finish = async (ok: boolean, err?: string) => {
      if (done) return; done = true; es.close();
      if (!ok && err) errorMsg = err;
      await invalidateAll();
      if (ok) stageProg = null;
      else setTimeout(() => (stageProg = null), 5000);
    };
    es.onmessage = (ev) => {
      const m = (() => { try { return JSON.parse(ev.data); } catch { return null; } })();
      if (!m) return;
      if (m.stage === 'gathering') stageProg = { label: `Preparing ${m.total} clips`, pct: 2 };
      else if (m.stage === 'downloading') stageProg = { label: 'Collecting clips', detail: `${m.index}/${m.total}`, pct: Math.round((m.index / m.total) * 25) };
      else if (m.stage === 'stitching') stageProg = { label: 'Stitching video', detail: `${m.progress ?? 0}%`, pct: 25 + Math.round((m.progress ?? 0) * 0.6) };
      else if (m.stage === 'uploading') stageProg = { label: 'Saving final video', detail: `${mb(m.loaded ?? 0)} MB`, pct: 85 + Math.round(((m.loaded ?? 0) / (m.total || 1)) * 15) };
      else if (m.stage === 'completed') { stageProg = { label: 'Complete', pct: 100 }; finish(true); }
      else if (m.stage === 'failed') { stageProg = { label: 'Failed', pct: 0, error: m.error }; finish(false, m.error); }
    };
    es.onerror = () => finish(false, 'Connection lost during assembly.');
  }

  function generateVoiceovers() {
    if (stageProg) return;
    errorMsg = null;
    stageProg = { label: 'Starting narration…', pct: 1 };
    const es = new EventSource(`/api/projects/${data.project.id}/voiceover`);
    let done = false;
    const finish = async (ok: boolean, err?: string) => {
      if (done) return; done = true; es.close();
      if (!ok && err) errorMsg = err;
      await invalidateAll();
      if (ok) stageProg = null;
      else setTimeout(() => (stageProg = null), 5000);
    };
    es.onmessage = (ev) => {
      const m = (() => { try { return JSON.parse(ev.data); } catch { return null; } })();
      if (!m) return;
      if (m.stage === 'voicing') stageProg = { label: 'Generating narration', detail: `${m.index}/${m.total}`, pct: Math.round((m.index / m.total) * 100) };
      else if (m.stage === 'completed') { stageProg = { label: 'Narration ready', pct: 100 }; finish(true); }
      else if (m.stage === 'failed') { stageProg = { label: 'Failed', pct: 0, error: m.error }; finish(false, m.error); }
    };
    es.onerror = () => finish(false, 'Connection lost during narration.');
  }

  const fmt = $derived(FORMATS.find((f) => f.key === data.project.format) ?? FORMATS[0]);

  // Auto-start from URL param (set by create page after breakdown)
  onMount(() => {
    const url = new URL(window.location.href);
    const autoStart = url.searchParams.get('autoStart');
    if (autoStart && data.shots.length > 0) {
      url.searchParams.delete('autoStart');
      window.history.replaceState({}, '', url.toString());
      if (autoStart === 'storyboards') generateAllStoryboards();
      else if (autoStart === 'pipeline') generatePipeline();
    }
  });
</script>

<svelte:head><title>{data.project.title} | toolsntuts Studio</title></svelte:head>

<!-- Header -->
<div class="flex flex-wrap items-start justify-between gap-4 py-4">
  <div class="min-w-0">
    <a href="/projects" class="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
      <ArrowLeft class="h-3.5 w-3.5" /> Projects
    </a>
    <h1 class="flex items-center gap-2 text-2xl font-bold tracking-tight">
      <fmt.icon class="h-6 w-6 text-primary" />
      {data.project.title}
    </h1>
    <div class="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Badge variant={statusVariant(data.project.status)}>{PROJECT_STATUS_LABEL[data.project.status] ?? data.project.status}</Badge>
      <span>{fmt.label}</span> · <span>{data.project.aspectRatio}</span> · <span>~{data.project.targetDurationSec}s</span>
      <span>· {data.shots.length} shots</span>
    </div>
  </div>
  <div class="flex flex-wrap items-center gap-2">
    <Badge variant="outline" class="gap-1.5 py-1.5">
      <Coins class="h-3.5 w-3.5 text-amber-500" /><span class="font-semibold">{data.wallet.balance}</span>
    </Badge>

    {#if needsStoryboard > 0 || needsVideo > 0}
      <!-- Pipeline button (one-click full generation) -->
      <Button
        onclick={generatePipeline}
        disabled={activeCount > 0 || !!stageProg || pipelineRunning}
        variant="default"
        class="gap-2"
      >
        {#if pipelineRunning}
          <Loader2 class="h-4 w-4 animate-spin" /> Running pipeline…
        {:else}
          <Zap class="h-4 w-4" /> Generate all
          {#if pipelineCreditCost > 0}
            <Badge variant="secondary" class="ml-1 text-[10px] px-1.5 py-0">{pipelineCreditCost} cr</Badge>
          {/if}
        {/if}
      </Button>
    {/if}

    {#if needsStoryboard > 0}
      <Button
        onclick={generateAllStoryboards}
        disabled={activeCount > 0 || pipelineRunning}
        variant="outline"
        class="gap-2"
      >
        <Sparkles class="h-4 w-4" /> {needsStoryboard} storyboard{needsStoryboard > 1 ? 's' : ''}
      </Button>
    {:else if needsVideo > 0}
      <Button
        onclick={generateAllVideos}
        disabled={activeCount > 0 || !!stageProg || pipelineRunning}
        variant="outline"
        class="gap-2"
      >
        <Clapperboard class="h-4 w-4" /> {needsVideo} video{needsVideo > 1 ? 's' : ''}
      </Button>
    {:else if needsVoiceover > 0}
      <Button onclick={generateVoiceovers} disabled={!!stageProg} variant="outline" class="gap-2">
        <Mic class="h-4 w-4" /> {needsVoiceover} voiceover{needsVoiceover > 1 ? 's' : ''}
      </Button>
    {:else if allVideosReady}
      <Button onclick={assemble} disabled={!!stageProg} class="gap-2">
        <Film class="h-4 w-4" /> {data.render ? 'Re-assemble' : 'Assemble video'}
      </Button>
    {/if}
  </div>
</div>

<!-- Production progress bar -->
{#if totalShots > 0}
  <div class="mb-4 rounded-xl border bg-card px-4 py-3">
    <div class="mb-2 flex items-center justify-between text-xs text-muted-foreground">
      <span class="flex items-center gap-3">
        <span><span class="font-semibold text-foreground">{doneStoryboards}</span>/{totalShots} storyboards</span>
        <ChevronRight class="h-3 w-3 opacity-40" />
        <span><span class="font-semibold text-foreground">{doneVideos}</span>/{totalShots} videos</span>
        {#if activeCount > 0}
          <Badge variant="secondary" class="gap-1 text-[10px]">
            <Loader2 class="h-2.5 w-2.5 animate-spin" /> {activeCount} generating
          </Badge>
        {/if}
      </span>
      <span class="font-medium text-foreground">{overallPct}%</span>
    </div>
    <div class="h-1.5 overflow-hidden rounded-full bg-muted">
      <div
        class="h-full rounded-full bg-primary transition-all duration-700"
        style="width:{overallPct}%"
      ></div>
    </div>
  </div>
{/if}

{#if creditWarning}
  <div class="mb-4 flex items-start gap-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-700 dark:text-amber-300">
    <Coins class="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>{creditWarning}</span>
  </div>
{/if}

{#if errorMsg}
  <div class="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
    <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMsg}</span>
  </div>
{/if}

<!-- Assembly / voiceover progress -->
{#if stageProg}
  <div class="mb-6 rounded-xl border bg-card p-4">
    <div class="mb-2 flex items-center justify-between text-sm">
      <span class="flex items-center gap-2 font-medium">
        {#if stageProg.error}<AlertCircle class="h-4 w-4 text-destructive" />{:else}<Loader2 class="h-4 w-4 animate-spin text-primary" />{/if}
        {stageProg.label}{#if stageProg.detail}<span class="text-muted-foreground"> · {stageProg.detail}</span>{/if}
      </span>
      <span class="tabular-nums text-muted-foreground">{stageProg.pct}%</span>
    </div>
    <div class="h-2 overflow-hidden rounded-full bg-muted">
      <div class="h-full rounded-full bg-primary transition-all duration-300" style="width:{stageProg.pct}%"></div>
    </div>
    {#if stageProg.error}<p class="mt-2 text-xs text-destructive">{stageProg.error}</p>{/if}
  </div>
{/if}

<!-- Final stitched video -->
{#if finalVideoUrl}
  <div class="mb-6 rounded-xl border bg-card p-4">
    <div class="mb-3 flex items-center justify-between">
      <h2 class="flex items-center gap-2 font-semibold"><Film class="h-4 w-4 text-primary" /> Final video</h2>
      <a href={finalVideoUrl} download class="inline-flex items-center gap-1 text-sm text-primary hover:underline">
        <Download class="h-4 w-4" /> Download
      </a>
    </div>
    <!-- svelte-ignore a11y_media_has_caption -->
    <video src={finalVideoUrl} controls class="aspect-video w-full rounded-lg bg-black"></video>
  </div>
{/if}

<!-- References -->
{#if data.references.length}
  <div class="mb-6">
    <h2 class="mb-2 text-sm font-semibold text-muted-foreground">Locked references</h2>
    <div class="flex flex-wrap gap-2">
      {#each data.references as ref (ref.id)}
        <Badge variant="secondary" class="gap-1.5">
          <span class="opacity-60">{ref.kind}</span> {ref.name}
        </Badge>
      {/each}
    </div>
  </div>
{/if}

<!-- Scenes & shots -->
<div class="space-y-8 pb-12">
  {#each data.scenes as scene, i (scene.id)}
    <section>
      <div class="mb-3">
        <h2 class="text-lg font-semibold">{i + 1}. {scene.title ?? `Scene ${i + 1}`}</h2>
        {#if scene.narration}<p class="text-sm text-muted-foreground">{scene.narration}</p>{/if}
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each shotsByScene(scene.id) as shot (shot.id)}
          {@const vurl = assetUrl(shot.videoAssetId)}
          {@const kurl = assetUrl(shot.keyframeAssetId)}
          {@const prog = progress[shot.id]}
          {@const ds = displayStatus(shot)}
          <Card.Root class="overflow-hidden">
            <!-- Media -->
            <div class="relative aspect-video bg-muted">
              {#if vurl}
                <!-- svelte-ignore a11y_media_has_caption -->
                <video src={vurl} controls class="h-full w-full object-cover"></video>
              {:else if kurl}
                <img src={kurl} alt={shot.prompt} class="h-full w-full object-cover" />
              {:else}
                <div class="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <Image class="h-8 w-8" />
                </div>
              {/if}

              {#if prog}
                <GenerationProgress {prog} />
              {/if}

              <div class="absolute left-2 top-2 flex items-center gap-1">
                <Badge variant={statusVariant(ds)} class="text-[10px]">{SHOT_STATUS_LABEL[ds] ?? ds}</Badge>
                {#if shot.chainFromPrevious}
                  <Badge variant="outline" class="gap-0.5 bg-background/80 text-[10px]"><Link2 class="h-3 w-3" /> chain</Badge>
                {/if}
                {#if shot.voiceAssetId}
                  <Badge variant="outline" class="gap-0.5 bg-background/80 text-[10px]"><Mic class="h-3 w-3" /> VO</Badge>
                {/if}
              </div>
            </div>

            <Card.Content class="space-y-2 p-3">
              <p class="line-clamp-2 text-xs text-muted-foreground" title={shot.prompt}>{shot.prompt}</p>
              {#if shot.narration}
                <p class="line-clamp-1 text-xs italic text-foreground/70">"{shot.narration}"</p>
              {/if}
              <div class="flex items-center justify-between gap-2 pt-1">
                <span class="text-[11px] text-muted-foreground">{shot.durationSec}s</span>
                <div class="flex gap-1.5">
                  <Button
                    size="sm" variant="outline" class="h-7 gap-1 px-2 text-xs"
                    disabled={!!prog}
                    onclick={() => runGeneration(shot, 'storyboard')}
                  >
                    <Image class="h-3 w-3" /> {kurl ? 'Redo' : 'Storyboard'} · {imgCost}
                  </Button>
                  {#if !kurl && !prog}
                    <Button
                      size="sm" variant="ghost" class="h-7 gap-1 px-2 text-xs"
                      title="Import character from another project"
                      onclick={() => { seedDialogShotId = shot.id; seedDialogOpen = true; }}
                    >
                      <FolderOpen class="h-3 w-3" /> Seed
                    </Button>
                  {/if}
                  <Button
                    size="sm" class="h-7 gap-1 px-2 text-xs"
                    disabled={!!prog || !shot.keyframeAssetId}
                    title={!shot.keyframeAssetId ? 'Generate a storyboard first' : ''}
                    onclick={() => runGeneration(shot, 'video')}
                  >
                    <Clapperboard class="h-3 w-3" /> Video · {vidCost}
                  </Button>
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        {/each}
      </div>
    </section>
  {/each}

  {#if data.scenes.length === 0}
    <div class="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
      <p class="mb-4 max-w-md text-sm text-muted-foreground">
        No breakdown yet. The pre-production step may have failed — rebuild it from your brief.
      </p>
      <Button onclick={retryBreakdown} disabled={retrying} class="gap-2">
        {#if retrying}<Loader2 class="h-4 w-4 animate-spin" /> Rebuilding…{:else}<RefreshCw class="h-4 w-4" /> Retry breakdown{/if}
      </Button>
    </div>
  {/if}
</div>

{#if seedDialogShotId}
  <SeedFromProjectDialog
    shotId={seedDialogShotId}
    currentProjectId={data.project.id}
    bind:open={seedDialogOpen}
    onSeeded={async (_assetId, _url) => { await invalidateAll(); }}
  />
{/if}
