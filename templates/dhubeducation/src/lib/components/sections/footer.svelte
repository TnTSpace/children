<script lang="ts">
  import { Constants } from "$lib/constants";
  import {
    Facebook,
    Instagram,
    Twitter,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    Linkedin,
    Youtube,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import BrandLink from "$lib/components/widgets/BrandLink.svelte";
  import NewsletterForm from "$lib/components/sections/NewsletterForm.svelte";
</script>

<footer class="bg-background pt-32 pb-12 border-t border-primary/5">
  <div class="center mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 gap-16 lg:grid-cols-12">
      <!-- Brand & Story -->
      <div class="lg:col-span-4 space-y-10">
        <BrandLink />
        <p
          class="text-lg text-muted-foreground font-medium leading-relaxed max-w-sm"
        >
          {Constants.BRANDSLOGAN}
        </p>
        <div class="flex gap-4">
          {#each [{ icon: Facebook, href: Constants.FACEBOOK }, { icon: Instagram, href: Constants.INSTAGRAM }, { icon: Twitter, href: Constants.TWITTER }, { icon: Linkedin, href: "#" }] as social}
            <a
              href={social.href}
              target="_blank"
              class="size-12 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-500 hover:-translate-y-1 shadow-sm"
            >
              <social.icon class="size-5" />
            </a>
          {/each}
        </div>
      </div>

      <!-- Quick Navigation -->
      <div class="lg:col-span-2 space-y-8">
        <h4
          class="text-xs font-bold uppercase tracking-[0.2em] text-foreground"
        >
          Navigation
        </h4>
        <nav class="flex flex-col gap-4">
          {#each [{ name: "About Us", href: "/about" }, { name: "Services", href: "/services" }, { name: "Courses", href: "/courses" }, { name: "Partners", href: "/partners" }, { name: "Contact", href: "/contact" }] as link}
            <a
              href={link.href}
              class="text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center group"
            >
              {link.name}
              <ArrowRight
                class="ml-2 size-3 opacity-0 group-hover:opacity-100 transition-all"
              />
            </a>
          {/each}
        </nav>
      </div>

      <!-- Insights -->
      <div class="lg:col-span-2 space-y-8">
        <h4
          class="text-xs font-bold uppercase tracking-[0.2em] text-foreground"
        >
          Insights
        </h4>
        <nav class="flex flex-col gap-4">
          {#each [{ name: "Our Blogs", href: "/blogs" }, { name: "Daily Updates", href: "/campaigns" }, { name: "Help Center", href: "/faqs" }] as link}
            <a
              href={link.href}
              class="text-sm font-bold text-muted-foreground hover:text-primary transition-all flex items-center group"
            >
              {link.name}
              <ArrowRight
                class="ml-2 size-3 opacity-0 group-hover:opacity-100 transition-all"
              />
            </a>
          {/each}
        </nav>
      </div>

      <!-- Newsletter -->
      <div class="lg:col-span-4 space-y-8">
        <h4
          class="text-xs font-bold uppercase tracking-[0.2em] text-foreground"
        >
          Newsletter
        </h4>
        <div
          class="p-4 rounded-xl bg-muted/30 border border-muted relative overflow-hidden group"
        >
          <div
            class="absolute -top-12 -right-12 size-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"
          ></div>
          <p class="text-sm font-bold mb-6">
            Stay updated with the latest educational opportunities.
          </p>
          <NewsletterForm variant="compact" />
        </div>
      </div>
    </div>

    <!-- Contact Row -->
    <div
      class="grid grid-cols-1 md:grid-cols-3 gap-12 py-12 border-y border-primary/5 mb-12"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary"
        >
          <Mail class="size-5" />
        </div>
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Email Support
          </p>
          <a
            href="mailto:{Constants.SUPPORTEMAIL}"
            class="text-sm font-bold hover:text-primary transition-colors"
            >{Constants.SUPPORTEMAIL}</a
          >
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div
          class="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary"
        >
          <Phone class="size-5" />
        </div>
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Call Center
          </p>
          <a
            href="tel:{Constants.PHONE}"
            class="text-sm font-bold hover:text-primary transition-colors"
            >{Constants.PHONE}</a
          >
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div
          class="size-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary"
        >
          <MapPin class="size-5" />
        </div>
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >
            Our Location
          </p>
          <a
            href={Constants.LOCATION_URL}
            target="_blank"
            class="text-sm font-bold hover:text-primary transition-colors"
            >United Kingdom Hub</a
          >
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="flex flex-col md:flex-row justify-between items-center gap-8">
      <p
        class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60"
      >
        © {new Date().getFullYear()}
        {Constants.BRANDNAME}. Premium International Consultancy.
      </p>
      <div class="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em]">
        <a
          href="/terms-of-use"
          class="text-muted-foreground hover:text-primary transition-all"
          >Terms</a
        >
        <a
          href="/privacy-policy"
          class="text-muted-foreground hover:text-primary transition-all"
          >Privacy</a
        >
        <a
          href="/cookie-policy"
          class="text-muted-foreground hover:text-primary transition-all"
          >Cookies</a
        >
      </div>
    </div>
  </div>
</footer>
