<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { ArrowLeft, Loader2, ImageIcon, Check } from '@lucide/svelte';
  import { cn } from '$lib/utils';

  // ─── Props ────────────────────────────────────────────────────────────────
  let {
    shotId,
    currentProjectId,
    open = $bindable(false),
    onSeeded,
  }: {
    shotId: string;
    currentProjectId: string;
    open?: boolean;
    onSeeded?: (assetId: string, url: string) => void;
  } = $props();

  // ─── State ────────────────────────────────────────────────────────────────
  type Project = { id: string; title: string; format: string; aspectRatio: string };
  type Keyframe = { shotId: string; shotNumber: number; prompt: string; assetId: string; url: string };

  let projects = $state<Project[]>([]);
  let loadingProjects = $state(false);
  let selectedProject = $state<Project | null>(null);
  let keyframes = $state<Keyframe[]>([]);
  let loadingKeyframes = $state(false);
  let seedingAssetId = $state<string | null>(null);
  let error = $state<string | null>(null);

  // ─── Fetch projects when dialog opens ────────────────────────────────────
  $effect(() => {
    if (!open) {
      selectedProject = null;
      keyframes = [];
      error = null;
      return;
    }
    fetchProjects();
  });

  async function fetchProjects() {
    loadingProjects = true;
    error = null;
    try {
      const res = await fetch('/api/projects', { credentials: 'include' });
      const data = await res.json();
      if (!data.ok) { error = data.error || 'Failed to load projects'; return; }
      // Exclude current project
      projects = (data.projects as Project[]).filter((p) => p.id !== currentProjectId);
    } catch (e: any) {
      error = e?.message || 'Network error';
    } finally {
      loadingProjects = false;
    }
  }

  async function selectProject(proj: Project) {
    selectedProject = proj;
    keyframes = [];
    loadingKeyframes = true;
    error = null;
    try {
      const res = await fetch(`/api/projects/keyframes?projectId=${proj.id}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.ok) { error = data.error || 'Failed to load images'; return; }
      keyframes = data.keyframes ?? [];
    } catch (e: any) {
      error = e?.message || 'Network error';
    } finally {
      loadingKeyframes = false;
    }
  }

  async function seedKeyframe(kf: Keyframe) {
    seedingAssetId = kf.assetId;
    error = null;
    try {
      const res = await fetch('/api/shots/seed-keyframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ shotId, sourceAssetId: kf.assetId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) { error = data.error || 'Failed to seed character'; return; }
      onSeeded?.(data.assetId, data.url);
      open = false;
    } catch (e: any) {
      error = e?.message || 'Network error';
    } finally {
      seedingAssetId = null;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2">
        {#if selectedProject}
          <button
            type="button"
            onclick={() => { selectedProject = null; keyframes = []; }}
            class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors text-sm font-normal"
          >
            <ArrowLeft class="h-3.5 w-3.5" />
            Projects
          </button>
          <span class="text-muted-foreground">/</span>
          {selectedProject.title}
        {:else}
          Seed character from project
        {/if}
      </Dialog.Title>
      <Dialog.Description>
        {#if selectedProject}
          Click any storyboard to use it as the character reference for this shot.
        {:else}
          Pick a project to browse its storyboard images.
        {/if}
      </Dialog.Description>
    </Dialog.Header>

    {#if error}
      <p class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
    {/if}

    <!-- Project list -->
    {#if !selectedProject}
      {#if loadingProjects}
        <div class="flex items-center justify-center py-12">
          <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      {:else if projects.length === 0}
        <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ImageIcon class="h-8 w-8 text-muted-foreground/40" />
          <p class="text-sm text-muted-foreground">No other projects found.</p>
          <p class="text-xs text-muted-foreground">Generate storyboards in another project first, then come back to seed characters.</p>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-2">
          {#each projects as proj (proj.id)}
            <button
              type="button"
              onclick={() => selectProject(proj)}
              class="group flex items-start gap-3 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold">{proj.title}</p>
                <div class="mt-1 flex flex-wrap gap-1">
                  <Badge variant="secondary" class="text-[10px]">{proj.format?.replace('_', ' ')}</Badge>
                  <Badge variant="outline" class="text-[10px]">{proj.aspectRatio}</Badge>
                </div>
              </div>
              <ArrowLeft class="mt-0.5 h-4 w-4 rotate-180 text-muted-foreground/40 transition group-hover:text-primary" />
            </button>
          {/each}
        </div>
      {/if}
    {:else}
      <!-- Keyframe grid -->
      {#if loadingKeyframes}
        <div class="flex items-center justify-center py-12">
          <Loader2 class="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      {:else if keyframes.length === 0}
        <div class="flex flex-col items-center justify-center gap-2 py-12 text-center">
          <ImageIcon class="h-8 w-8 text-muted-foreground/40" />
          <p class="text-sm text-muted-foreground">No storyboards in this project yet.</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 max-h-[50vh] overflow-y-auto pr-1">
          {#each keyframes as kf (kf.assetId)}
            <button
              type="button"
              onclick={() => seedKeyframe(kf)}
              disabled={seedingAssetId !== null}
              class={cn(
                "group relative overflow-hidden rounded-lg border text-left transition-all hover:border-primary hover:ring-2 hover:ring-primary/20",
                "disabled:cursor-wait disabled:opacity-70",
              )}
            >
              <div class="aspect-video w-full overflow-hidden bg-muted">
                <img src={kf.url} alt={kf.prompt} class="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
              </div>
              <div class="p-2">
                <p class="text-[10px] font-bold text-muted-foreground">Shot {kf.shotNumber}</p>
                <p class="line-clamp-2 text-[10px] leading-tight text-foreground/80">{kf.prompt}</p>
              </div>
              {#if seedingAssetId === kf.assetId}
                <div class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-sm">
                  <Loader2 class="h-5 w-5 animate-spin text-primary" />
                </div>
              {/if}
              <div class="absolute right-1.5 top-1.5 rounded-full bg-primary p-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <Check class="h-3 w-3 text-primary-foreground" />
              </div>
            </button>
          {/each}
        </div>
      {/if}
    {/if}
  </Dialog.Content>
</Dialog.Root>
