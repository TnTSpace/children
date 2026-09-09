<script lang="ts">
  import type { PageProps } from './$types';
  import { goto, invalidateAll } from '$app/navigation';
  import { Button, buttonVariants } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import * as Card from '$lib/components/ui/card/index.js';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
  import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
  import * as Dialog from '$lib/components/ui/dialog/index.js';
  import { cn } from '$lib/utils';
  import { FORMATS, PROJECT_STATUS_LABEL, statusVariant } from '$lib/constants/media';
  import { Sparkles, Coins, Film, EllipsisVertical, FolderOpen, Pencil, RefreshCw, Trash2, AlertCircle, Loader2 } from '@lucide/svelte';

  let { data }: PageProps = $props();

  const formatMeta = (key: string) => FORMATS.find((f) => f.key === key) ?? FORMATS[0];
  const fmtDate = (d: string | Date) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  let deleteTarget = $state<{ id: string; title: string } | null>(null);
  let renameTarget = $state<{ id: string; title: string } | null>(null);
  let renameValue = $state('');
  let working = $state(false);
  let retrying = $state<string | null>(null);
  let errorMsg = $state<string | null>(null);

  async function readError(res: Response, fallback: string) {
    const body = await res.json().catch(() => ({}));
    return body?.message || fallback;
  }

  async function doDelete() {
    if (!deleteTarget) return;
    working = true;
    errorMsg = null;
    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Could not delete project'));
      deleteTarget = null;
      await invalidateAll();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Delete failed';
    } finally {
      working = false;
    }
  }

  async function doRename() {
    if (!renameTarget || !renameValue.trim()) return;
    working = true;
    errorMsg = null;
    try {
      const res = await fetch(`/api/projects/${renameTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameValue.trim() })
      });
      if (!res.ok) throw new Error(await readError(res, 'Could not rename project'));
      renameTarget = null;
      await invalidateAll();
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Rename failed';
    } finally {
      working = false;
    }
  }

  async function doRetry(id: string) {
    retrying = id;
    errorMsg = null;
    try {
      const res = await fetch(`/api/projects/${id}/retry`, { method: 'POST' });
      if (!res.ok) throw new Error(await readError(res, 'Could not rebuild the breakdown'));
      await goto(`/projects/${id}`);
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : 'Retry failed';
    } finally {
      retrying = null;
    }
  }
</script>

<svelte:head><title>Projects | toolsntuts Studio</title></svelte:head>

<div class="flex items-center justify-between gap-4 py-4">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Projects</h1>
    <p class="text-sm text-muted-foreground">Your AI-generated films, shorts, and ads.</p>
  </div>
  <div class="flex items-center gap-3">
    <Badge variant="outline" class="gap-1.5 py-1.5">
      <Coins class="h-3.5 w-3.5 text-amber-500" />
      <span class="font-semibold">{data.wallet.balance}</span> credits
    </Badge>
    <Button href="/projects/new" class="gap-2"><Sparkles class="h-4 w-4" /> New project</Button>
  </div>
</div>

{#if errorMsg}
  <div class="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
    <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" /><span>{errorMsg}</span>
  </div>
{/if}

{#if data.projects.length === 0}
  <div class="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
    <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
      <Film class="h-7 w-7 text-primary" />
    </div>
    <h2 class="text-lg font-semibold">No projects yet</h2>
    <p class="mb-6 max-w-sm text-sm text-muted-foreground">
      Describe an idea and the studio breaks it into scenes, generates each shot, and stitches them into a finished video.
    </p>
    <Button href="/projects/new" size="lg" class="gap-2"><Sparkles class="h-4 w-4" /> Create your first project</Button>
  </div>
{:else}
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.projects as p (p.id)}
      {@const fmt = formatMeta(p.format)}
      <div class="group relative">
        <a href={`/projects/${p.id}`} class="block">
          <Card.Root class="h-full transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
            <Card.Header>
              <div class="mb-1 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-muted-foreground">
                  <fmt.icon class="h-4 w-4" />
                  {fmt.label}
                </div>
                <Badge variant={statusVariant(p.status)} class="mr-7">{PROJECT_STATUS_LABEL[p.status] ?? p.status}</Badge>
              </div>
              <Card.Title class="line-clamp-1">{p.title}</Card.Title>
              <Card.Description class="line-clamp-2 min-h-[2.5rem]">{p.brief ?? 'No brief'}</Card.Description>
            </Card.Header>
            <Card.Footer class="justify-between text-xs text-muted-foreground">
              <span>{p.aspectRatio} · ~{p.targetDurationSec ?? '—'}s</span>
              <span>Updated {fmtDate(p.updatedAt)}</span>
            </Card.Footer>
          </Card.Root>
        </a>

        <!-- Actions menu (sibling of the link so it doesn't trigger navigation) -->
        <div class="absolute right-3 top-3 z-10">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  aria-label="Project actions"
                  class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'h-7 w-7 bg-background/70 backdrop-blur hover:bg-background')}
                >
                  {#if retrying === p.id}<Loader2 class="h-4 w-4 animate-spin" />{:else}<EllipsisVertical class="h-4 w-4" />{/if}
                </button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end" class="w-44">
              <DropdownMenu.Item class="cursor-pointer" onclick={() => goto(`/projects/${p.id}`)}>
                <FolderOpen class="size-4" /> Open
              </DropdownMenu.Item>
              <DropdownMenu.Item class="cursor-pointer" onclick={() => { renameTarget = { id: p.id, title: p.title }; renameValue = p.title; }}>
                <Pencil class="size-4" /> Rename
              </DropdownMenu.Item>
              <DropdownMenu.Item class="cursor-pointer" disabled={retrying === p.id} onclick={() => doRetry(p.id)}>
                <RefreshCw class="size-4" /> Retry breakdown
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item
                class="cursor-pointer text-destructive data-highlighted:text-destructive"
                onclick={() => (deleteTarget = { id: p.id, title: p.title })}
              >
                <Trash2 class="size-4" /> Delete
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    {/each}
  </div>
{/if}

<!-- Delete confirmation -->
<AlertDialog.Root open={!!deleteTarget} onOpenChange={(o) => { if (!o) deleteTarget = null; }}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Delete “{deleteTarget?.title}”?</AlertDialog.Title>
      <AlertDialog.Description>
        This permanently removes the project and all its scenes, shots, and generated media. This cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel disabled={working}>Cancel</AlertDialog.Cancel>
      <AlertDialog.Action
        class={buttonVariants({ variant: 'destructive' })}
        disabled={working}
        onclick={(e) => { e.preventDefault(); doDelete(); }}
      >
        {#if working}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{/if} Delete
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>

<!-- Rename -->
<Dialog.Root open={!!renameTarget} onOpenChange={(o) => { if (!o) renameTarget = null; }}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Rename project</Dialog.Title>
    </Dialog.Header>
    <form onsubmit={(e) => { e.preventDefault(); doRename(); }} class="space-y-4">
      <Input bind:value={renameValue} placeholder="Project title" autofocus />
      <Dialog.Footer>
        <Button type="button" variant="ghost" onclick={() => (renameTarget = null)} disabled={working}>Cancel</Button>
        <Button type="submit" disabled={working || !renameValue.trim()}>
          {#if working}<Loader2 class="mr-2 h-4 w-4 animate-spin" />{/if} Save
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
