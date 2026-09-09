<script lang="ts">
  import Logo from "$lib/components/icons/logo.svelte";
  import { Constants } from "$lib/constants";
</script>
<a href="/" rel="prefetch" aria-label="logo" class="flex items-center gap-2">
  <Logo class="size-10" />
  <div class="flex flex-col">
    <span class="font-bold text-lg ml-2 leading-none uppercase">{Constants.BRANDNAME}</span>
    <span class="text-sm ml-2 text-gray-500 dark:text-gray-400 leading-none">Christian Comics</span>
  </div>
</a>
