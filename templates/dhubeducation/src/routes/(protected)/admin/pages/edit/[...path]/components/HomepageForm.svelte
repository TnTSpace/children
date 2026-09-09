<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import {
    Plus,
    Trash2,
    LayoutDashboard,
    Handshake,
    BookOpen,
    HelpCircle,
    MessageSquare,
    BarChart3,
    Sparkles,
    Target,
    Play,
    Image as ImageIcon,
    Type,
    Link as LinkIcon,
  } from "@lucide/svelte";
  import IconPicker from "$lib/components/ui/picker/IconPicker.svelte";
  import { Separator } from "$lib/components/ui/separator";
  import VideoUpload from "$lib/components/widgets/VideoUpload.svelte";

  interface Props {
    content: any;
    onReelUpload?: (index: number, id: string, url: string) => void;
    onReelDelete?: (index: number, id: string) => void;
  }

  let { content = $bindable(), onReelUpload, onReelDelete }: Props = $props();

  // Initialize arrays if missing
  if (!content.hero) content.hero = [];
  if (!content.stats) content.stats = [];
  if (!content.features) content.features = { items: [] };
  if (!content.mission) content.mission = { values: [], coreValues: [] };
  if (!content.cta) content.cta = {};
  if (!content.reels) content.reels = { items: [] };

  // Ensure icons are initialized to prevent bind:value={undefined} errors
  if (content.features?.items) {
    content.features.items.forEach((item: any) => {
      if (item.icon === undefined) item.icon = "";
    });
  }
  if (content.mission?.values) {
    content.mission.values.forEach((val: any) => {
      if (val.icon === undefined) val.icon = "";
    });
  }

  // Hero Actions
  function addHero() {
    content.hero = [
      ...content.hero,
      {
        subtitle: "",
        title: "",
        description: "",
        primaryCta: {
          text: "Apply Now",
          href: "/auth/login?redirectTo=/dashboard",
        },
        secondaryCta: { text: "Learn More", href: "/about" },
        backgroundImage: "/homepage_sliders/dhub_1600x600.webp",
      },
    ];
  }

  function removeHero(index: number) {
    content.hero = content.hero.filter((_: any, i: number) => i !== index);
  }

  // Stat Actions
  function addStat() {
    content.stats = [
      ...content.stats,
      { label: "", value: "", icon: "BarChart3" },
    ];
  }

  function removeStat(index: number) {
    content.stats = content.stats.filter((_: any, i: number) => i !== index);
  }

  // Feature Actions
  function addFeature() {
    if (!content.features.items) content.features.items = [];
    content.features.items = [
      ...content.features.items,
      { title: "", description: "", icon: "GraduationCap" },
    ];
  }

  function removeFeature(index: number) {
    content.features.items = content.features.items.filter(
      (_: any, i: number) => i !== index,
    );
  }

  // Mission Actions
  function addValue() {
    if (!content.mission.values) content.mission.values = [];
    content.mission.values = [
      ...content.mission.values,
      { title: "", description: "", icon: "ShieldCheck" },
    ];
  }

  function removeValue(index: number) {
    content.mission.values = content.mission.values.filter(
      (_: any, i: number) => i !== index,
    );
  }

  // Reel Actions
  function addReel() {
    if (!content.reels.items) content.reels.items = [];
    content.reels.items = [
      ...content.reels.items,
      { videoUrl: "", thumbnailUrl: "", label: "" },
    ];
  }

  function removeReel(index: number) {
    content.reels.items = content.reels.items.filter(
      (_: any, i: number) => i !== index,
    );
  }
</script>

<div class="space-y-6">
  <!-- Hero Section -->
  <SectionWrapper
    id="hero"
    title="Hero Slides"
    description="Manage the sliding banners at the top of the homepage"
    icon={LayoutDashboard}
  >
    {#snippet headerAction()}
      <Button
        variant="outline"
        size="sm"
        onclick={addHero}
        class="gap-2 rounded-lg text-primary"
      >
        <Plus class="size-4" /> Add Slide
      </Button>
    {/snippet}

    <div class="space-y-4">
      {#each content.hero || [] as slide, i}
        <div
          class="relative p-6 rounded-xl border bg-card/50 hover:border-primary/20 transition-all"
        >
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
            onclick={() => removeHero(i)}
          >
            <Trash2 class="size-4" />
          </Button>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Title</Label
              >
              <Input
                bind:value={slide.title}
                placeholder="Empowering Your Global Future"
              />
            </div>
            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Subtitle</Label
              >
              <Input
                bind:value={slide.subtitle}
                placeholder="Expert Educational Consultancy"
              />
            </div>
            <div class="md:col-span-2 space-y-2">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Description</Label
              >
              <Textarea bind:value={slide.description} rows={2} />
            </div>
            <div class="space-y-2">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Background Image Path</Label
              >
              <Input
                bind:value={slide.backgroundImage}
                placeholder="/homepage_sliders/..."
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Primary CTA Text</Label
                >
                <Input bind:value={slide.primaryCta.text} />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Primary CTA Link</Label
                >
                <Input bind:value={slide.primaryCta.href} />
              </div>
            </div>
          </div>
        </div>
      {/each}
      {#if !content.hero?.length}
        <div
          class="p-8 text-center border-2 border-dashed rounded-xl text-muted-foreground"
        >
          No hero slides added yet. Each slide represents a banner image and
          text.
        </div>
      {/if}
    </div>
  </SectionWrapper>

  <!-- Video Reels Section -->
  <SectionWrapper
    id="reels"
    title="Video Reels"
    description="Short video experiences and student success stories"
    icon={Play}
  >
    {#snippet headerAction()}
      <Button
        variant="outline"
        size="sm"
        onclick={addReel}
        class="gap-2 rounded-lg text-primary"
      >
        <Plus class="size-4" /> Add Reel
      </Button>
    {/snippet}

    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2 p-6 border rounded-xl bg-muted/30">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Section Title</Label
          >
          <Input
            bind:value={content.reels.title}
            placeholder="Student Life & Success"
          />
        </div>
        <div class="md:col-span-2 space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Description</Label
          >
          <Textarea
            bind:value={content.reels.description}
            rows={2}
            placeholder="Catch a glimpse..."
          />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        {#each content.reels.items || [] as reel, i}
          <div
            class="relative p-6 rounded-xl border bg-card/50 hover:border-primary/20 transition-all"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
              onclick={() => removeReel(i)}
            >
              <Trash2 class="size-4" />
            </Button>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Reel Label</Label
                >
                <Input bind:value={reel.label} placeholder="Campus Tour" />
              </div>
              <VideoUpload
                fileId={reel.fileId}
                videoUrl={reel.videoUrl}
                label="Reel Video"
                onUploadSuccess={(id, url) => onReelUpload?.(i, id, url)}
                onRemove={() => onReelDelete?.(i, reel.fileId)}
              />
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Thumbnail URL (Optional)</Label
                >
                <Input
                  bind:value={reel.thumbnailUrl}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        {/each}
        <Button
          variant="outline"
          onclick={addReel}
          class="h-full min-h-40 border-dashed border-2 flex-col gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          <Plus class="size-6" />
          <span>Add Video Reel</span>
        </Button>
      </div>
    </div>
  </SectionWrapper>

  <!-- Stats Section -->
  <SectionWrapper
    id="stats"
    title="Impact Statistics"
    description="Key performance indicators displayed as counters"
    icon={BarChart3}
  >
    {#snippet headerAction()}
      <Button
        variant="outline"
        size="sm"
        onclick={addStat}
        class="gap-2 rounded-lg text-primary"
      >
        <Plus class="size-4" /> Add Stat
      </Button>
    {/snippet}

    <div class="grid gap-4 md:grid-cols-4">
      {#each content.stats || [] as stat, i}
        <div
          class="relative p-6 rounded-xl border bg-card/50 hover:border-primary/20 transition-all"
        >
          <Button
            variant="ghost"
            size="icon"
            class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
            onclick={() => removeStat(i)}
          >
            <Trash2 class="size-4" />
          </Button>
          <div class="space-y-4 text-center pt-2">
            <div class="space-y-1">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Value</Label
              >
              <Input
                bind:value={stat.value}
                placeholder="500+"
                class="text-center font-bold text-lg"
              />
            </div>
            <div class="space-y-1">
              <Label
                class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >Label</Label
              >
              <Input
                bind:value={stat.label}
                placeholder="Students Placed"
                class="text-center"
              />
            </div>
          </div>
        </div>
      {/each}
    </div>
  </SectionWrapper>

  <!-- Features/Expertise Section -->
  <SectionWrapper
    id="services"
    title="Expertise & Features"
    description="Highlight your core competencies and services"
    icon={Sparkles}
  >
    {#snippet headerAction()}
      <Button
        variant="outline"
        size="sm"
        onclick={addFeature}
        class="gap-2 rounded-lg text-primary"
      >
        <Plus class="size-4" /> Add Feature
      </Button>
    {/snippet}

    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2 p-6 border rounded-xl bg-muted/30">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Badge Text</Label
          >
          <Input
            bind:value={content.features.badge}
            placeholder="Our Expertise"
          />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Section Title</Label
          >
          <Input
            bind:value={content.features.title}
            placeholder="Comprehensive Support..."
          />
        </div>
        <div class="md:col-span-2 space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Description</Label
          >
          <Textarea bind:value={content.features.description} rows={2} />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        {#each content.features.items || [] as item, i}
          <div
            class="relative p-6 rounded-xl border bg-card/50 hover:border-primary/20 transition-all"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
              onclick={() => removeFeature(i)}
            >
              <Trash2 class="size-4" />
            </Button>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Title</Label
                >
                <Input bind:value={item.title} />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Description</Label
                >
                <Textarea bind:value={item.description} rows={2} />
              </div>
              <IconPicker label="Feature Icon" bind:value={item.icon} />
            </div>
          </div>
        {/each}
      </div>
    </div>
  </SectionWrapper>

  <!-- Mission & Vision Section -->
  <SectionWrapper
    id="mission"
    title="Mission & Vision"
    description="Your company's long-term goals and core values"
    icon={Target}
  >
    <div class="grid gap-6">
      <div class="grid gap-4 md:grid-cols-2 p-6 border rounded-xl bg-muted/30">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Badge Text</Label
          >
          <Input bind:value={content.mission.badge} placeholder="Our Vision" />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Section Title</Label
          >
          <Input
            bind:value={content.mission.title}
            placeholder="Bridging the Gap..."
          />
        </div>
        <div class="md:col-span-2 space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Description</Label
          >
          <Textarea bind:value={content.mission.description} rows={2} />
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        {#each content.mission.values || [] as value, i}
          <div
            class="relative p-6 rounded-xl border bg-card/50 hover:border-primary/20 transition-all"
          >
            <Button
              variant="ghost"
              size="icon"
              class="absolute top-2 right-2 text-muted-foreground hover:text-destructive h-8 w-8 rounded-full"
              onclick={() => removeValue(i)}
            >
              <Trash2 class="size-4" />
            </Button>
            <div class="space-y-4">
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Value Name</Label
                >
                <Input bind:value={value.title} />
              </div>
              <div class="space-y-2">
                <Label
                  class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                  >Description</Label
                >
                <Textarea bind:value={value.description} rows={3} />
              </div>
              <IconPicker label="Icon" bind:value={value.icon} />
            </div>
          </div>
        {/each}
        <Button
          variant="outline"
          onclick={addValue}
          class="h-full min-h-40 border-dashed border-2 flex-col gap-2 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
        >
          <Plus class="size-6" />
          <span>Add Core Value</span>
        </Button>
      </div>
    </div>
  </SectionWrapper>

  <!-- Call to Action Section -->
  <SectionWrapper
    id="cta"
    title="Bottom CTA"
    description="Final call to action before the footer"
    icon={MessageSquare}
  >
    <div class="grid gap-6 p-6 border rounded-xl bg-muted/30">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Badge Text</Label
          >
          <Input bind:value={content.cta.badge} placeholder="Join Dhub" />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Section Title</Label
          >
          <Input
            bind:value={content.cta.title}
            placeholder="Ready to Start..."
          />
        </div>
        <div class="md:col-span-2 space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Description</Label
          >
          <Textarea bind:value={content.cta.description} rows={2} />
        </div>
        <div class="space-y-2">
          <Label class="text-xs font-bold uppercase text-primary"
            >Button Text</Label
          >
          <Input
            bind:value={content.cta.buttonText}
            placeholder="Book Free Consultation"
          />
        </div>
      </div>
    </div>
  </SectionWrapper>
</div>
