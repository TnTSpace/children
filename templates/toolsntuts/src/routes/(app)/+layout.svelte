<script lang="ts">
  import Header from '$lib/components/sections/header.svelte';
  import Footer from '$lib/components/sections/footer.svelte';
  import PublicBottomNav from '$lib/components/sections/public-bottom-nav.svelte';
  let { children } = $props();
</script>

<div class="flex min-h-screen flex-col animate-in">
  <Header />
  <main class="flex-1 pb-20 md:pb-0">
    {@render children()}
  </main>
  <Footer />
</div>

<PublicBottomNav />
