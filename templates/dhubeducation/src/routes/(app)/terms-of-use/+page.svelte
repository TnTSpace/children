<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowLeft, Scale } from "@lucide/svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
</script>

<Metatag title="Terms of Use" />

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
      <h1 class="text-5xl font-bold mb-12">Terms of Use</h1>

      <div
        class="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed"
      >
        <p class="text-lg text-foreground font-bold">
          Last Updated: February 2024
        </p>

        <p>
          By accessing or using the DHUB Education website, you agree to be
          bound by these Terms of Use. If you do not agree with any part of
          these terms, you must not use our website.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          1. Use of Services
        </h2>
        <p>
          Our website and services are intended for personal, non-commercial use
          by students and education providers. You must not use our platform for
          any illegal or unauthorized purpose.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          2. Intellectual Property
        </h2>
        <p>
          All content on this website, including text, graphics, logos, and
          images, is the property of DHUB Education and is protected by
          international copyright laws.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          3. Limitation of Liability
        </h2>
        <p>
          DHUB Education shall not be liable for any direct, indirect, or
          consequential damages resulting from the use or inability to use our
          services.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          4. Governing Law
        </h2>
        <p>
          These terms shall be governed by and construed in accordance with the
          laws of the United Kingdom, without regard to its conflict of law
          provisions.
        </p>

        <div class="p-8 bg-muted/30 rounded-xl border border-muted mt-16">
          <div class="flex items-center gap-4 mb-4">
            <Scale class="size-6 text-primary" />
            <p class="font-bold">Legal Agreement</p>
          </div>
          <p class="text-sm">
            If you have any questions regarding these terms, please contact our
            legal team at <a
              href="mailto:legal@dhubeducation.com"
              class="text-primary font-bold hover:underline"
              >legal@dhubeducation.com</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
