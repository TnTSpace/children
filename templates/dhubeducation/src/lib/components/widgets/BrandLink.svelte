<script lang="ts">
  import Logo from "$lib/components/icons/logo.svelte";
  import { Constants } from "$lib/constants";
</script>
<a href="/" rel="prefetch" aria-label="logo" class="flex items-center gap-2">
  <Logo class="size-10" />
  <div class="flex flex-col">
    <span class="font-bold -mb-1">{Constants.BRANDNAME}</span>
    <span class="text-muted-foreground text-[9px] uppercase font-bold">{Constants.BRANDSLOGAN}</span>
  </div>
</a>
