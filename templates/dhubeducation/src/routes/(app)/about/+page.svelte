<script lang="ts">
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "$lib/components/ui/card/index.js";
  import {
    Users,
    Target,
    Rocket,
    Heart,
    ShieldCheck,
    Globe,
    Lightbulb,
    ArrowRight,
    GraduationCap,
    CheckCircle2,
    Users2,
  } from "@lucide/svelte";
  import { HomepageContent } from "$lib/constants";
  import { fade, fly, slide } from "svelte/transition";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  const storySections = [
    {
      id: "who-we-are",
      title: "Who We Are",
      icon: Users,
      content:
        "DHUB Education is a leading education consultant dedicated to providing unparalleled support and guidance to international students and universities worldwide. Our team of committed professionals works tirelessly to offer expert advice and assistance, ensuring a seamless educational journey from foundation level to Ph.D.",
    },
    {
      id: "why-we-are-here",
      title: "Why We Are Here",
      icon: Target,
      content:
        "At DHUB Education, our vision is clear - to create a distinguished quality service for all students, with a special emphasis on science students and education providers. We believe in fostering self-discovery, knowledge construction, and transformation, empowering each student to make the best university choices.",
    },
    {
      id: "what-we-do",
      title: "What We Do",
      icon: Rocket,
      content:
        "We specialize in guiding your educational journey with a comprehensive suite of services tailored to your individual needs: from finding the perfect school that aligns with your goals and budget, to expert advice on course selection and visa processes.",
    },
  ];

  const values = [
    {
      title: "Excellence",
      description:
        "We strive to provide top-tier education consulting services through rigorous standards.",
      icon: Lightbulb,
    },
    {
      title: "Integrity",
      description:
        "We operate with honesty and transparency in every interaction, building lasting trust.",
      icon: ShieldCheck,
    },
    {
      title: "Innovation",
      description:
        "We continuously improve our approaches to better serve students and global partners.",
      icon: Globe,
    },
    {
      title: "Commitment",
      description:
        "We are dedicated to supporting students in achieving their academic and life dreams.",
      icon: Heart,
    },
  ];
</script>

<Metatag title="About Us" />

<!-- Hero Section -->
<section
  class="relative pt-32 pb-48 md:pt-48 md:pb-64 overflow-hidden bg-background"
>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute top-0 right-0 w-1/2 h-full bg-primary/3 -skew-x-12 translate-x-1/4"
    ></div>
  </div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="max-w-4xl">
      <Badge
        variant="outline"
        class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
        >Our Story</Badge
      >
      <h1 class="text-6xl font-bold sm:text-9xl leading-[0.85] mb-12">
        Inspiring Global <span class="text-primary italic">Ambitions</span>
      </h1>
      <p
        class="text-xl md:text-2xl text-muted-foreground font-medium leading-relaxed max-w-2xl"
      >
        We bridge the gap between local talent and global opportunities, shaping
        the future of international education one student at a time.
      </p>
    </div>
  </div>
</section>

<!-- Mission Cards -->
<section class="relative z-20 -mt-32 px-4 sm:px-6 lg:px-8">
  <div class="center mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      {#each storySections as section}
        <Card
          class="rounded-xl border-primary/10 bg-background/80 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all duration-700 hover:-translate-y-4 group"
        >
          <CardHeader class="p-10">
            <div
              class="size-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-lg shadow-primary/10 group-hover:rotate-6"
            >
              <section.icon class="size-8" />
            </div>
            <CardTitle class="text-3xl font-bold mb-4"
              >{section.title}</CardTitle
            >
            <CardDescription
              class="text-base text-muted-foreground font-medium leading-relaxed"
            >
              {section.content}
            </CardDescription>
          </CardHeader>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Values Section -->
<section class="py-8 bg-background relative overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="flex flex-col lg:flex-row gap-24 items-center">
      <div class="lg:w-1/2">
        <Badge
          variant="outline"
          class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
          >Our Foundation</Badge
        >
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-12">
          Values That Drive Us
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {#each values as value}
            <div
              class="space-y-4 p-8 rounded-xl bg-muted/30 border border-muted hover:border-primary/20 transition-all group"
            >
              <div
                class="size-12 rounded-xl bg-background flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
              >
                <value.icon class="size-6 text-primary" />
              </div>
              <h3 class="text-xl font-bold">{value.title}</h3>
              <p
                class="text-sm text-muted-foreground font-medium leading-relaxed"
              >
                {value.description}
              </p>
            </div>
          {/each}
        </div>
      </div>
      <div class="lg:w-1/2 relative">
        <div
          class="absolute -inset-10 bg-primary/5 rounded-xl blur-[100px]"
        ></div>
        <div
          class="relative aspect-square rounded-xl overflow-hidden shadow-lg border-16 border-background bg-muted"
        >
          <img
            src="/about_hero.webp"
            alt="Global Education"
            class="size-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 hover:scale-100"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"
          ></div>
        </div>
        <!-- Floating Badge -->
        <div
          class="absolute -bottom-8 -left-8 p-10 bg-background/80 backdrop-blur-2xl rounded-xl shadow-lg border border-primary/10 hidden md:block"
        >
          <p class="text-4xl font-bold text-primary leading-none">100%</p>
          <p class="text-xs font-bold uppercase text-muted-foreground mt-4">
            Commitment to Success
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- The Team / CEO Message -->
<section class="py-8 bg-muted/10 relative overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
      <div class="relative order-2 md:order-1">
        <div
          class="relative rounded-xl overflow-hidden shadow-lg aspect-3/4 max-w-sm mx-auto border-12 border-background bg-muted"
        >
          <img
            src="/ceo_portrait.webp"
            alt="CEO"
            class="size-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
          />
        </div>
        <div
          class="absolute -top-12 -right-12 p-8 bg-primary rounded-xl text-white shadow-lg hidden lg:block rotate-6"
        >
          <p class="text-lg font-bold italic">
            "Your journey to global excellence starts here."
          </p>
        </div>
      </div>
      <div class="order-1 md:order-2">
        <Badge
          variant="secondary"
          class="mb-8 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase"
          >Leadership</Badge
        >
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-10">
          A Collective Ambition
        </h2>
        <div
          class="space-y-8 text-muted-foreground text-lg font-medium leading-relaxed"
        >
          <p>
            Our team at DHUB Education comprises passionate individuals with
            diverse backgrounds, including education, healthcare, business
            development, and more.
          </p>
          <p>
            We unite under a common ambition: to bridge the gap between local
            talent and global opportunities. With our combined expertise, we are
            committed to building an educational platform that empowers the next
            generation of global leaders and professionals.
          </p>
          <p
            class="text-foreground/80 border-l-4 border-primary pl-8 py-2 italic bg-primary/5 rounded-r-2xl"
          >
            "With a focus on global excellence, DHUB Education is uniquely
            positioned to guide students towards fulfilling careers and academic
            success."
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Partners Section -->
<section class="py-8 bg-background overflow-hidden">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <Badge
      variant="outline"
      class="mb-8 border-primary/20 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold"
      >Our Network</Badge
    >
    <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-8">
      Partnerships & Collaborations
    </h2>
    <p
      class="max-w-2xl mx-auto text-muted-foreground text-lg font-medium mb-24"
    >
      We collaborate with top universities, education providers, and
      organizations globally to create opportunities for students to thrive.
    </p>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
      {#each HomepageContent.partners as partner}
        <div
          class="flex flex-col items-center justify-center p-8 bg-muted/20 border border-muted rounded-xl grayscale opacity-60 hover:grayscale-0 hover:opacity-100 hover:border-primary/20 transition-all duration-500 group"
        >
          <div class="text-4xl mb-4 group-hover:scale-110 transition-transform">
            {partner.logo}
          </div>
          <p class="text-xs font-bold uppercase text-muted-foreground">
            {partner.name}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="py-8 px-4 sm:px-6 lg:px-8">
  <div class="center mx-auto">
    <div
      class="rounded-xl bg-primary p-12 md:p-24 text-center relative overflow-hidden group shadow-[0_50px_100px_rgba(var(--primary-rgb),0.2)]"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] transition-all duration-1000 group-hover:scale-150"
      ></div>
      <div class="relative z-10 max-w-3xl mx-auto">
        <h2
          class="text-5xl md:text-8xl font-bold text-white leading-[0.85] mb-12"
        >
          Ready to Start Your Journey?
        </h2>
        <div
          class="flex flex-col sm:flex-row gap-8 items-center justify-center"
        >
          <Button
            href="/contact"
            variant="secondary"
            class="bg-white text-primary hover:bg-white/90 rounded-xl transition-all hover:scale-105 shadow-lg shadow-black/20 group"
          >
            Contact an Expert <ArrowRight
              class="ml-3 size-6 group-hover:translate-x-1 transition-transform"
            />
          </Button>
          <Button
            href="/services"
            variant="outline"
            class="bg-transparent border-white/30 text-white hover:bg-white/10 rounded-xl backdrop-blur-xl transition-all"
          >
            Explore Services
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>
