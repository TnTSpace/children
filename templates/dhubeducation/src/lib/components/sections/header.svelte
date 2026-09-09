<script lang="ts">
  import { page } from "$app/state";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import { Menu, X, ArrowRight, Megaphone } from "@lucide/svelte";
  import ModeToggle from "$lib/components/widgets/ModeToggle.svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import type { User } from "$lib/auth";
  import { Role, getNavigation } from "$lib/constants";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import { fade, slide, fly } from "svelte/transition";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import { ChevronDown } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  let { 
    scrolled = false, 
    onOpenPopup = () => {} 
  }: { 
    scrolled?: boolean; 
    onOpenPopup?: () => void; 
  } = $props();

  const user = page.data.user as User | undefined;
  const navData = getNavigation(page.url.pathname);
  const navigation = $derived(user ? navData.privateNav : navData.publicNav);
  const isActive = (path: string) => {
    if (path === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(path);
  };

  let isMobileMenuOpen = $state(false);
  
  const dashboardItems = $derived.by(() => {
    if (!user) return [];
    
    return navData.navMain.filter(item => item.roles.includes(user.role as Role));
  });
</script>

<div class="transition-all duration-500 {scrolled ? 'py-2' : 'py-4'}">
  <header
    class="center mx-auto transition-all duration-500 {scrolled
      ? 'max-w-7xl'
      : 'max-w-full'}"
  >
    <div
      class="px-4 rounded-xl border border-primary/5 bg-background/70 backdrop-blur-2xl shadow-lg transition-all duration-500 {scrolled
        ? 'py-2'
        : 'py-2.5'}"
    >
      <div class="flex h-12 md:h-14 items-center justify-between">
        <BrandLink />

        <div class="flex items-center gap-2">
          <!-- Desktop Nav -->
          <nav class="hidden lg:flex items-center gap-1 mr-4">
            {#each navigation as item}
              {#if !user || (user && item.roles.includes(user.role as Role))}
                {#if user && item.name === 'Dashboard'}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger class="group">
                      <div class="relative flex items-center gap-1 px-5 py-2.5 text-sm font-bold uppercase transition-all hover:text-primary overflow-hidden">
                        <span class="relative z-10">{item.name}</span>
                        <ChevronDown class="size-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        {#if isActive(item.href) || page.url.pathname.startsWith('/admin')}
                          <span
                            class="absolute inset-0 bg-primary/5 rounded-xl border border-primary/10"
                            transition:fade
                          ></span>
                        {/if}
                      </div>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="start" class="w-56 p-2 rounded-2xl bg-background/80 backdrop-blur-2xl border-primary/10 shadow-2xl overflow-hidden">
                      {#each dashboardItems as dItem}
                        {#if dItem.items && dItem.items.length > 0}
                          <DropdownMenu.Group>
                            <DropdownMenu.Label class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 border-b border-primary/5 mb-1">{dItem.title}</DropdownMenu.Label>
                            {#each dItem.items as sub}
                              {#if !sub.roles || sub.roles.includes(user.role as Role)}
                                <DropdownMenu.Item 
                                  onclick={() => goto(sub.url)}
                                  class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-primary/10 hover:text-primary cursor-pointer {isActive(sub.url) ? 'bg-primary/5 text-primary' : ''}"
                                >
                                  {sub.title}
                                </DropdownMenu.Item>
                              {/if}
                            {/each}
                          </DropdownMenu.Group>
                        {:else}
                          <DropdownMenu.Item 
                            onclick={() => goto(dItem.url)}
                            class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-primary/10 hover:text-primary cursor-pointer {isActive(dItem.url) ? 'bg-primary/5 text-primary' : ''}"
                          >
                            {dItem.title}
                          </DropdownMenu.Item>
                        {/if}
                        {#if dItem !== dashboardItems[dashboardItems.length - 1]}
                          <DropdownMenu.Separator class="my-1 bg-primary/5" />
                        {/if}
                      {/each}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                {:else}
                  <a
                    href={item.href}
                    class="relative px-5 py-2.5 text-sm font-bold uppercase transition-all hover:text-primary group"
                  >
                    <span class="relative z-10">{item.name}</span>
                    {#if isActive(item.href)}
                      <span
                        class="absolute inset-0 bg-primary/5 rounded-xl border border-primary/10"
                        transition:fade
                      ></span>
                    {/if}
                    <span
                      class="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary transition-all group-hover:w-4 {isActive(
                        item.href,
                      )
                        ? 'w-4'
                        : ''}"
                    ></span>
                  </a>
                {/if}
              {/if}
            {/each}
          </nav>

          <div class="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              class="rounded-xl hover:bg-primary/10 transition-colors"
              onclick={onOpenPopup}
              title="What's New"
            >
              <Megaphone class="size-5" />
            </Button>
            <ModeToggle />
            <div class="hidden sm:block">
              <AuthDialog />
            </div>

            <!-- Mobile Menu Toggle -->
            <!-- <Button
              variant="ghost"
              size="icon"
              class="lg:hidden rounded-xl bg-primary/5 text-primary"
              onclick={() => (isMobileMenuOpen = !isMobileMenuOpen)}
            >
              {#if isMobileMenuOpen}
                <X class="size-5" />
              {:else}
                <Menu class="size-5" />
              {/if}
            </Button> -->
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Mobile Menu -->
  {#if isMobileMenuOpen}
    <div
      class="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl lg:hidden"
      transition:fade
    >
      <div class="flex flex-col h-full pt-32 pb-12 px-8 center mx-auto">
        <nav class="flex flex-col gap-4 mb-12">
          {#each navigation as item, i}
            <a
              href={item.href}
              class="flex items-center justify-between group"
              onclick={() => (isMobileMenuOpen = false)}
              in:fly={{ y: 20, delay: i * 50 }}
            >
              <span
                class="text-4xl font-bold transition-all group-hover:text-primary {isActive(
                  item.href,
                )
                  ? 'text-primary'
                  : ''}"
              >
                {item.name}
              </span>
              <ArrowRight
                class="size-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-primary"
              />
            </a>
          {/each}
        </nav>

        <div class="mt-auto space-y-6 pt-12 border-t border-primary/10">
          <AuthDialog />
          <p class="text-xs font-bold uppercase text-muted-foreground">
            Premium Education Consultancy
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
