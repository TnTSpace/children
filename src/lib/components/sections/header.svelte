<script lang="ts">
  import { page } from '$app/state';
  import BrandLink from '$lib/components/widgets/BrandLink.svelte';
  import { Home, LayoutDashboard } from '@lucide/svelte';
  import ModeToggle from '$lib/components/widgets/ModeToggle.svelte';
  import { Button } from '$lib/components/ui/button';
  import type { User } from '$lib/auth';
  import { Role, getNavigation } from '$lib/constants';
  import AuthDialog from '$lib/authentication/ui/user/auth-dialog.svelte';

  const user = page.data.user as User | undefined;
  const navData = getNavigation(page.url.pathname);
  const navigation = $derived(user ? navData.privateNav : navData.publicNav);
  const isActive = (path: string) => page.url.pathname === path;

  // The homepage hero renders a full-bleed image behind the header, so the
  // header floats transparent over it until the reader scrolls past the
  // hero — same idea as templates/toolsntuts's header. Every other route
  // keeps a normal solid header (and needs a spacer, since this header is
  // now `fixed` instead of `sticky`).
  const isHome = $derived(page.url.pathname === '/');
  let scrolled = $state(false);
  $effect(() => {
    if (!isHome) return;
    const onScroll = () => (scrolled = window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });
  const transparent = $derived(isHome && !scrolled);
</script>

{#if !isHome}
  <div class="h-16 print:hidden"></div>
{/if}

<header
  class="fixed inset-x-0 top-0 z-50 transition-colors duration-300 print:hidden {transparent
    ? 'bg-transparent'
    : 'border-b bg-background/95 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/80'}"
>
  <div class="center">
    <div class="flex h-16 items-center justify-between">
      <BrandLink />
      <div class="flex items-center space-x-4">
        <nav class="hidden space-x-2 md:flex">
          {#each navigation as item}
            {#if !user || (user && item.roles.includes(user.role as Role))}
              <Button href={item.href} variant={isActive(item.href) ? 'default' : 'outline'} size="sm">
                <item.icon class="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            {/if}
          {/each}
        </nav>
        <ModeToggle />
        <AuthDialog />
      </div>
    </div>
  </div>
</header>
