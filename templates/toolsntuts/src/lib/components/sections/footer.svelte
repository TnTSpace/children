<script lang="ts">
  import { Constants } from '$lib/constants';

  const productLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
  ];

  const platformLinks = [
    { label: 'Storyboards', href: '/storyboards' },
    { label: 'Video Generation', href: '/video-generation' },
    { label: 'Voiceovers', href: '/voiceovers' },
    { label: 'Music Sync', href: '/music-sync' },
  ];

  const resourceLinks = [
    { label: 'Documentation', href: '/documentation' },
    { label: 'Blog', href: '/blog' },
    { label: 'Status', href: '/status' },
    { label: 'API', href: '/api-reference' },
  ];

  const companyLinks = [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const socials = [
    {
      label: 'X / Twitter',
      href: 'https://twitter.com/toolsntuts',
      // X (formerly Twitter) logo
      path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    },
    {
      label: 'YouTube',
      href: 'https://youtube.com/@toolsntuts',
      path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    },
    {
      label: 'LinkedIn',
      href: 'https://linkedin.com/company/toolsntuts',
      path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    },
    {
      label: 'GitHub',
      href: 'https://github.com/toolsntuts',
      path: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
    },
  ];
</script>

<footer class="bg-gray-950 text-gray-400">
  <div class="border-t border-gray-800/60">
    <!-- Main grid -->
    <div class="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div class="grid grid-cols-2 gap-10 lg:grid-cols-5">

        <!-- Col 1: Brand -->
        <div class="col-span-2 lg:col-span-1 flex flex-col gap-5">
          <a href="/" class="inline-flex items-center gap-2 group">
            <span class="text-xl font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors duration-200">
              {Constants.BRANDNAME}
            </span>
          </a>

          <p class="text-sm leading-6 text-gray-400 max-w-xs">
            Turn any idea into a captivating 90-second AI video. Cinematic, viral, or educational — generated end-to-end.
          </p>

          <!-- Social icons -->
          <div class="flex items-center gap-4 mt-1">
            {#each socials as { path, label, href }}
              <a
                {href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                class="text-gray-500 hover:text-white transition-colors duration-200"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4" aria-hidden="true">
                  <path d={path} />
                </svg>
              </a>
            {/each}
          </div>
        </div>

        <!-- Col 2: Product -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white tracking-wide uppercase">Product</h3>
          <ul class="flex flex-col gap-3">
            {#each productLinks as { label, href }}
              <li>
                <a
                  {href}
                  class="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <!-- Col 3: Platform -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white tracking-wide uppercase">Platform</h3>
          <ul class="flex flex-col gap-3">
            {#each platformLinks as { label, href }}
              <li>
                <a
                  {href}
                  class="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <!-- Col 4: Resources -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white tracking-wide uppercase">Resources</h3>
          <ul class="flex flex-col gap-3">
            {#each resourceLinks as { label, href }}
              <li>
                <a
                  {href}
                  class="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <!-- Col 5: Company -->
        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-semibold text-white tracking-wide uppercase">Company</h3>
          <ul class="flex flex-col gap-3">
            {#each companyLinks as { label, href }}
              <li>
                <a
                  {href}
                  class="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {label}
                </a>
              </li>
            {/each}
          </ul>
        </div>

      </div>
    </div>

    <!-- Bottom strip -->
    <div class="border-t border-gray-800/60">
      <div class="mx-auto max-w-7xl px-6 py-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-gray-500">
          &copy; 2026 {Constants.BRANDNAME}. All rights reserved.
        </p>

        <div class="flex items-center gap-5 text-xs text-gray-500">
          <a href="/privacy" class="hover:text-white transition-colors duration-200">Privacy</a>
          <span class="text-gray-700" aria-hidden="true">&middot;</span>
          <a href="/terms" class="hover:text-white transition-colors duration-200">Terms</a>
          <span class="text-gray-700" aria-hidden="true">&middot;</span>
          <a
            href="mailto:{Constants.SUPPORTEMAIL}"
            class="hover:text-white transition-colors duration-200"
          >
            {Constants.SUPPORTEMAIL}
          </a>
        </div>
      </div>
    </div>
  </div>
</footer>
