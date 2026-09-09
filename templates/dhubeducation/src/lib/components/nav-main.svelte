<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { Role } from "$lib/constants";
  import type { User } from "$lib/auth";
  import { cn } from "$lib/utils";
  import { page } from "$app/state";
  import { buttonVariants } from "$lib/components/ui/button";

  const user = page.data.user as User;

  let {
    items,
  }: {
    items: {
      title: string;
      url: string;
      roles: Role[];
      icon?: any;
      isActive?: boolean;
      items?: { title: string; url: string; isActive?: boolean; roles?: Role[] }[];
    }[];
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupLabel>Platform</Sidebar.GroupLabel>
  <Sidebar.Menu class="flex flex-col gap-1">
    {#each items as item (item.title)}
      {#if item.roles.includes(user.role as Role)}
        {#if item.items && item.items.length > 0}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              class={cn(item.isActive && "bg-muted font-medium")}
            >
              {#if item.icon}
                <item.icon />
              {/if}
              <span>{item.title}</span>
            </Sidebar.MenuButton>
            <Sidebar.MenuSub>
              {#each item.items as subItem (subItem.title)}
                {#if !subItem.roles || subItem.roles.includes(user.role as Role)}
                  <Sidebar.MenuSubItem>
                    <Sidebar.MenuSubButton href={subItem.url} isActive={subItem.isActive}>
                      <span>{subItem.title}</span>
                    </Sidebar.MenuSubButton>
                  </Sidebar.MenuSubItem>
                {/if}
              {/each}
            </Sidebar.MenuSub>
          </Sidebar.MenuItem>
        {:else}
          <a class="cursor-pointer" href={item.url}>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                class={cn(
                  buttonVariants({
                    variant: item.isActive ? "outline" : "ghost",
                  }),
                  "justify-start cursor-pointer hover:text-current",
                )}
              >
                {#if item.icon}
                  <item.icon />
                {/if}
                <span>{item.title}</span>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </a>
        {/if}
      {/if}
    {/each}
  </Sidebar.Menu>
</Sidebar.Group>
