<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Card, CardContent } from "$lib/components/ui/card/index.js";
  import {
    Phone,
    Mail,
    MessageCircle,
    MapPin,
    Send,
    Clock,
    Globe,
    CheckCircle2,
    ArrowRight,
  } from "@lucide/svelte";
  import { Constants } from "$lib/constants";
  import { fade, fly } from "svelte/transition";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let formState = $state({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  let isSubmitting = $state(false);
  let isSubmitted = $state(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    isSubmitting = true;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    isSubmitting = false;
    isSubmitted = true;
    // Reset form
    formState = { name: "", email: "", phone: "", subject: "", message: "" };
  };

  const contactMethods = [
    {
      title: "Call Us",
      value: Constants.PHONE,
      href: `tel:${Constants.PHONE}`,
      icon: Phone,
      description: "Mon-Fri from 9am to 6pm",
    },
    {
      title: "Email Us",
      value: Constants.SUPPORTEMAIL,
      href: `mailto:${Constants.SUPPORTEMAIL}`,
      icon: Mail,
      description: "Online support 24/7",
    },
    {
      title: "WhatsApp",
      value: "Chat with an expert",
      href: Constants.WHATSAPP,
      icon: MessageCircle,
      description: "Instant response during office hours",
    },
    {
      title: "Visit Us",
      value: "Office Location",
      href: Constants.LOCATION_URL,
      icon: MapPin,
      description: "UK Head Office & Global Hubs",
    },
  ];
</script>

<Metatag title="Contact Us" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-48 md:pt-48 md:pb-64 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 -skew-x-12 translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <Badge
      variant="outline"
      class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
      >Get in Touch</Badge
    >
    <h1 class="text-6xl font-bold sm:text-9xl leading-[0.85] mb-12">
      Let's Start Your <span class="text-primary italic">Journey.</span>
    </h1>
    <p
      class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
    >
      Have questions about studying abroad? Our expert advisors are ready to
      provide the clarity and support you need.
    </p>
  </div>
</section>

<!-- Contact Form & Info -->
<section class="relative z-20 -mt-32 px-4 sm:px-6 lg:px-8 pb-32">
  <div class="center mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start">
      <!-- Contact Info Cards -->
      <div class="lg:col-span-5 space-y-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {#each contactMethods as method}
            <Card
              class="rounded-xl border-primary/5 bg-background shadow-lg hover:shadow-lg transition-all duration-500 group overflow-hidden"
            >
              <CardContent class="p-8">
                <div
                  class="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-6"
                >
                  <method.icon class="size-6" />
                </div>
                <h3 class="text-lg font-bold mb-2">
                  {method.title}
                </h3>
                <a
                  href={method.href}
                  class="text-sm font-bold text-primary hover:underline block mb-2"
                  >{method.value}</a
                >
                <p class="text-xs text-muted-foreground font-medium">
                  {method.description}
                </p>
              </CardContent>
            </Card>
          {/each}
        </div>

        <!-- Global Presence -->
        <div
          class="rounded-xl bg-muted/20 border border-muted p-10 relative overflow-hidden group"
        >
          <div
            class="absolute -bottom-12 -right-12 size-48 bg-primary/5 rounded-full blur-[60px] group-hover:bg-primary/10 transition-all duration-700"
          ></div>
          <div class="relative z-10">
            <Badge
              variant="outline"
              class="mb-4 bg-background px-3 py-1 font-bold text-[10px] uppercase"
              >Global Reach</Badge
            >
            <h3 class="text-2xl font-bold mb-6">Our Core Hubs</h3>
            <div class="space-y-6">
              <div class="flex items-center gap-4">
                <div
                  class="size-10 rounded-xl bg-background flex items-center justify-center shadow-sm"
                >
                  🇬🇧
                </div>
                <div>
                  <p class="text-sm font-bold">United Kingdom</p>
                  <p class="text-xs text-muted-foreground font-medium">
                    Headquarters & Admissions Hub
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div
                  class="size-10 rounded-xl bg-background flex items-center justify-center shadow-sm"
                >
                  🇬🇭
                </div>
                <div>
                  <p class="text-sm font-bold">Ghana</p>
                  <p class="text-xs text-muted-foreground font-medium">
                    West Africa Regional Office
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div
                  class="size-10 rounded-xl bg-background flex items-center justify-center shadow-sm"
                >
                  🇳🇬
                </div>
                <div>
                  <p class="text-sm font-bold">Nigeria</p>
                  <p class="text-xs text-muted-foreground font-medium">
                    Lagos Recruitment Center
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-7">
        <Card
          class="rounded-xl border-primary/10 bg-background/80 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] p-8 md:p-14"
        >
          {#if isSubmitted}
            <div
              class="flex flex-col items-center justify-center py-20 text-center"
              in:fade
            >
              <div
                class="size-24 rounded-full bg-green-500/10 flex items-center justify-center mb-8"
              >
                <CheckCircle2
                  class="size-12 text-green-500 animate-in zoom-in duration-500"
                />
              </div>
              <h3 class="text-4xl font-bold mb-4">Message Sent!</h3>
              <p class="text-muted-foreground text-lg font-medium max-w-sm">
                Thank you for reaching out. One of our education experts will
                contact you within 24 hours.
              </p>
              <Button
                variant="outline"
                class="mt-12 rounded-xl border-primary/20"
                onclick={() => (isSubmitted = false)}
              >
                Send Another Message
              </Button>
            </div>
          {:else}
            <div in:fade>
              <h3 class="text-4xl font-bold mb-10">Send an Inquiry</h3>
              <form onsubmit={handleSubmit} class="space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <Label for="name" class="text-xs font-bold uppercase ml-4"
                      >Full Name</Label
                    >
                    <Input
                      id="name"
                      required
                      bind:value={formState.name}
                      placeholder="Enter your name"
                      class="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 px-6 text-base font-medium"
                    />
                  </div>
                  <div class="space-y-3">
                    <Label for="email" class="text-xs font-bold uppercase ml-4"
                      >Email Address</Label
                    >
                    <Input
                      id="email"
                      type="email"
                      required
                      bind:value={formState.email}
                      placeholder="name@example.com"
                      class="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 px-6 text-base font-medium"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div class="space-y-3">
                    <Label for="phone" class="text-xs font-bold uppercase ml-4"
                      >WhatsApp Number</Label
                    >
                    <Input
                      id="phone"
                      bind:value={formState.phone}
                      placeholder="+233..."
                      class="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 px-6 text-base font-medium"
                    />
                  </div>
                  <div class="space-y-3">
                    <Label
                      for="subject"
                      class="text-xs font-bold uppercase ml-4">Interest</Label
                    >
                    <Input
                      id="subject"
                      bind:value={formState.subject}
                      placeholder="e.g. Medicine in UK"
                      class="h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 px-6 text-base font-medium"
                    />
                  </div>
                </div>

                <div class="space-y-3">
                  <Label for="message" class="text-xs font-bold uppercase ml-4"
                    >Your Message</Label
                  >
                  <Textarea
                    id="message"
                    required
                    bind:value={formState.message}
                    placeholder="Tell us about your academic goals..."
                    class="min-h-[160px] rounded-xl bg-muted/30 border-none focus-visible:ring-primary/20 p-6 text-base font-medium resize-none shadow-inner"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  class="w-full rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  {#if isSubmitting}
                    <Clock class="mr-2 size-5 animate-spin" />
                    Processing...
                  {:else}
                    Submit Inquiry <Send
                      class="ml-3 size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    />
                  {/if}
                </Button>

                <p
                  class="text-center text-muted-foreground text-xs font-medium px-4"
                >
                  By submitting this form, you agree to our privacy policy and
                  consent to being contacted by our education experts.
                </p>
              </form>
            </div>
          {/if}
        </Card>
      </div>
    </div>
  </div>
</section>

<!-- Map / Visual Placeholder -->
<section class="py-8 bg-muted/10 relative overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-12">
      Connect Globally
    </h2>
    <div class="relative max-w-5xl mx-auto">
      <div class="absolute inset-0 bg-primary/5 rounded-xl blur-[100px]"></div>
      <div
        class="relative aspect-video rounded-xl overflow-hidden shadow-lg border-16 border-background bg-muted"
      >
        <img
          src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2070&auto=format&fit=crop"
          alt="Global Network"
          class="size-full object-cover grayscale opacity-50"
        />
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="p-12 bg-background/40 backdrop-blur-2xl rounded-full border border-white/20 shadow-lg animate-pulse"
          >
            <Globe class="size-20 text-primary" />
          </div>
        </div>

        <!-- Overlay Markers -->
        <div class="absolute top-1/4 left-1/4 animate-bounce delay-100">
          <div
            class="size-4 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]"
          ></div>
        </div>
        <div class="absolute top-1/2 left-1/3 animate-bounce delay-300">
          <div
            class="size-4 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]"
          ></div>
        </div>
        <div class="absolute bottom-1/3 right-1/4 animate-bounce delay-500">
          <div
            class="size-4 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.8)]"
          ></div>
        </div>
      </div>

      <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-12">
        <div
          class="flex flex-col items-center p-8 bg-background rounded-xl shadow-sm border border-muted hover:border-primary/20 transition-all group"
        >
          <span class="text-4xl mb-4 group-hover:scale-110 transition-transform"
            >🎓</span
          >
          <p class="text-xs font-bold uppercase text-muted-foreground">
            Expert Advisors
          </p>
        </div>
        <div
          class="flex flex-col items-center p-8 bg-background rounded-xl shadow-sm border border-muted hover:border-primary/20 transition-all group"
        >
          <span class="text-4xl mb-4 group-hover:scale-110 transition-transform"
            >🌍</span
          >
          <p class="text-xs font-bold uppercase text-muted-foreground">
            Global Reach
          </p>
        </div>
        <div
          class="flex flex-col items-center p-8 bg-background rounded-xl shadow-sm border border-muted hover:border-primary/20 transition-all group"
        >
          <span class="text-4xl mb-4 group-hover:scale-110 transition-transform"
            >✨</span
          >
          <p class="text-xs font-bold uppercase text-muted-foreground">
            Success Stories
          </p>
        </div>
        <div
          class="flex flex-col items-center p-8 bg-background rounded-xl shadow-sm border border-muted hover:border-primary/20 transition-all group"
        >
          <span class="text-4xl mb-4 group-hover:scale-110 transition-transform"
            >⚡</span
          >
          <p class="text-xs font-bold uppercase text-muted-foreground">
            Fast Response
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
