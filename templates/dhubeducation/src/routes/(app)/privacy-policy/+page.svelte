<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowLeft, Shield } from "@lucide/svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
</script>

<Metatag title="Privacy Policy" />

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
      <h1 class="text-5xl font-bold mb-12">Privacy Policy</h1>

      <div
        class="prose prose-zinc dark:prose-invert max-w-none space-y-8 text-muted-foreground font-medium leading-relaxed"
      >
        <p class="text-lg text-foreground font-bold">
          Last Updated: February 2024
        </p>

        <p>
          At DHUB Education, we are committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, and safeguard your
          personal information when you use our website or services.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          1. Information We Collect
        </h2>
        <p>
          We collect information that you provide directly to us, such as when
          you create an account, fill out an inquiry form, or contact us for
          support. This may include your name, email address, phone number, and
          academic background.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          2. How We Use Your Information
        </h2>
        <p>
          We use the information we collect to provide and improve our services,
          communicate with you about your applications, and send you relevant
          updates about educational opportunities.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          3. Data Security
        </h2>
        <p>
          We implement industry-standard security measures to protect your
          personal data from unauthorized access, disclosure, or alteration.
          However, no method of transmission over the internet is 100% secure.
        </p>

        <h2 class="text-2xl font-bold text-foreground mt-12">
          4. Third-Party Sharing
        </h2>
        <p>
          We may share your information with partner universities and education
          providers only for the purpose of processing your admissions or visa
          applications.
        </p>

        <div class="p-8 bg-muted/30 rounded-xl border border-muted mt-16">
          <div class="flex items-center gap-4 mb-4">
            <Shield class="size-6 text-primary" />
            <p class="font-bold">Contact Privacy Officer</p>
          </div>
          <p class="text-sm">
            For any privacy-related inquiries, please contact us at <a
              href="mailto:privacy@dhubeducation.com"
              class="text-primary font-bold hover:underline"
              >privacy@dhubeducation.com</a
            >
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
