<script lang="ts">
  import { page } from "$app/state";
  import { Constants, getNavigation, Role } from "$lib/constants";
  import {
    Home,
    GraduationCap,
    Heart,
    Menu,
    ChevronRight,
    BookOpen,
    Megaphone,
    HelpCircle,
  } from "@lucide/svelte";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Button } from "$lib/components/ui/button";
  import { fade } from "svelte/transition";
  import AuthDialog from "$lib/authentication/ui/user/auth-dialog.svelte";
  import type { User } from "$lib/auth";

  const user = $derived(page.data.user as User | undefined);
  const navData = $derived(getNavigation(page.url.pathname));
  const navigation = $derived(user ? navData.privateNav : navData.publicNav);

  const isActive = (path: string) => {
    if (path === "/") return page.url.pathname === "/";
    return page.url.pathname.startsWith(path);
  };

  const mainItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Courses", href: "/courses", icon: GraduationCap },
    { name: "Services", href: "/services", icon: Heart },
  ];

  const insightItems = [
    { name: "Blogs", href: "/blogs", icon: BookOpen },
    { name: "Campaigns", href: "/campaigns", icon: Megaphone },
    { name: "FAQs", href: "/faqs", icon: HelpCircle },
  ];

  let isDrawerOpen = $state(false);
</script>

<div
  class="lg:hidden fixed bottom-0 left-0 right-0 z-[100] border-t border-primary/10 bg-background/80 backdrop-blur-2xl shadow-lg pointer-events-none"
>
  <nav
    class="center mx-auto pointer-events-auto flex items-center justify-around overflow-hidden relative p-2"
  >
    <!-- Active Indicator Background -->
    {#each mainItems as item, i}
      {#if isActive(item.href)}
        <div
          class="absolute inset-y-2 w-[calc(25%-1rem)] bg-primary/10 rounded-2xl transition-all duration-500"
          style="left: calc({i * 25}% + 0.5rem)"
        ></div>
      {/if}
    {/each}

    {#each mainItems as item}
      <a
        href={item.href}
        class="flex flex-col items-center gap-1.5 py-2.5 px-3 rounded-2xl transition-all relative z-10 {isActive(
          item.href,
        )
          ? 'text-primary'
          : 'text-muted-foreground'}"
      >
        <item.icon
          class="size-5 {isActive(item.href)
            ? 'scale-110'
            : ''} transition-transform duration-500"
        />
        <span class="text-[10px] font-bold uppercase tracking-wider"
          >{item.name}</span
        >
      </a>
    {/each}

    <button
      onclick={() => (isDrawerOpen = true)}
      class="flex flex-col items-center gap-1.5 py-2.5 px-3 rounded-2xl transition-all relative z-10 text-muted-foreground hover:text-primary"
    >
      <Menu class="size-5" />
      <span class="text-[10px] font-bold uppercase tracking-wider">More</span>
    </button>
  </nav>
</div>

<Drawer.Root bind:open={isDrawerOpen}>
  <Drawer.Content
    class="rounded-t-3xl bg-background border-t border-border/50 max-h-[85vh]"
  >
    <div
      class="mx-auto w-10 h-1 flex-shrink-0 rounded-full bg-muted-foreground/20 mt-3 mb-6"
    ></div>

    <div class="px-6 pb-10 overflow-y-auto">
      <div class="mb-8">
        <h2 class="text-lg font-bold tracking-tight">Explore</h2>
        <p
          class="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.2em] mt-0.5"
        >
          {Constants.BRANDNAME}
        </p>
      </div>

      <div class="space-y-8">
        <!-- Site Navigation -->
        <section>
          <h3
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
          >
            Site Content
          </h3>
          <div class="grid grid-cols-2 gap-2">
            {#each navData.publicNav as item}
              <a
                href={item.href}
                onclick={() => (isDrawerOpen = false)}
                class="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-all group {isActive(
                  item.href,
                )
                  ? 'bg-primary/5 text-primary'
                  : ''}"
              >
                <div
                  class="size-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors {isActive(
                    item.href,
                  )
                    ? 'bg-primary/10 text-primary'
                    : ''}"
                >
                  <item.icon class="size-4" />
                </div>
                <span class="text-sm font-semibold">{item.name}</span>
              </a>
            {/each}
          </div>
        </section>

        <!-- Insights -->
        <section>
          <h3
            class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3"
          >
            Insights & Help
          </h3>
          <div class="grid grid-cols-3 gap-2">
            {#each insightItems as item}
              <a
                href={item.href}
                onclick={() => (isDrawerOpen = false)}
                class="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted/50 transition-all group"
              >
                <div
                  class="size-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors"
                >
                  <item.icon class="size-4" />
                </div>
                <span class="text-xs font-semibold">{item.name}</span>
              </a>
            {/each}
          </div>
        </section>

        {#if user}
          <!-- Account & Dashboard -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <h3
                class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground"
              >
                Account & Dashboard
              </h3>
              <AuthDialog />
            </div>
            <div class="space-y-2">
              {#each navData.navMain as section}
                {#if section.roles.includes(user.role as Role)}
                  {#if section.items}
                    <div
                      class="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-3"
                    >
                      <div class="flex items-center gap-2.5 px-1">
                        <div
                          class="size-7 rounded-md bg-primary/10 flex items-center justify-center"
                        >
                          <section.icon class="size-3.5 text-primary" />
                        </div>
                        <span class="text-sm font-semibold"
                          >{section.title}</span
                        >
                      </div>
                      <div class="grid grid-cols-2 gap-1.5">
                        {#each section.items as subItem}
                          <a
                            href={subItem.url}
                            onclick={() => (isDrawerOpen = false)}
                            class="text-xs font-semibold p-2.5 rounded-lg bg-background border border-border/50 hover:bg-primary hover:text-white hover:border-primary transition-all text-muted-foreground text-center"
                          >
                            {subItem.title}
                          </a>
                        {/each}
                      </div>
                    </div>
                  {:else}
                    <a
                      href={section.url}
                      onclick={() => (isDrawerOpen = false)}
                      class="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all group"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="size-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors"
                        >
                          <section.icon class="size-4" />
                        </div>
                        <span class="text-sm font-semibold"
                          >{section.title}</span
                        >
                      </div>
                      <ChevronRight
                        class="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"
                      />
                    </a>
                  {/if}
                {/if}
              {/each}
            </div>
          </section>
        {/if}

        <!-- Legal -->
        <section class="pt-4 border-t border-border/50">
          <div class="flex flex-col gap-3">
            <div class="flex flex-wrap gap-4 items-center justify-center">
              {#each [{ name: "Terms of Use", href: "/terms-of-use" }, { name: "Privacy Policy", href: "/privacy-policy" }, { name: "Cookie Policy", href: "/cookie-policy" }] as link}
                <a
                  href={link.href}
                  onclick={() => (isDrawerOpen = false)}
                  class="text-[11px] font-medium text-muted-foreground hover:text-primary transition-all"
                  >{link.name}</a
                >
              {/each}
            </div>
            <p
              class="text-[10px] font-medium text-muted-foreground/40 text-center"
            >
              © {new Date().getFullYear()}
              {Constants.BRANDNAME}
            </p>
          </div>
        </section>
      </div>
    </div>
  </Drawer.Content>
</Drawer.Root>
