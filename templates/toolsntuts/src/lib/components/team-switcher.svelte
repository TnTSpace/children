<script lang="ts">
  import * as Sidebar from '$lib/components/ui/sidebar/index.js';
  import { useSidebar } from '$lib/components/ui/sidebar/index.js';
  import { Home } from '@lucide/svelte';

  let { teams }: { teams: { name: string; logo: any; plan: string }[] } = $props();
  const sidebar = useSidebar();
  const activeTeam = $derived(teams[0]);
</script>

<Sidebar.Menu>
  <Sidebar.MenuItem>
    <a href="/">
      <Sidebar.MenuButton size="lg" class="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
        <div class="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
          <activeTeam.logo class="size-full" type="normal" />
        </div>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">{activeTeam.name}</span>
          <span class="truncate text-xs">{activeTeam.plan}</span>
        </div>
        <Home class="ml-auto" />
      </Sidebar.MenuButton>
    </a>
  </Sidebar.MenuItem>
</Sidebar.Menu>
