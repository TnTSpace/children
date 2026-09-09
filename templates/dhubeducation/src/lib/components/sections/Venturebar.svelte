<script lang="ts">
  import { Constants } from "$lib/constants";
  import { Phone, Mail, MapPin } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  let { scrolled = false } = $props();
</script>

{#if !scrolled}
  <div
    class="hidden md:block bg-primary text-white py-2 px-6 w-full z-[60]"
    transition:fade={{ duration: 300 }}
  >
    <div class="center mx-auto flex items-center justify-between">
      <div class="flex items-center gap-6">
        <a
          href={Constants.LOCATION_URL}
          target="_blank"
          class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:text-white/80 transition-all"
        >
          <MapPin class="size-3.5" />
          <span>5 Union Street, City View House, Manchester M12 4JD UK</span>
        </a>
      </div>
      <div class="flex items-center gap-8">
        <a
          href="tel:{Constants.PHONE}"
          class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:text-white/80 transition-all"
        >
          <Phone class="size-3.5" />
          <span>{Constants.PHONE}</span>
        </a>
        <a
          href="mailto:{Constants.SUPPORTEMAIL}"
          class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider hover:text-white/80 transition-all"
        >
          <Mail class="size-3.5" />
          <span>{Constants.SUPPORTEMAIL}</span>
        </a>
      </div>
    </div>
  </div>
{/if}
