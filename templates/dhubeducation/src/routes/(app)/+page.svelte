<script lang="ts">
  import { HomepageContent, Constants } from "$lib/constants";
  import { blogPath } from "$lib/seo";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
  } from "$lib/components/ui/card";
  import * as Accordion from "$lib/components/ui/accordion";
  import {
    ArrowRight,
    CheckCircle2,
    Star,
    Quote,
    Globe2,
    BookOpen,
    Building2,
    GraduationCap,
    ShieldCheck,
    Play,
    Zap,
    Users,
    Trophy,
    Sparkles,
    ShieldCheck as ShieldIcon,
    Rocket,
  } from "@lucide/svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
  import PartnershipBanner from "$lib/components/sections/PartnershipBanner.svelte";
  import VideoDialog from "$lib/components/widgets/VideoDialog.svelte";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";
  import type { PageServerData } from "./$types";
  import { fade, fly } from "svelte/transition";
  import { toast } from "svelte-sonner";
  import { adminRoles } from "$lib/constants";
  import type {
    iBlog,
    iCourse,
    iService,
    iFaq,
    iPartner,
    iReview,
  } from "$lib/interface";
  import MainHero from "$lib/components/sections/MainHero.svelte";

  let { data }: { data: PageServerData } = $props();

  const user = page.data.user as User | undefined;

  const blogs = $derived<iBlog[]>(data.blogs || []);
  const courses = $derived<iCourse[]>(data.courses || []);
  const services = $derived<iService[]>(data.services || []);
  const faqs = $derived<iFaq[]>(data.faqs || []);
  const partners = $derived<iPartner[]>(data.partners || []);
  const reviews = $derived<iReview[]>(data.reviews || []);

  // Parse CMS content with fallbacks
  const cms = $derived(() => {
    try {
      if (data.pageContent?.data) {
        return JSON.parse(data.pageContent.data);
      }
    } catch (e) {
      console.error("Failed to parse CMS data", e);
    }
    return null;
  });

  const hero = $derived(cms()?.hero || HomepageContent.hero);
  const stats = $derived(cms()?.stats || HomepageContent.stats);
  const features = $derived(cms()?.features || HomepageContent.features);
  const mission = $derived(cms()?.mission || HomepageContent.mission);
  const reels = $derived(cms()?.reels || HomepageContent.reels);
  const cta = $derived(cms()?.cta || HomepageContent.cta);

  // Video Modal State
  let videoOpen = $state(false);
  let activeVideoUrl = $state("");

  function playVideo(url: string) {
    if (!url) {
      toast.error("No video available for this review");
      return;
    }
    activeVideoUrl = url;
    videoOpen = true;
  }
</script>

<Metatag
  title={data.pageContent?.title || hero[0].title}
  description={data.pageContent?.description || hero[0].description}
/>

<MainHero items={hero} />

{#if user}
  <section
    class="relative z-30 mt-6 md:-mt-8 mb-12 px-4"
    in:fly={{ y: 20, duration: 800, delay: 200 }}
  >
    <div class="center mx-auto">
      <div
        class="relative group overflow-hidden rounded-3xl border border-white/20 bg-white/5 backdrop-blur-2xl shadow-2xl transition-all duration-500 hover:border-primary/30"
      >
        <!-- Decorative Background Gradient -->
        <div
          class="absolute -right-20 -top-20 size-64 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-700"
        ></div>
        <div
          class="absolute -left-20 -bottom-20 size-64 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700"
        ></div>

        <div
          class="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 text-center md:text-left"
        >
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="relative">
              <div
                class="absolute -inset-1 rounded-2xl bg-linear-to-tr from-primary to-primary/50 opacity-40 blur-sm animate-pulse"
              ></div>
              <div
                class="relative size-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-primary shadow-inner"
              >
                {#if adminRoles.includes(user.role as any)}
                  <ShieldIcon class="size-8" />
                {:else}
                  <Sparkles class="size-8" />
                {/if}
              </div>
            </div>

            <div class="max-w-xl">
              <h3 class="text-2xl font-bold tracking-tight mb-2">
                {#if adminRoles.includes(user.role as any)}
                  Welcome back, Command Center
                {:else}
                  Your Global Journey Awaits
                {/if}
              </h3>
              <p
                class="text-muted-foreground font-medium text-sm leading-relaxed"
              >
                {#if adminRoles.includes(user.role as any)}
                  Access the administrative portal to manage student
                  applications, update records, and oversee the admissions
                  pipeline.
                {:else}
                  Dive back into your admission portal. Complete your profile,
                  tracker your documents, and stay ahead of your application
                  status.
                {/if}
              </p>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0"
          >
            <Button
              href={adminRoles.includes(user.role as any)
                ? "/admin/application"
                : "/application"}
              class="rounded-xl px-8 font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
            >
              {#if adminRoles.includes(user.role as any)}
                Manage Applications
              {:else}
                Admission Portal
              {/if}
              <ArrowRight
                class="ml-2 size-4 transition-transform group-hover:translate-x-1"
              />
            </Button>

            {#if !adminRoles.includes(user.role as any)}
              <Button
                href="/profile"
                variant="outline"
                class="rounded-xl px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all font-bold backdrop-blur-sm"
              >
                View Profile
              </Button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>
{:else}
  <section
    class="relative z-30 mt-6 md:-mt-8 mb-12 px-4"
    in:fly={{ y: 20, duration: 800, delay: 200 }}
  >
    <div class="center mx-auto">
      <div
        class="relative group overflow-hidden rounded-3xl border border-primary/20 bg-linear-to-br from-primary via-primary/95 to-primary/90 shadow-2xl shadow-primary/20 transition-all duration-500 hover:scale-[1.01]"
      >
        <!-- Decorative Background Elements -->
        <div
          class="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl group-hover:bg-white/20 transition-all duration-700"
        ></div>
        <div
          class="absolute -left-16 -bottom-16 size-64 rounded-full bg-black/10 blur-3xl group-hover:bg-black/20 transition-all duration-700"
        ></div>

        <div
          class="relative flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 text-center md:text-left"
        >
          <div class="flex flex-col md:flex-row items-center gap-6">
            <div class="relative">
              <div
                class="absolute -inset-1 rounded-2xl bg-white/40 opacity-40 blur-sm animate-pulse"
              ></div>
              <div
                class="relative size-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-xl backdrop-blur-md"
              >
                <Rocket class="size-8" />
              </div>
            </div>

            <div class="max-w-xl">
              <div
                class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-sm"
              >
                <Zap class="size-3 fill-white" />
                Join 3,000+ Successful Students
              </div>
              <h3
                class="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-white"
              >
                Transform Your Global Future
              </h3>
              <p class="text-white/80 font-medium text-sm leading-relaxed">
                Ready to study medicine or engineering abroad? Start your
                application in minutes and get expert guidance on admissions,
                visas, and documentation.
              </p>
            </div>
          </div>

          <div
            class="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0"
          >
            <Button
              href="/application"
              variant="secondary"
              class="rounded-xl px-10 font-bold bg-white text-primary hover:bg-white/90 shadow-xl transition-all hover:scale-105 active:scale-95 group border-none"
            >
              Begin Application
              <ArrowRight
                class="ml-2 size-4 transition-transform group-hover:translate-x-1"
              />
            </Button>

            <Button
              href="/about"
              variant="outline"
              class="rounded-xl px-8 border-white/30 bg-white/5 text-white hover:bg-white/10 transition-all font-bold backdrop-blur-sm"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}

<PartnershipBanner />

<!-- Reels: Short Video Experiences -->
{#if reels?.items?.length > 0}
  <section id="reels" class="py-24 bg-muted/20 overflow-hidden">
    <div class="center mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="flex flex-col md:flex-row justify-between items-end mb-16 gap-8"
      >
        <div class="max-w-2xl">
          <Badge
            variant="outline"
            class="mb-6 border-primary/30 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
          >
            Experience
          </Badge>
          <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-6">
            {reels.title}
          </h2>
          <p class="text-muted-foreground font-medium text-lg max-w-xl">
            {reels.description}
          </p>
        </div>
      </div>

      <div
        class="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {#each reels.items as reel}
          <button
            class="flex-none w-[280px] sm:w-[320px] snap-start group cursor-pointer bg-transparent border-none p-0 text-left"
            onclick={() => playVideo(reel.videoUrl)}
            aria-label="Play video: {reel.label}"
          >
            <div
              class="relative aspect-9/16 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-primary/20"
            >
              {#if reel.thumbnailUrl}
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.label}
                  class="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              {:else if reel.videoUrl}
                <video
                  src={reel.videoUrl}
                  class="size-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  muted
                  loop
                  autoplay
                  playsinline
                >
                  <track kind="captions" />
                </video>
              {:else}
                <div
                  class="size-full bg-linear-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center p-8 text-center"
                >
                  <Play class="size-16 text-primary/20 mb-4" />
                  <p
                    class="text-xs font-bold uppercase tracking-widest text-primary/40"
                  >
                    Watch Video
                  </p>
                </div>
              {/if}

              <div
                class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"
              ></div>

              <div
                class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100"
              >
                <div
                  class="size-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30"
                >
                  <Play class="size-6 fill-white text-white" />
                </div>
              </div>

              <div class="absolute bottom-8 left-8 right-8">
                <p class="text-white font-bold text-xl leading-tight">
                  {reel.label}
                </p>
              </div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- Stats Grid: Floating Glassmorphism -->
<section id="stats" class="relative z-20 -mt-24 px-4 sm:px-6 lg:px-8">
  <div class="center mx-auto">
    <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {#each stats as stat, i}
        <Card
          class="border-primary/10 bg-background/50 backdrop-blur-xl shadow-md rounded-xl overflow-hidden group hover:border-primary/30 transition-all duration-500 hover:-translate-y-1"
        >
          <CardContent class="p-6 text-center flex flex-col items-center">
            <div
              class="size-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4 text-2xl group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500"
            >
              {stat.emoji || "📈"}
            </div>
            <div
              class="mb-1 text-3xl sm:text-4xl font-bold bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent tracking-tight"
            >
              {stat.value}
            </div>
            <div
              class="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]"
            >
              {stat.label}
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Services: Bento Grid Inspiration -->
<section id="services" class="py-8 bg-background relative overflow-hidden">
  <div
    class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none"
  ></div>

  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div
      class="flex flex-col md:flex-row justify-between items-end mb-20 gap-10"
    >
      <div class="max-w-2xl">
        <Badge
          variant="outline"
          class="mb-6 border-primary/30 bg-primary/5 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
        >
          {features.badge}
        </Badge>
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.95]">
          {features.title}
        </h2>
        <p
          class="mt-8 text-muted-foreground text-lg leading-relaxed font-medium max-w-xl"
        >
          {features.description}
        </p>
      </div>
      <Button
        variant="outline"
        href="/services"
        class="hidden md:flex items-center gap-2 rounded-xl border-primary/20 hover:bg-primary/5 transition-all group font-bold"
      >
        Explore Solutions
        <ArrowRight
          class="size-4 transition-transform group-hover:translate-x-1"
        />
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each services.slice(0, 6) as service}
        <Card
          class="group transition-all duration-500 hover:shadow-lg hover:shadow-primary/5 rounded-xl border-primary/5 bg-linear-to-br from-background to-muted/20 border hover:border-primary/20"
        >
          <CardHeader class="p-6">
            <div
              class="mb-6 inline-flex size-12 items-center justify-center rounded-xl bg-primary/5 text-primary transition-all duration-500 group-hover:bg-primary group-hover:text-white group-hover:scale-110"
            >
              <Zap class="size-6" />
            </div>
            <CardTitle
              class="text-xl font-bold mb-2 tracking-tight group-hover:text-primary transition-colors"
            >
              {service.name}
            </CardTitle>
            <CardDescription
              class="text-muted-foreground text-xs leading-relaxed font-medium line-clamp-3"
            >
              {service.description}
            </CardDescription>
          </CardHeader>
          <CardContent class="px-6 pb-6 pt-0 mt-auto">
            <Button
              variant="link"
              href="/services/{service.id}"
              class="p-0 h-auto text-primary font-bold text-xs group-hover:gap-3 transition-all"
            >
              Learn More <ArrowRight class="ml-2 size-3" />
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Courses: Image-Rich Showcase -->
<section
  id="pathways"
  class="py-8 bg-muted/30 relative overflow-hidden border-y border-primary/5"
>
  <div class="center mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div class="text-center mb-20 max-w-3xl mx-auto">
      <Badge
        variant="outline"
        class="mb-6 border-primary/30 bg-primary/10 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
      >
        Global Opportunities
      </Badge>
      <h2 class="text-5xl font-bold sm:text-7xl mb-8 leading-[0.95]">
        Choose Your Path
      </h2>
      <p class="text-muted-foreground text-lg leading-relaxed font-medium">
        Tailored educational pathways designed to launch your career on a global
        scale.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each courses as course, i}
        <Card
          class="rounded-xl border-primary/5 bg-background shadow-sm hover:shadow-md transition-all duration-500 group overflow-hidden hover:-translate-y-1 flex flex-col"
        >
          <div class="aspect-16/10 overflow-hidden relative">
            {#if course.imageUrl}
              <img
                src={course.imageUrl}
                alt={course.name}
                class="size-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            {:else}
              <div
                class="size-full bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center"
              >
                <BookOpen class="size-10 text-primary/20" />
              </div>
            {/if}
            <div
              class="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
            ></div>
            <div
              class="absolute bottom-3 left-3 right-3 translate-y-2 group-hover:translate-y-0 transition-transform"
            >
              <Badge
                class="bg-primary text-white font-bold rounded-lg text-[9px] px-2 py-0.5"
                >{course.title || "Course"}</Badge
              >
            </div>
          </div>

          <CardHeader class="p-4 flex-1">
            <CardTitle
              class="text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
            >
              {course.name}
            </CardTitle>
          </CardHeader>
          <CardContent class="p-4 pt-0 mt-auto">
            <Button
              href="/courses/{course.id}"
              variant="outline"
              class="w-full text-xs h-9 rounded-xl border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500 font-bold"
            >
              Explore
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- About: CEO Narrative with Premium Typography -->
<section id="about" class="py-8 bg-background relative overflow-hidden">
  <div class="center relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
      <div class="relative group">
        <div
          class="absolute -inset-20 bg-primary/5 rounded-full blur-[120px] pointer-events-none"
        ></div>
        <div
          class="relative rounded-xl overflow-hidden shadow-lg aspect-4/5 max-w-md mx-auto border-16 border-background shadow-primary/10"
        >
          <img
            src="/ceo_portrait.webp"
            alt="CEO Portrait"
            class="size-full object-cover object-top grayscale hover:grayscale-0 transition-all duration-1000"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"
          ></div>
          <div class="absolute bottom-8 left-8 text-white">
            <p class="text-4xl font-bold">Damilola E.</p>
            <p
              class="text-xs font-bold uppercase tracking-[0.3em] opacity-80 mt-2 text-primary"
            >
              CEO & Founder
            </p>
          </div>
        </div>
      </div>

      <div class="lg:pl-6">
        <Badge
          variant="secondary"
          class="mb-8 rounded-full px-5 py-1.5 font-bold uppercase tracking-widest text-[10px]"
        >
          {mission.badge}
        </Badge>
        <h2 class="mb-10 text-5xl font-bold md:text-8xl leading-[0.9]">
          {mission.title}
        </h2>
        <div
          class="space-y-8 text-muted-foreground mb-12 text-lg font-medium leading-relaxed"
        >
          <p>{mission.description}</p>
          <blockquote
            class="border-l-4 border-primary pl-10 italic py-4 text-foreground/90 bg-primary/5 rounded-r-xl relative overflow-hidden"
          >
            <Quote class="absolute top-2 left-2 size-20 text-primary/5 -z-1" />
            "We are not just consultants; we are architects of global futures. Our
            mission is to bridge the gap between local talent and global excellence."
          </blockquote>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 mb-12">
          {#each mission.coreValues?.slice(0, 4) || [] as val}
            <div
              class="flex items-center gap-4 p-4 rounded-xl border border-primary/5 bg-muted/10 hover:border-primary/30 hover:bg-background transition-all group"
            >
              <div
                class="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
              >
                <CheckCircle2 class="size-5" />
              </div>
              <span class="font-bold text-base text-foreground/80">{val}</span>
            </div>
          {/each}
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <Button
            href="/about"
            class="rounded-xl shadow-lg shadow-primary/20 transition-all font-bold"
          >
            Learn More
          </Button>
          <Button
            variant="ghost"
            href="/contact"
            class="rounded-xl border-primary/10 hover:bg-muted font-bold"
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Partners: Premium Institution Showcase -->
<section id="partners" class="py-24 bg-muted/20 border-y border-primary/5">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16 max-w-3xl mx-auto">
      <Badge
        variant="outline"
        class="mb-6 border-primary/30 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
      >
        Network
      </Badge>
      <h2 class="text-5xl font-bold sm:text-7xl leading-[0.9] mb-8">
        World-Class <span class="text-primary italic">Institutions.</span>
      </h2>
      <p class="text-muted-foreground font-medium text-lg">
        Partnering with elite universities across the globe to bring excellence
        to your doorstep.
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {#each partners as partner}
        <div
          class="flex flex-col items-center justify-center bg-background border border-primary/5 rounded-2xl hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-2 transition-all duration-500 group cursor-pointer aspect-square"
        >
          <div
            class="size-full bg-muted/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors overflow-hidden"
          >
            {#if partner.imageUrl}
              <img
                src={partner.imageUrl}
                alt={partner.name}
                class="size-full object-cover"
              />
            {:else}
              <Building2
                class="size-10 text-muted-foreground/20 group-hover:text-primary transition-colors duration-500"
              />
            {/if}
          </div>
          <div class="p-2 flex flex-col gap-1 items-center">
            <p
              class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-primary transition-colors text-center line-clamp-2"
            >
              {partner.name}
            </p>
            <Badge
              variant="secondary"
              class="rounded-full px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]"
            >
              {partner.country}
            </Badge>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-16 text-center">
      <Button
        href="/partners"
        variant="link"
        class="font-bold text-primary group"
      >
        View All Global Partners <ArrowRight
          class="ml-2 size-4 group-hover:translate-x-1 transition-transform"
        />
      </Button>
    </div>
  </div>
</section>

<!-- Testimonials: Social Proof -->
<section id="testimonials" class="py-8 bg-background relative">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="flex flex-col md:flex-row justify-between items-center mb-24 gap-12 text-center md:text-left"
    >
      <div class="max-w-2xl">
        <Badge
          variant="outline"
          class="mb-6 border-primary/30 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
        >
          Results
        </Badge>
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.95]">
          Student Journeys
        </h2>
      </div>
      <div
        class="flex items-center gap-6 bg-muted/30 p-6 rounded-xl border border-primary/5 backdrop-blur-md"
      >
        <div class="flex -space-x-4">
          {#each HomepageContent.reviews.slice(0, 3) as r}
            <img
              src={r.image}
              alt=""
              class="size-12 rounded-full border-4 border-background object-cover shadow-lg"
            />
          {/each}
        </div>
        <div class="text-left">
          <div class="flex gap-1 mb-1">
            {#each Array(5) as _}<Star
                class="size-4 fill-primary text-primary"
              />{/each}
          </div>
          <p
            class="text-[10px] font-bold uppercase text-primary tracking-widest"
          >
            4.9/5 Rating
          </p>
        </div>
      </div>
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      {#each reviews as review}
        <Card
          class="rounded-xl shadow-md border-primary/5 bg-background group hover:-translate-y-1 transition-all duration-500 relative overflow-hidden"
        >
          <Quote
            class="absolute -top-4 -right-4 size-24 text-primary/5 rotate-12"
          />
          <CardContent
            class="pt-10 px-6 pb-8 flex flex-col h-full relative z-10"
          >
            <div class="flex gap-1 mb-4">
              {#each Array(5) as _, i}
                <Star
                  class="size-3 {i < review.rating
                    ? 'fill-primary text-primary'
                    : 'text-muted'}"
                />
              {/each}
            </div>

            <div class="relative mb-8 group/video">
              <div
                class="text-foreground italic leading-relaxed text-base font-medium grow prose prose-sm prose-invert max-w-full"
              >
                {@html review.review}
              </div>

              {#if review.videoUrl}
                <button
                  class="mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                  onclick={() => playVideo(review.videoUrl as string)}
                >
                  <div
                    class="size-6 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <Play class="size-3 fill-primary" />
                  </div>
                  Watch Video Review
                </button>
              {/if}
            </div>

            <div
              class="flex items-center gap-4 pt-6 border-t border-primary/5 mt-auto"
            >
              {#if review.imageUrl}
                <img
                  src={review.imageUrl}
                  alt={review.name}
                  class="size-10 rounded-lg object-cover shadow-sm ring-1 ring-background"
                />
              {:else}
                <div
                  class="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-xs uppercase"
                >
                  {review.name?.charAt(0)}
                </div>
              {/if}
              <div>
                <p class="font-bold text-sm leading-none">{review.name}</p>
                <p
                  class="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5"
                >
                  {review.location}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- Blog Section -->
<section id="blog" class="py-8 bg-muted/20">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div
      class="flex flex-col md:flex-row justify-between items-end mb-20 gap-10"
    >
      <div class="max-w-2xl">
        <Badge
          variant="outline"
          class="mb-6 border-primary/30 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
          >Insights</Badge
        >
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.95]">
          Latest News
        </h2>
      </div>
      <Button
        href="/blogs"
        variant="outline"
        class="px-8 rounded-xl border-primary/20 font-bold"
      >
        Read All Articles
      </Button>
    </div>

    <div class="grid gap-8 md:grid-cols-3">
      {#each blogs.slice(0, 3) as blog}
        <Card
          class="rounded-xl overflow-hidden border-primary/5 bg-background group hover:-translate-y-1 transition-all duration-500 shadow-sm hover:shadow-md"
        >
          {#if blog.imageUrl}
            <div class="aspect-video overflow-hidden">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                class="size-full object-cover group-hover:scale-105 transition-all duration-700"
              />
            </div>
          {/if}
          <CardHeader class="p-5">
            <Badge
              variant="secondary"
              class="mb-3 text-[9px] font-bold uppercase px-2 py-0.5 w-fit"
              >{blog.category || "General"}</Badge
            >
            <CardTitle
              class="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors"
              >{blog.title}</CardTitle
            >
          </CardHeader>
          <CardContent class="p-5 pt-0 mt-auto">
            <p
              class="text-muted-foreground text-xs line-clamp-2 mb-4 font-medium"
            >
              {blog.description}
            </p>
            <Button
              variant="link"
              href={blogPath(blog)}
              class="p-0 h-auto text-primary font-bold text-xs"
            >
              Read More <ArrowRight class="ml-2 size-3" />
            </Button>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</section>

<!-- FAQ Accordion: Clean & Functional -->
<section id="faq" class="py-8 bg-background border-t border-primary/5">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-20">
        <Badge
          variant="outline"
          class="mb-6 border-primary/30 text-primary px-4 py-1.5 rounded-full uppercase text-[10px] font-bold tracking-widest"
          >Help Center</Badge
        >
        <h2 class="text-5xl font-bold sm:text-7xl leading-[0.95] mb-6">
          Common Questions
        </h2>
        <p class="text-muted-foreground font-medium">
          Navigating your international journey starts here.
        </p>
      </div>

      <Card class="rounded-xl border-primary/5 shadow-lg md:p-10">
        <Accordion.Root type="single" class="w-full">
          {#each faqs as faq, i}
            <Accordion.Item
              value="faq-{i}"
              class="border-b border-primary/5 last:border-0 hover:bg-muted/10 transition-colors rounded-lg"
            >
              <Accordion.Trigger
                class="text-left font-bold py-4 hover:no-underline text-base md:text-lg tracking-tight leading-relaxed"
              >
                {faq.question}
              </Accordion.Trigger>
              <Accordion.Content
                class="text-muted-foreground pb-4 text-sm md:text-base leading-relaxed font-medium"
              >
                {@html faq.answer}
              </Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      </Card>

      <div
        class="mt-12 text-center p-8 bg-primary/5 rounded-xl border border-primary/20 border-dashed"
      >
        <p class="text-foreground/80 font-bold mb-4">Still have questions?</p>
        <Button
          href="/contact"
          variant="outline"
          class="rounded-xl border-primary/20 font-bold px-8"
          >Talk to an Expert</Button
        >
      </div>
    </div>
  </div>
</section>

<!-- Call to Action: Full Width Impact -->
<section id="cta" class="p-4">
  <div class="center mx-auto">
    <div
      class="relative rounded-xl overflow-hidden bg-primary p-20 shadow-lg text-center group"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.1),transparent)] group-hover:scale-110 transition-transform duration-1000"
      ></div>

      <div
        class="relative z-10 max-w-4xl mx-auto flex flex-col items-center w-full"
      >
        <Badge
          class="mb-8 bg-white/20 text-white border-white/20 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs"
        >
          Start Today
        </Badge>
        <h2 class="text-2xl md:text-5xl font-bold mb-10">
          {cta.title}
        </h2>
        <p
          class="text-white/80 text-xl font-medium mb-16 max-w-2xl leading-relaxed"
        >
          {cta.description}
        </p>

        <div
          class="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center"
        >
          {#if user}
            <Button
              href="/dashboard"
              variant="secondary"
              class="rounded-xl bg-white text-primary hover:bg-white/90 shadow-2xl transition-all"
            >
              Go to Dashboard
            </Button>
          {:else}
            <Button
              href="/auth/login"
              variant="secondary"
              class="rounded-xl transition-all font-bold group"
            >
              {cta.buttonText}
              <ArrowRight
                class="ml-2 size-4 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <Button
              variant="ghost"
              href="/courses"
              class="rounded-xl border-white/10 text-white hover:bg-white/10 font-bold"
            >
              View Courses
            </Button>
          {/if}
        </div>

        <!-- Trust Badges -->
        <div
          class="mt-24 pt-16 border-t border-white/10 w-full flex flex-wrap justify-center gap-16 text-white/60"
        >
          <div class="flex items-center gap-4">
            <Users class="size-8" />
            <div class="text-left">
              <p class="text-white font-bold text-2xl leading-none">10k+</p>
              <p class="text-[10px] font-bold uppercase tracking-widest mt-1">
                Students
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Building2 class="size-8" />
            <div class="text-left">
              <p class="text-white font-bold text-2xl leading-none">200+</p>
              <p class="text-[10px] font-bold uppercase tracking-widest mt-1">
                Partners
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Trophy class="size-8" />
            <div class="text-left">
              <p class="text-white font-bold text-2xl leading-none">100%</p>
              <p class="text-[10px] font-bold uppercase tracking-widest mt-1">
                Success
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<VideoDialog bind:open={videoOpen} videoUrl={activeVideoUrl} />
