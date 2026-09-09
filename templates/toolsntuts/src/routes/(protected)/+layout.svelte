<script lang="ts">
  import type { LayoutProps } from "./$types";
  import AppSidebar from "$lib/components/app-sidebar.svelte";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import ModeToggle from "$lib/components/widgets/ModeToggle.svelte";
  import CrumbPath from "$lib/components/ui/crumb-path/crumb-path.svelte";
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import CreditsIndicator from "$lib/components/widgets/CreditsIndicator.svelte";
  import CreditBalance from "$lib/components/widgets/CreditBalance.svelte";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import type { User } from "$lib/auth";
  import { pendingBuild } from "$lib/states/pending-build.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Loader2, CheckCircle2, AlertCircle, X, ArrowRight, Clapperboard } from "@lucide/svelte";
  import MobileNav from "$lib/components/mobile-nav.svelte";

  let { children }: LayoutProps = $props();
  const user = $derived(page.data.user as User | undefined);

  // Restore any in-flight build after a hard refresh
  onMount(() => {
    pendingBuild.restoreFromStorage();
  });

  function openProject() {
    if (!pendingBuild.projectId) return;
    const url = pendingBuild.done && !pendingBuild.failed
      ? `/projects/${pendingBuild.projectId}?autoStart=storyboards`
      : `/projects/new`;
    pendingBuild.dismiss();
    goto(url);
  }
</script>

<Sidebar.Provider>
  <AppSidebar />
  <Sidebar.Inset>
    <header
      class="sticky top-0 left-0 z-[1] flex h-16 shrink-0 items-center justify-between gap-2 backdrop-blur-xs transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div class="flex items-center gap-2 px-4">
        <Sidebar.Trigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
        <CrumbPath />
      </div>
      <div class="flex items-center gap-2 pr-4">
        {#if user?.role === 'superadmin'}
          <CreditsIndicator />
        {/if}
        {#if user}
          <CreditBalance />
        {/if}
        <ModeToggle />
        <AuthDialog />
      </div>
    </header>
    <div class="flex flex-1 flex-col gap-4 p-4 py-0 pb-20 md:pb-0 animate-in">
      <QueryClientProvider client={infiniteScroll.queryClient}>
        {@render children()}
        <SvelteQueryDevtools />
      </QueryClientProvider>
    </div>
  </Sidebar.Inset>
  <MobileNav />
</Sidebar.Provider>

<!-- Floating build chip — shown when minimized or done/failed -->
{#if pendingBuild.projectId && pendingBuild.minimized}
  <div
    class="fixed bottom-20 right-4 md:bottom-5 md:right-5 z-60 w-72 rounded-2xl border bg-card shadow-2xl overflow-hidden
      transition-all duration-300 animate-in slide-in-from-bottom-4"
    role="status"
    aria-live="polite"
  >
    <!-- State: in-progress -->
    {#if !pendingBuild.done}
      <div class="flex items-start gap-3 p-4">
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Loader2 class="h-4 w-4 animate-spin text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium leading-tight">Building your project</p>
          <p class="mt-0.5 text-xs text-muted-foreground line-clamp-1">{pendingBuild.label}</p>
          <!-- Step dots -->
          <div class="mt-2 flex gap-1">
            {#each [1, 2, 3, 4, 5] as n}
              <div
                class="h-1 flex-1 rounded-full transition-all duration-500
                  {pendingBuild.step > n ? 'bg-primary' :
                   pendingBuild.step === n ? 'bg-primary/50' :
                   'bg-muted'}"
              ></div>
            {/each}
          </div>
        </div>
        <button
          class="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Dismiss"
          onclick={() => pendingBuild.dismiss()}
          aria-label="Dismiss"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>

    <!-- State: done (success) -->
    {:else if !pendingBuild.failed}
      <div class="flex items-start gap-3 p-4">
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Clapperboard class="h-4 w-4 text-primary" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium leading-tight">Project ready!</p>
          <p class="mt-0.5 text-xs text-muted-foreground">Storyboards are generating</p>
        </div>
        <div class="flex shrink-0 items-center gap-1">
          <Button size="sm" class="h-7 gap-1 px-2 text-xs" onclick={openProject}>
            Open <ArrowRight class="h-3 w-3" />
          </Button>
          <button
            class="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onclick={() => pendingBuild.dismiss()}
            aria-label="Dismiss"
          >
            <X class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    <!-- State: failed -->
    {:else}
      <div class="flex items-start gap-3 p-4">
        <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
          <AlertCircle class="h-4 w-4 text-destructive" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-medium leading-tight">Build failed</p>
          <p class="mt-0.5 text-xs text-muted-foreground line-clamp-2">{pendingBuild.error ?? 'Please try again.'}</p>
        </div>
        <button
          class="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onclick={() => pendingBuild.dismiss()}
          aria-label="Dismiss"
        >
          <X class="h-3.5 w-3.5" />
        </button>
      </div>
    {/if}
  </div>
{/if}
