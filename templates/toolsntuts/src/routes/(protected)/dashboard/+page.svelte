<script lang="ts">
  import type { PageProps } from './$types';
  import * as Card from '$lib/components/ui/card/index.js';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Film, CheckCircle2, Coins, TrendingUp, Sparkles, ArrowRight } from '@lucide/svelte';
  import type { User } from '$lib/auth';
  import { page } from '$app/state';
  import { FORMATS, PROJECT_STATUS_LABEL, statusVariant } from '$lib/constants/media';

  let { data }: PageProps = $props();
  const user = page.data.user as User;
  const isAdmin = $derived(user?.role === 'admin' || user?.role === 'superadmin');

  const readyCount = $derived(data.projects.filter((p) => p.status === 'ready').length);
  const recent = $derived(data.projects.slice(0, 5));
  const formatMeta = (key: string) => FORMATS.find((f) => f.key === key) ?? FORMATS[0];
</script>

<svelte:head><title>Dashboard | toolsntuts Studio</title></svelte:head>

<div class="flex flex-col gap-6 py-4">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <div>
      <h1 class="text-3xl font-bold">Welcome back, {user?.name || 'creator'} 👋</h1>
      <p class="text-muted-foreground">{isAdmin ? 'Turn ideas into finished videos.' : 'Your AI productivity workspace.'}</p>
    </div>
    {#if isAdmin}
      <Button href="/projects/new" class="gap-2"><Sparkles class="h-4 w-4" /> New project</Button>
    {/if}
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Projects</Card.Title>
        <Film class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{data.projects.length}</div>
        <p class="text-xs text-muted-foreground">Total created</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Ready</Card.Title>
        <CheckCircle2 class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-green-500">{readyCount}</div>
        <p class="text-xs text-muted-foreground">Finished videos</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Credits</Card.Title>
        <Coins class="h-4 w-4 text-amber-500" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{data.wallet.balance}</div>
        {#if isAdmin}
          <p class="text-xs text-muted-foreground"><a href="/credits" class="hover:underline">View ledger →</a></p>
        {:else}
          <p class="text-xs text-muted-foreground">Available balance</p>
        {/if}
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Lifetime spent</Card.Title>
        <TrendingUp class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{data.wallet.lifetimeSpent}</div>
        <p class="text-xs text-muted-foreground">Credits used</p>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Recent projects (admin-only) -->
  {#if isAdmin}
    <Card.Root>
      <Card.Header class="flex flex-row items-center justify-between">
        <Card.Title>Recent projects</Card.Title>
        <Button href="/projects" variant="ghost" size="sm" class="gap-1">All <ArrowRight class="h-3.5 w-3.5" /></Button>
      </Card.Header>
      <Card.Content>
        {#if recent.length === 0}
          <div class="py-8 text-center text-sm text-muted-foreground">
            No projects yet. <a href="/projects/new" class="text-primary hover:underline">Create your first →</a>
          </div>
        {:else}
          <div class="divide-y">
            {#each recent as p (p.id)}
              {@const fmt = formatMeta(p.format)}
              <a href={`/projects/${p.id}`} class="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-muted/40 -mx-2 px-2 rounded-md">
                <div class="flex min-w-0 items-center gap-3">
                  <fmt.icon class="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span class="truncate font-medium">{p.title}</span>
                </div>
                <Badge variant={statusVariant(p.status)}>{PROJECT_STATUS_LABEL[p.status] ?? p.status}</Badge>
              </a>
            {/each}
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  {:else}
    <Card.Root class="border-primary/20 bg-primary/5">
      <Card.Header>
        <Card.Title class="flex items-center gap-2"><Sparkles class="h-4 w-4 text-primary" /> AI Video Studio</Card.Title>
        <Card.Description>The toolsntuts AI video studio lets you turn any idea into a captivating 90-second video — cinematic series, viral shorts, lesson content, and more.</Card.Description>
      </Card.Header>
      <Card.Content class="text-sm text-muted-foreground">
        Studio access is currently available to admins. Your account is active and will be upgraded when access opens to all users.
      </Card.Content>
    </Card.Root>
  {/if}
</div>
