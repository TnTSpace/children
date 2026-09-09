<script lang="ts">
  import Header from "$lib/components/sections/header.svelte";
  import Footer from "$lib/components/sections/footer.svelte";
  import Venturebar from "$lib/components/sections/Venturebar.svelte";
  import BottomNav from "$lib/components/sections/BottomNav.svelte";
  import PopupCarousel from "$lib/components/widgets/PopupCarousel.svelte";
  import { onMount } from "svelte";
  import { page } from "$app/state";

  let { children, data } = $props();
  let scrolled = $state(false);

  const user = $derived(page.data.user);
  const popupCampaign = $derived(data?.popupCampaign || null);
  const popupBlog = $derived(data?.popupBlog || null);

  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  onMount(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });
  let isPopupOpen = $state(false);
</script>

<div
  class="flex min-h-screen flex-col animate-in selection:bg-primary/10 selection:text-primary"
>
  <div class="fixed top-0 left-0 right-0 z-50">
    <Venturebar {scrolled} />
    <Header {scrolled} onOpenPopup={() => (isPopupOpen = true)} />
  </div>

  <main class="flex-1 pt-24 md:pt-32">
    {@render children()}
  </main>

  <Footer />
  <BottomNav />

  <PopupCarousel {popupCampaign} {popupBlog} show={!user} bind:open={isPopupOpen} />
</div>
