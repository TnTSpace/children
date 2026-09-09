<script lang="ts">
  import { Constants } from '$lib/constants';
  import BrandLink from '$lib/components/widgets/BrandLink.svelte';
  import { Mail } from '@lucide/svelte';

  const year = new Date().getFullYear();

  const VALUES_IN_ROTATION = [
    'Honesty',
    'Forgiveness',
    'Courage',
    'Generosity',
    "God's Care",
    'Kindness',
    'Trust',
    'Standing Firm'
  ];
</script>

<!-- Deliberately always dark, regardless of site theme — same technique as the
     reference homepage's footer, which is fixed dark rather than theme-token
     based. -->
<footer class="bg-gray-950 text-gray-400 print:hidden">
  <div class="center px-4 py-16 sm:px-6 lg:px-8">
    <div class="grid grid-cols-2 gap-10 lg:grid-cols-5">
      <div class="col-span-2">
        <div class="mb-4 [&_span]:text-white">
          <BrandLink />
        </div>
        <p class="mb-2 max-w-xs text-sm text-gray-500">
          Real stories, drawn from real life — one illustrated true-to-life story a day, grounded in real occurrences, pointing to Jesus.
        </p>
        <a href="mailto:{Constants.SUPPORTEMAIL}" class="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white">
          <Mail class="h-3.5 w-3.5" />
          {Constants.SUPPORTEMAIL}
        </a>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Explore</h3>
        <ul class="space-y-3 text-sm">
          <li><a href="/" class="text-gray-400 hover:text-white">Home</a></li>
          <li><a href="/#today" class="text-gray-400 hover:text-white">Today's Episode</a></li>
          <li><a href="/#how-it-works" class="text-gray-400 hover:text-white">How It's Made</a></li>
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-semibold tracking-wide text-white uppercase">Values in Rotation</h3>
        <ul class="grid grid-cols-1 gap-3 text-sm text-gray-400">
          {#each VALUES_IN_ROTATION as value (value)}
            <li>{value}</li>
          {/each}
        </ul>
      </div>

      <div>
        <h3 class="mb-4 text-sm font-semibold tracking-wide text-white uppercase">The Series</h3>
        <ul class="space-y-3 text-sm text-gray-400">
          <li>Grounded in real, researched occurrences</li>
          <li>Scripture quoted from the NKJV</li>
          <li>A new story, every day</li>
        </ul>
      </div>
    </div>

    <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-800/60 pt-8 text-xs text-gray-500 sm:flex-row">
      <p>© {year} {Constants.BRANDNAME}. All rights reserved.</p>
      <p>Scripture quotations from the NKJV.</p>
    </div>
  </div>
</footer>
