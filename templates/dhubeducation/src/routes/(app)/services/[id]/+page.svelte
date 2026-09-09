<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    ArrowLeft,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    Send,
    MessageCircle,
    Clock,
    Globe,
    Users,
  } from "@lucide/svelte";
  import { enhance } from "$app/forms";
  import { fade, slide } from "svelte/transition";
  import type { PageServerData, ActionData } from "./$types";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  interface ConsultationResult {
    success: boolean;
    message: string;
  }

  let {
    data,
    form,
  }: { data: PageServerData; form: ActionData & ConsultationResult } = $props();
  const service = $derived(data.service);
  let loading = $state(false);
</script>

<Metatag
  title="{service?.name || 'Service Detail'} | DHUB Education Services"
  description={service?.description ||
    "Expert educational services for global study success."}
  ogImage={service?.imageUrl}
/>

<!-- Service Header -->
<section
  class="relative pt-48 pb-24 md:pt-64 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 left-0 w-1/2 h-full bg-primary/3 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-4xl mx-auto text-center">
      <Button
        href="/services"
        variant="ghost"
        class="mb-12 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all rounded-xl group"
      >
        <ArrowLeft
          class="mr-2 size-4 group-hover:-translate-x-1 transition-transform"
        /> Back to Services
      </Button>

      <Badge
        variant="outline"
        class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
        >Expert Service</Badge
      >
      <h1 class="text-5xl md:text-8xl font-bold leading-[0.85] mb-12">
        {service?.name || ""}
      </h1>

      {#if service?.description}
        <p
          class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
        >
          {service.description}
        </p>
      {/if}
    </div>
  </div>
</section>

<!-- Featured Image -->
<section class="px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32">
  <div class="max-w-6xl mx-auto">
    <div
      class="aspect-21/9 rounded-xl overflow-hidden shadow-lg border-12 border-background bg-muted"
    >
      {#if service?.imageUrl}
        <img
          src={service.imageUrl}
          alt={service.name}
          class="size-full object-cover"
        />
      {:else}
        <div class="size-full flex items-center justify-center">
          <Sparkles class="size-24 text-muted-foreground/20" />
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- Content & Sidebar -->
<section class="py-8 bg-background">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start">
      <!-- Main Content -->
      <div class="lg:col-span-8">
        <div class="space-y-16">
          <div>
            <h2 class="text-4xl font-bold mb-8">How We Help</h2>
            <div
              class="prose prose-zinc lg:prose-xl dark:prose-invert max-w-none font-medium leading-[1.8] text-muted-foreground prose-headings:text-foreground prose-headings:font-bold"
            >
              {#if service?.content}
                {@html service.content}
              {:else}
                <p>
                  No detailed information available for this service at the
                  moment.
                </p>
              {/if}
            </div>
          </div>

          <!-- Why Choose Us -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
            >
              <div
                class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all"
              >
                <ShieldCheck class="size-6" />
              </div>
              <h3 class="text-lg font-bold mb-3">Proven Track Record</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                98% success rate across all client engagements and admissions
                support.
              </p>
            </div>
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
            >
              <div
                class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all"
              >
                <Users class="size-6" />
              </div>
              <h3 class="text-lg font-bold mb-3">Dedicated Advisor</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                A personal education expert assigned to guide you through every
                milestone.
              </p>
            </div>
            <div
              class="p-10 rounded-xl bg-muted/20 border border-muted group hover:border-primary/20 transition-all"
            >
              <div
                class="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all"
              >
                <Globe class="size-6" />
              </div>
              <h3 class="text-lg font-bold mb-3">Global Network</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                Connections spanning 50+ universities across the UK, Canada,
                Finland, and beyond.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <aside class="lg:col-span-4 space-y-10 sticky top-32">
        <div
          class="bg-background rounded-xl border border-primary/10 p-10 shadow-lg relative overflow-hidden"
        >
          <div
            class="absolute -top-12 -right-12 size-48 bg-primary/5 rounded-full blur-[80px]"
          ></div>
          <h4 class="text-2xl font-bold mb-10">Get Started Today</h4>

          <form
            method="POST"
            action="?/requestConsultation"
            use:enhance={() => {
              loading = true;
              return async ({ update }) => {
                await update({ reset: true });
                loading = false;
              };
            }}
            class="space-y-6"
          >
            {#if form?.success}
              <div
                in:slide
                class="bg-primary/5 border border-primary/20 p-8 rounded-xl text-center space-y-4"
              >
                <div
                  class="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4"
                >
                  <CheckCircle2 class="size-8" />
                </div>
                <h5 class="font-bold text-lg">Request Sent!</h5>
                <p class="text-xs text-muted-foreground leading-relaxed">
                  {form.message}
                </p>
              </div>
            {:else}
              <div class="space-y-2">
                <label
                  for="name"
                  class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                  >Full Name</label
                >
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Your name"
                  class="w-full h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="email"
                  class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                  >Email</label
                >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  class="w-full h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div class="space-y-2">
                <label
                  for="phone"
                  class="text-[10px] font-bold uppercase ml-4 text-muted-foreground"
                  >WhatsApp</label
                >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+233..."
                  class="w-full h-14 rounded-xl bg-muted/30 border-none px-6 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              {#if form?.message && !form.success}
                <p
                  in:fade
                  class="text-destructive text-[10px] font-bold uppercase ml-4"
                >
                  {form.message}
                </p>
              {/if}

              <Button
                type="submit"
                disabled={loading}
                class="w-full shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group"
              >
                {loading ? "Submitting..." : "Request Consultation"}
                {#if !loading}
                  <Send
                    class="ml-3 size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />
                {/if}
              </Button>
            {/if}

            <p
              class="text-center text-[10px] text-muted-foreground font-medium px-4"
            >
              Free initial consultation. No obligation. Response within 24
              hours.
            </p>
          </form>
        </div>

        <div class="p-10 rounded-xl bg-muted/30 border border-muted space-y-6">
          <h4 class="text-xs font-bold uppercase text-muted-foreground">
            Quick Connect
          </h4>
          <div class="flex flex-col gap-4">
            <Button
              variant="outline"
              href="https://api.whatsapp.com/send/?phone=%2B447930739927&text=Service%20Inquiry"
              class="flex items-center justify-center gap-3 bg-background border border-muted hover:bg-primary/5 transition-all"
            >
              <MessageCircle class="size-4" /> WhatsApp Chat
            </Button>
            <Button
              href="/contact"
              variant="outline"
              class="flex items-center justify-center gap-3 bg-background border border-muted hover:bg-primary/5 transition-all"
            >
              <Clock class="size-4" /> Book a Call
            </Button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-8 bg-primary relative overflow-hidden">
  <div
    class="absolute inset-0 bg-[radial-gradient(circle_at_30%_120%,rgba(255,255,255,0.1),transparent)]"
  ></div>
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <h2 class="text-5xl md:text-7xl font-bold text-white mb-12">
      Ready to Transform Your Future?
    </h2>
    <p
      class="text-primary-foreground/80 text-xl font-medium max-w-2xl mx-auto mb-12"
    >
      Our expert team has helped thousands of students achieve their global
      education goals. You could be next.
    </p>
    <div class="flex flex-col sm:flex-row gap-6 justify-center">
      <Button
        href="/contact"
        class="bg-white text-primary hover:bg-white/90 rounded-xl h-16 px-14 text-lg font-bold transition-all hover:scale-105 shadow-lg"
      >
        Start Your Journey
      </Button>
      <Button
        href="/services"
        variant="outline"
        class="border-white/30 text-white hover:bg-white/10 rounded-xl h-16 px-14 text-lg font-bold"
      >
        Explore All Services
      </Button>
    </div>
  </div>
</section>
