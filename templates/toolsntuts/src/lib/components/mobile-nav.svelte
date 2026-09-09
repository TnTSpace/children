<script lang="ts">
  import { page } from '$app/state';
  import { Menu } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import * as Sheet from '$lib/components/ui/sheet/index.js';
  import { Separator } from '$lib/components/ui/separator/index.js';
  import { type Role, getNavigation } from '$lib/constants';
  import type { User } from '$lib/auth';

  const user = $derived(page.data.user as User | undefined);
  const nav = $derived(getNavigation(page.url.pathname));

  const PRIMARY_URLS = ['/dashboard', '/projects', '/projects/new', '/credits'] as const;
  const HIGHLIGHT_URL = '/projects/new';

  const primaryNav = $derived(
    nav.navMain
      .filter(item => (PRIMARY_URLS as readonly string[]).includes(item.url) && item.roles.includes((user?.role ?? '') as Role))
      .sort((a, b) => (PRIMARY_URLS as readonly string[]).indexOf(a.url) - (PRIMARY_URLS as readonly string[]).indexOf(b.url))
  );

  function isActive(href: string) {
    if (href === '/projects') {
      return page.url.pathname.startsWith('/projects') && page.url.pathname !== '/projects/new';
    }
    return page.url.pathname === href || page.url.pathname.startsWith(href + '/');
  }

  let sheetOpen = $state(false);
</script>

<!-- ── Fixed bottom bar (mobile only) ─────────────────────────────────────── -->
<nav
  class="fixed bottom-0 inset-x-0 z-50 md:hidden"
  aria-label="Mobile navigation"
>
  <div class="border-t bg-background/95 backdrop-blur-lg shadow-[0_-1px_0_0_hsl(var(--border))]">
    <div
      class="mx-auto flex max-w-sm items-end justify-around px-1"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px); padding-top: 6px;"
    >
      {#each primaryNav as item}
        <a
          href={item.url}
          aria-current={isActive(item.url) ? 'page' : undefined}
          class={cn(
            'flex flex-col items-center gap-0.5 min-w-0 flex-1 px-1 rounded-xl transition-colors duration-150',
            isActive(item.url) ? 'text-primary' : 'text-muted-foreground active:text-foreground'
          )}
        >
          {#if item.url === HIGHLIGHT_URL}
            <!-- FAB-style Create button -->
            <span
              class={cn(
                'mb-1 flex h-11 w-11 items-center justify-center rounded-2xl shadow-lg ring-1 transition-all duration-200',
                isActive(item.url)
                  ? 'bg-primary text-primary-foreground shadow-primary/40 ring-primary/30 scale-105'
                  : 'bg-primary text-primary-foreground shadow-primary/25 ring-primary/20'
              )}
            >
              <item.icon class="h-5 w-5" />
            </span>
            <span class="text-[10px] font-semibold pb-0.5">{item.title}</span>
          {:else}
            <span class="relative flex h-6 items-center justify-center py-0.5">
              <item.icon class="h-[22px] w-[22px]" />
              {#if isActive(item.url)}
                <span class="absolute -bottom-1 left-1/2 h-[3px] w-5 -translate-x-1/2 rounded-full bg-primary"></span>
              {/if}
            </span>
            <span class="text-[10px] font-medium pb-0.5">{item.title}</span>
          {/if}
        </a>
      {/each}

      <!-- More ── opens the full nav sheet -->
      <button
        type="button"
        onclick={() => (sheetOpen = true)}
        aria-label="More navigation"
        class="flex flex-col items-center gap-0.5 min-w-0 flex-1 px-1 rounded-xl text-muted-foreground transition-colors duration-150 active:text-foreground"
      >
        <span class="flex h-6 items-center justify-center py-0.5">
          <Menu class="h-[22px] w-[22px]" />
        </span>
        <span class="text-[10px] font-medium pb-0.5">More</span>
      </button>
    </div>
  </div>
</nav>

<!-- ── Full-nav bottom sheet (opened by More) ─────────────────────────────── -->
{#if user}
  <Sheet.Root bind:open={sheetOpen}>
    <Sheet.Content
      side="bottom"
      class="rounded-t-3xl px-0 pt-3 max-h-[85dvh] flex flex-col gap-0"
      style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 16px);"
    >
      <!-- Drag handle -->
      <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/25 shrink-0"></div>

      <Sheet.Header class="px-5 pb-2 shrink-0">
        <Sheet.Title class="text-base font-semibold">Navigation</Sheet.Title>
      </Sheet.Header>

      <Separator class="shrink-0" />

      <nav class="flex-1 overflow-y-auto px-3 py-3">
        <ul class="grid gap-0.5">
          {#each nav.navMain as item}
            {#if item.roles.includes(user.role as Role)}
              <li>
                <a
                  href={item.url}
                  onclick={() => (sheetOpen = false)}
                  class={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-150',
                    item.isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted active:bg-muted'
                  )}
                >
                  <span
                    class={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      item.isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <item.icon class="h-4 w-4" />
                  </span>
                  <span class="flex-1">{item.title}</span>
                  {#if item.isActive}
                    <span class="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  {/if}
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </nav>
    </Sheet.Content>
  </Sheet.Root>
{/if}
