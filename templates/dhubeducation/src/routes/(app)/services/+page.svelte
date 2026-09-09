<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
  } from "$lib/components/ui/card/index.js";
  import {
    GraduationCap,
    Plane,
    Home,
    Search,
    ChevronRight,
    ArrowRight,
    LayoutGrid,
    MessageCircle,
    UserCheck,
    Briefcase,
  } from "@lucide/svelte";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import { page } from "$app/state";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data }: { data: PageServerData } = $props();

  const services = $derived(data.services?.data?.data || []);
  const total = $derived(data.services?.data?.total || 0);

  // Mapping generic services to icons if needed, or using defaults
  const iconMap: Record<string, any> = {
    Admissions: GraduationCap,
    Visa: Plane,
    Accommodation: Home,
    Consultation: MessageCircle,
    Career: Briefcase,
    Recruitment: UserCheck,
  };

  function getIcon(name: string) {
    for (const key in iconMap) {
      if (name.toLowerCase().includes(key.toLowerCase())) return iconMap[key];
    }
    return LayoutGrid;
  }
</script>

<Metatag title="Our Services" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 left-0 w-1/2 h-full bg-primary/3 skew-x-12 -translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
    <Badge
      variant="outline"
      class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
      >Our Expertise</Badge
    >
    <h1 class="text-6xl font-bold sm:text-9xl leading-[0.85] mb-12">
      Comprehensive <span class="text-primary italic">Support</span>
    </h1>
    <p
      class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto"
    >
      From university applications to post-arrival support, we provide
      end-to-end guidance for your international educational journey.
    </p>
  </div>
</section>

<!-- Services Grid -->
<section class="pb-32 min-h-[400px]">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    {#if services.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {#each services as service, i (service.id)}
          <div in:fade={{ delay: i * 50, duration: 500 }}>
            <Card
              class="rounded-xl border-primary/5 bg-background shadow-lg hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 group overflow-hidden border hover:border-primary/20 hover:-translate-y-4 flex flex-col h-full"
            >
              <!-- Image Header -->
              <a
                href="/services/{service.id}"
                class="block overflow-hidden aspect-16/10 relative"
              >
                {#if service.imageUrl}
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    class="size-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                {:else}
                  <div
                    class="size-full bg-muted/30 flex items-center justify-center"
                  >
                    <LayoutGrid class="size-12 text-primary/10" />
                  </div>
                {/if}
                <div
                  class="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>
              </a>

              <CardHeader class="p-8 pb-4">
                <Badge
                  variant="outline"
                  class="w-fit mb-4 border-primary/20 bg-primary/5 text-primary rounded-lg text-[9px] uppercase font-bold"
                >
                  Expert Service
                </Badge>
                <CardTitle
                  class="text-2xl font-bold leading-tight group-hover:text-primary transition-colors duration-500"
                >
                  <a href="/services/{service.id}">{service.name}</a>
                </CardTitle>
              </CardHeader>
              <CardContent class="p-8 pt-0 grow">
                <p
                  class="text-muted-foreground font-medium leading-relaxed line-clamp-3"
                >
                  {service.description}
                </p>
              </CardContent>
              <CardFooter class="p-8 pt-0 mt-auto flex flex-col gap-3">
                <Button
                  href="/services/{service.id}"
                  class="w-full rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all group py-6"
                >
                  Explore Service <ChevronRight
                    class="ml-2 size-4 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
                <Button
                  href="/contact"
                  variant="ghost"
                  class="w-full rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/5"
                >
                  Quick Enquiry
                </Button>
              </CardFooter>
            </Card>
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="py-8 text-center border-2 border-dashed border-muted rounded-xl bg-muted/10 max-w-4xl mx-auto"
      >
        <LayoutGrid
          class="size-20 text-muted-foreground/20 mx-auto mb-8 animate-pulse"
        />
        <h3 class="text-3xl font-bold mb-4">Our Services are Evolving</h3>
        <p class="text-muted-foreground max-w-md mx-auto font-medium">
          We are updating our service catalog to better serve your needs. Please
          contact us directly for immediate support and guidance.
        </p>
        <Button href="/contact" class="mt-12 rounded-xl"
          >Talk to an Expert</Button
        >
      </div>
    {/if}
  </div>
</section>

<!-- Bottom CTA -->
<section class="py-8 bg-background relative overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div
      class="rounded-xl bg-muted/30 p-12 md:p-24 border border-muted relative overflow-hidden"
    >
      <div
        class="absolute top-0 right-0 size-96 bg-primary/3 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"
      ></div>
      <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10"
      >
        <div>
          <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-10">
            Still have questions?
          </h2>
          <p
            class="text-lg text-muted-foreground font-medium leading-relaxed mb-10"
          >
            International education involves many moving parts. Our specialized
            advisors are here to clarify the process and design a path that
            works for you.
          </p>
          <div class="flex flex-col sm:flex-row gap-6">
            <Button href="/contact" class="rounded-xl shadow-lg"
              >Book Free Consultation</Button
            >
            <Button
              href="/"
              variant="outline"
              class="rounded-xl border-primary/20 transition-all"
              >Back to Home</Button
            >
          </div>
        </div>
        <div class="relative group">
          <div
            class="absolute -inset-10 bg-primary/5 rounded-full blur-[80px] group-hover:bg-primary/10 transition-all duration-700"
          ></div>
          <div
            class="relative bg-background p-12 rounded-xl shadow-lg border border-muted"
          >
            <div class="flex items-center gap-6 mb-8">
              <img
                src="/ceo_square.webp"
                alt="Support"
                class="size-20 rounded-xl object-cover shadow-lg"
              />
              <div>
                <p class="font-bold text-xl">Dedicated Support</p>
                <p class="text-xs font-bold uppercase text-primary mt-2">
                  Dhub Education Experts
                </p>
              </div>
            </div>
            <p class="text-muted-foreground font-medium italic mb-10">
              "Our goal is to ensure you don't just get an admission, but you
              thrive in your new environment. We treat every application like
              it's our own."
            </p>
            <div class="flex gap-4">
              <div class="size-3 rounded-full bg-green-500 animate-pulse"></div>
              <span class="text-xs font-bold uppercase text-foreground/60"
                >Experts Online Now</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
