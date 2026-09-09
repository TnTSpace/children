<script lang="ts">
  import { fade } from "svelte/transition";
</script>

<section id="partnership" class="py-12 bg-background overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="relative rounded-xl overflow-hidden shadow-lg border border-primary/5 group"
    >
      <!-- Desktop Banner -->
      <picture class="block w-full h-auto">
        <source srcset="/partnership.webp" media="(min-width: 768px)" />
        <img
          src="/partnership-mobile.webp"
          alt="Portman Financial Partner"
          class="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
        />
      </picture>

      <!-- Subtle Overlay for Premium Feel -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none"
      ></div>
    </div>
  </div>
</section>
