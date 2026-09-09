<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowLeft, Cookie } from "@lucide/svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
</script>

<Metatag title="Cookie Policy" />

<section class="pt-48 pb-32">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <Button
        href="/"
        variant="ghost"
        class="mb-12 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl"
      >
        <ArrowLeft class="mr-2 size-4" /> Back to Home
      </Button>

      <Badge
        variant="outline"
        class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
        >Legal</Badge
      >
      <h1 class="text-5xl font-bold mb-12">Cookie Policy</h1>

      <div
        class="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed"
      >
        <p class="text-lg text-foreground font-bold">
          Last Updated: February 2024
        </p>

        <p>
          This Cookie Policy explains how DHUB Education uses cookies and
          similar technologies to recognize you when you visit our website. It
          explains what these technologies are and why we use them.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          1. What are Cookies?
        </h2>
        <p>
          Cookies are small data files that are placed on your computer or
          mobile device when you visit a website. Cookies are widely used by
          website owners in order to make their websites work, or to work more
          efficiently, as well as to provide reporting information.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          2. How We Use Cookies
        </h2>
        <p>
          We use cookies for a variety of reasons, including essential cookies
          that are required for our website to operate, and
          performance/analytics cookies that help us understand how visitors use
          our site.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          3. Controlling Cookies
        </h2>
        <p>
          You have the right to decide whether to accept or reject cookies. You
          can set or amend your web browser controls to accept or refuse
          cookies. If you choose to reject cookies, you may still use our
          website though your access to some functionality and areas of our
          website may be restricted.
        </p>

        <div class="p-8 bg-muted/30 rounded-xl border border-muted mt-16">
          <div class="flex items-center gap-4 mb-4">
            <Cookie class="size-6 text-primary" />
            <p class="font-bold">Manage Preferences</p>
          </div>
          <p class="text-sm">
            You can manage your cookie preferences through your browser settings
            at any time. For more information, please visit our <a
              href="/contact"
              class="text-primary font-bold hover:underline">Support Hub</a
            >.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
