<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Gift,
    Users,
    Zap,
    Trophy,
    CheckCircle2,
    ArrowRight,
    Share2,
    Star,
    Sparkles,
    Globe,
    GraduationCap
  } from "@lucide/svelte";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { IsMobile } from "$lib/hooks/is-mobile.svelte";

  let { data } = $props();
  const isMobile = new IsMobile();
  
  let selectedProgram = $state<any>(null);
  let showDetails = $state(false);

  const defaultContent = {
    title: "The Global Education Referral Program",
    description: "Earn rewards while helping your friends reach their academic goals abroad. Join the DHUB Education community today.",
    data: JSON.stringify({
      steps: [
        { title: "Join", description: "Register for our referral program in seconds." },
        { title: "Refer", description: "Share your unique link or refer friends directly from your dashboard." },
        { title: "Earn", description: "Receive between £100 - £1000 for every successful admission." }
      ],
      benefits: [
        "Exclusive cash rewards",
        "Priority counseling for your friends",
        "Networking opportunities",
        "Ambassador badges"
      ],
      referralTypes: [
        {
          "type": "Customer",
          "caption": "Earn rewards for referrals and receive personalized support throughout your academic journey.",
          "benefit": "Enjoy exclusive rewards and dedicated academic support when you refer students and institutions to DHUB Education.",
          "details": "The Customer Referral Program at DHUB Education is designed to empower our current and past students with valuable opportunities to grow, give back, and earn. As a Customer Referral, you become part of a trusted network that promotes the transformative power of education while being rewarded for your influence.",
          "image": "/uploads/referrals/customer.webp"
        },
        {
          "type": "Employee",
          "caption": "Actively contribute to company initiatives, access internal resources, and be part of a vibrant community fostering growth and involvement.",
          "benefit": "Actively contribute to company initiatives, access internal resources, and be part of a vibrant community fostering growth and involvement.",
          "details": "The Employee Referral program offers exclusive opportunities for current employees of DHUB Education to actively contribute to the company's growth and initiatives. Referrals in this category participate in company-wide campaigns and gain access to internal resources and events.",
          "image": "/uploads/referrals/employee.webp"
        },
        {
          "type": "Influencer",
          "caption": "Collaborate with DHUB Education on campaigns, earning commissions for driving traffic and sales while promoting educational excellence.",
          "benefit": "Collaborate with DHUB Education on campaigns, earning commissions for driving traffic and sales while promoting educational excellence.",
          "details": "The Influencer Referral program invites individuals with a demonstrated influence in the education or related field to collaborate with DHUB Education on exclusive campaigns. Referrals in this category leverage their influence to promote educational excellence, earning commission for driving traffic and sales.",
          "image": "/uploads/referrals/influencer.webp"
        },
        {
          "type": "Teacher",
          "caption": "Access supplementary resources, contribute to educational content, and engage in professional development opportunities.",
          "benefit": "Access supplementary resources, contribute to educational content, and engage in professional development opportunities.",
          "details": "The Teacher Referral program is tailored for educators who are passionate about enhancing educational experiences. Referrals in this category gain access to supplementary teaching materials and resources, along with opportunities to share their expertise and contribute to educational content.",
          "image": "/uploads/referrals/teacher.webp"
        },
        {
          "type": "Vendor",
          "caption": "Promote your educational products and services to a global audience, aligning with DHUB Education's values and standards.",
          "benefit": "Promote your educational products and services to a global audience, aligning with DHUB Education's values and standards.",
          "details": "The Vendor Referral program provides a platform for educational vendors to expand their reach to a global audience. Referrals in this category have the opportunity to promote their educational products and services on our platform, reaching a diverse and engaged audience.",
          "image": "/uploads/referrals/vendor.webp"
        }
      ]
    })
  };

  const content = $derived(data.content || defaultContent);
  const extraData = $derived(content.data ? JSON.parse(content.data) : JSON.parse(defaultContent.data));
</script>

<Metatag title="Referral Program | DHUB Education" description={content.description} />

<div class="relative w-full overflow-hidden">
  <!-- Hero Section -->
  <section class="relative pt-20 pb-32 md:pt-32 md:pb-48">
    <!-- Background Accents -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
    </div>

    <div class="container relative z-10 px-4 mx-auto text-center">
      <Badge variant="outline" class="mb-6 px-4 py-1.5 text-sm font-medium bg-primary/5 border-primary/20 text-primary animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <Sparkles class="size-4 mr-2" />
        Join the Ambassador Community
      </Badge>
      
      <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <span class="bg-clip-text text-transparent bg-linear-to-r from-primary via-foreground to-primary bg-300% animate-gradient">
          {content.title}
        </span>
      </h1>
      
      <p class="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        {content.description}
      </p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-400">
        <Button size="lg" href="/referral" class="w-full sm:w-autorounded-xl shadow-xl shadow-primary/20 group">
          Get Started Now
          <ArrowRight class="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button variant="outline" size="lg" href="/contact" class="w-full sm:w-autorounded-xl">
          Learn More
        </Button>
      </div>
    </div>
  </section>

  <!-- Stats/Trust Section -->
  <!-- <section class="py-12 border-y bg-muted/30">
    <div class="container px-4 mx-auto">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="text-center">
          <p class="text-3xl font-bold mb-1">500+</p>
          <p class="text-sm text-muted-foreground uppercase tracking-widest font-medium">Ambassadors</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold mb-1">$50k+</p>
          <p class="text-sm text-muted-foreground uppercase tracking-widest font-medium">Rewards Paid</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold mb-1">1.2k+</p>
          <p class="text-sm text-muted-foreground uppercase tracking-widest font-medium">Successful Referrals</p>
        </div>
        <div class="text-center">
          <p class="text-3xl font-bold mb-1">15+</p>
          <p class="text-sm text-muted-foreground uppercase tracking-widest font-medium">Countries</p>
        </div>
      </div>
    </div>
  </section> -->

  <!-- How It Works -->
  <section class="py-24 md:py-32 bg-background">
    <div class="container px-4 mx-auto">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
        <p class="text-muted-foreground max-w-xl mx-auto">Three simple steps to start earning while helping others achieve their dreams.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        {#each extraData.steps as step, i}
          <div class="relative p-8 rounded-xl bg-card border border-primary/5 shadow-sm hover:shadow-md transition-shadow group">
            <div class="absolute -top-4 -left-4 size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
              {i + 1}
            </div>
            <h3 class="text-xl font-bold mt-4 mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
            <p class="text-muted-foreground">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Referral Types Section -->
  {#if extraData.referralTypes && extraData.referralTypes.length > 0}
    <section class="py-24 md:py-32 bg-muted/20">
      <div class="container px-4 mx-auto">
        <div class="text-center mb-16">
          <Badge variant="outline" class="mb-4">Specialized Programs</Badge>
          <h2 class="text-3xl md:text-5xl font-bold mb-4">Referral Paths</h2>
          <p class="text-muted-foreground max-w-xl mx-auto">We have tailored programs for different community members. Choose the path that fits you best.</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {#each extraData.referralTypes as prog}
            <Card.Root class="rounded-xl overflow-hidden border-primary/10 hover:shadow-xl transition-all group flex flex-col h-full">
              <div class="aspect-video relative overflow-hidden">
                <img 
                  src={prog.image || "/uploads/referrals/customer.webp"} 
                  alt={prog.type} 
                  class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent"></div>
                <div class="absolute bottom-4 left-4">
                  <Badge class="bg-primary text-primary-foreground font-bold">{prog.type}</Badge>
                </div>
              </div>
              <Card.Header class="pb-2">
                <Card.Title class="text-xl font-bold group-hover:text-primary transition-colors">{prog.type} Program</Card.Title>
                <Card.Description class="line-clamp-2">{prog.caption}</Card.Description>
              </Card.Header>
              <Card.Content class="flex-1">
                <p class="text-sm text-muted-foreground line-clamp-3">{prog.details}</p>
              </Card.Content>
              <Card.Footer class="pt-4 border-t bg-muted/10 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  class="rounded-lg h-9 text-xs"
                  onclick={() => {
                    selectedProgram = prog;
                    showDetails = true;
                  }}
                >
                  Learn More
                </Button>
                <Button class="rounded-lg h-9 text-xs group/btn" href="/referral">
                  Join Now
                  <ArrowRight class="size-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Card.Footer>
            </Card.Root>
          {/each}
        </div>
      </div>
    </section>
  {/if}

  <!-- Benefits Section -->
  <section class="py-24 md:py-32 bg-primary/5">
    <div class="container px-4 mx-auto">
      <div class="flex flex-col lg:flex-row items-center gap-16">
        <div class="flex-1 space-y-8">
          <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Why Join the DHUB <br/> Referral Program?</h2>
          <p class="text-lg text-muted-foreground leading-relaxed">
            We believe in the power of community. Our referral program is designed to reward those who help us expand our reach and impact lives through global education.
          </p>
          
          <ul class="space-y-4">
            {#each extraData.benefits as benefit}
              <li class="flex items-center gap-3">
                <div class="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <CheckCircle2 class="size-4" />
                </div>
                <span class="font-medium">{benefit}</span>
              </li>
            {/each}
          </ul>
          
          <Button href="/referral" class="rounded-xl h-12 px-8">
            Start Earning Today
          </Button>
        </div>

        <div class="flex-1 grid grid-cols-2 gap-4">
          <div class="space-y-4">
            <Card.Root class="rounded-xl bg-background border-primary/10 shadow-lg overflow-hidden translate-y-8">
              <Card.Content class="p-6 text-center space-y-3">
                <div class="mx-auto size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Trophy class="size-6" />
                </div>
                <p class="font-bold">Top Earner</p>
                <p class="text-xs text-muted-foreground font-medium uppercase">Last Month</p>
              </Card.Content>
            </Card.Root>
            <Card.Root class="rounded-xl bg-background border-primary/10 shadow-lg overflow-hidden">
              <Card.Content class="p-6 text-center space-y-3">
                <div class="mx-auto size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <Globe class="size-6" />
                </div>
                <p class="font-bold">Global Network</p>
                <p class="text-xs text-muted-foreground font-medium uppercase">Access</p>
              </Card.Content>
            </Card.Root>
          </div>
          <div class="space-y-4 pt-8">
             <Card.Root class="rounded-xl bg-background border-primary/10 shadow-lg overflow-hidden">
              <Card.Content class="p-6 text-center space-y-3">
                <div class="mx-auto size-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star class="size-6" />
                </div>
                <p class="font-bold">Exclusive Events</p>
                <p class="text-xs text-muted-foreground font-medium uppercase">VIP Access</p>
              </Card.Content>
            </Card.Root>
            <Card.Root class="rounded-xl bg-background border-primary/10 shadow-lg overflow-hidden -translate-y-8">
              <Card.Content class="p-6 text-center space-y-3">
                <div class="mx-auto size-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <GraduationCap class="size-6" />
                </div>
                <p class="font-bold">Education First</p>
                <p class="text-xs text-muted-foreground font-medium uppercase">Impact</p>
              </Card.Content>
            </Card.Root>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Final CTA -->
  <section class="py-24">
    <div class="container px-4 mx-auto">
      <div class="rounded-xl bg-foreground text-background p-8 md:p-24 text-center space-y-8 shadow-lg relative overflow-hidden">
        <div class="absolute inset-0 bg-primary/10 opacity-50 blur-3xl rounded-full -top-1/2 -left-1/2"></div>
        <div class="relative z-10 space-y-8">
          <h2 class="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight">Ready to make an impact?</h2>
          <p class="text-muted text-lg md:text-xl max-w-2xl mx-auto">
            Join hundreds of ambassadors who are making a difference in international education.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" href="/referral" class="w-full sm:w-auto h-14 px-10 rounded-xl text-lg font-bold group">
              Join Now
              <ArrowRight class="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Detail View -->
  {#if isMobile.current}
    <Drawer.Root bind:open={showDetails}>
      <Drawer.Content class="bg-background">
        {#if selectedProgram}
          <div class="px-6 py-8 space-y-6">
            <div class="space-y-2">
              <Badge variant="outline" class="bg-primary/10 text-primary border-primary/20">{selectedProgram.type}</Badge>
              <h2 class="text-2xl font-bold">{selectedProgram.type} Referral Program</h2>
            </div>
            <div class="aspect-video rounded-xl overflow-hidden border">
              <img src={selectedProgram.image} alt={selectedProgram.type} class="w-full h-full object-cover" />
            </div>
            <div class="space-y-4">
              <div class="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <h3 class="font-bold text-primary flex items-center gap-2">
                  <Sparkles class="size-4" />
                  Primary Benefit
                </h3>
                <p class="text-sm mt-1">{selectedProgram.benefit}</p>
              </div>
              <div class="space-y-2">
                <h3 class="font-bold">Detailed Description</h3>
                <p class="text-sm text-muted-foreground leading-relaxed">{selectedProgram.details}</p>
              </div>
            </div>
            <Button href="/referral" class="w-full h-12 rounded-xl">Join Program Now</Button>
          </div>
        {/if}
      </Drawer.Content>
    </Drawer.Root>
  {:else}
    <Dialog.Root bind:open={showDetails}>
      <Dialog.Content class="sm:max-w-2xl rounded-xl p-0 overflow-hidden bg-background">
        {#if selectedProgram}
          <div class="grid md:grid-cols-2">
            <div class="h-full bg-muted min-h-[400px]">
              <img src={selectedProgram.image} alt={selectedProgram.type} class="w-full h-full object-cover" />
            </div>
            <div class="p-8 space-y-6">
              <div class="space-y-2">
                <Badge variant="outline" class="bg-primary/10 text-primary border-primary/20">{selectedProgram.type}</Badge>
                <Dialog.Title class="text-3xl font-bold">{selectedProgram.type} Program</Dialog.Title>
              </div>
              <div class="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <h3 class="font-bold text-primary flex items-center gap-2">
                  <Sparkles class="size-4" />
                  Primary Benefit
                </h3>
                <p class="text-sm mt-1">{selectedProgram.benefit}</p>
              </div>
              <div class="space-y-2">
                <h3 class="font-bold">About this Path</h3>
                <p class="text-sm text-muted-foreground leading-relaxed line-clamp-6">{selectedProgram.details}</p>
              </div>
              <div class="pt-4">
                <Button href="/referral" class="w-full h-12 rounded-xl shadow-lg shadow-primary/20 group">
                  Join {selectedProgram.type} Path
                  <ArrowRight class="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        {/if}
      </Dialog.Content>
    </Dialog.Root>
  {/if}
</div>

<style>
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .animate-gradient {
    background-size: 300% 300%;
    animation: gradient 8s ease infinite;
  }
</style>
