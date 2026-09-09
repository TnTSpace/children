<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
  } from "$lib/components/ui/card";
  import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
  } from "$lib/components/ui/tabs";
  import { goto, invalidateAll } from "$app/navigation";
  import HomepageForm from "./components/HomepageForm.svelte";
  import EditorHeader from "$lib/components/admin/editor/EditorHeader.svelte";
  import EditorJumpLinks from "$lib/components/admin/editor/EditorJumpLinks.svelte";
  import SEOSection from "$lib/components/admin/editor/SEOSection.svelte";
  import SectionWrapper from "$lib/components/admin/editor/SectionWrapper.svelte";
  import {
    LayoutDashboard,
    Sparkles,
    BarChart3,
    Handshake,
    BookOpen,
    HelpCircle,
    MessageSquare,
    Globe,
    Loader2,
    Target,
    Play,
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  let { data, form } = $props();

  let submitting = $state(false);
  let isUploadingOg = $state(false);
  let visualData = $state<any>(null);

  // Meta state
  let pageTitle = $state("");
  let pageDescription = $state("");
  let ogImage = $state("");

  let initialized = false;
  $effect(() => {
    if (!initialized && data.pageContent.data) {
      try {
        const parsed = JSON.parse(data.pageContent.data);
        visualData = parsed;
        pageTitle = data.pageContent.title || "";
        pageDescription = data.pageContent.description || "";
        ogImage = data.pageContent.ogImage || "";
      } catch (e) {
        console.error("Invalid JSON structure", e);
      }
      initialized = true;
    }
  });

  async function handleOgUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    isUploadingOg = true;
    const formData = new FormData();
    formData.append("file", input.files[0]);

    try {
      const response = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        ogImage = result.directUrl;
        toast.success("Image uploaded successfully");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("An error occurred during upload");
    } finally {
      isUploadingOg = false;
    }
  }

  async function handleReelUpload(index: number, id: string, url: string) {
    if (!visualData.reels.items) visualData.reels.items = [];
    if (!visualData.reels.items[index]) {
      visualData.reels.items[index] = {
        videoUrl: "",
        thumbnailUrl: "",
        label: "",
      };
    }
    visualData.reels.items[index].videoUrl = url;
    visualData.reels.items[index].fileId = id;
    toast.success("Reel video linked successfully");
  }

  async function handleReelDelete(index: number, id: string) {
    if (!id) return;
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (result.success) {
        if (visualData.reels.items[index]) {
          visualData.reels.items[index].videoUrl = "";
          visualData.reels.items[index].fileId = "";
        }
        toast.success("Reel video deleted successfully");
        await handleSave(); // Auto-save to reflect removal in CMS
      } else {
        toast.error(result.error || "Failed to delete file");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    }
  }

  async function handleSave() {
    submitting = true;
    const formData = new FormData();
    formData.append("path", data.path);
    formData.append("data", JSON.stringify(visualData));
    formData.append("title", pageTitle);
    formData.append("description", pageDescription);
    formData.append("ogImage", ogImage);

    try {
      const response = await fetch("?/update", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Content saved successfully");
        await invalidateAll();
      } else {
        toast.error("Failed to save content");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      submitting = false;
    }
  }

  const jumpLinks = $derived([
    { id: "seo", label: "SEO", icon: Sparkles },
    ...(data.path === "/"
      ? [
          { id: "hero", label: "Hero", icon: LayoutDashboard },
          { id: "reels", label: "Reels", icon: Play },
          { id: "stats", label: "Stats", icon: BarChart3 },
          { id: "services", label: "Services", icon: Handshake },
          { id: "mission", label: "Mission", icon: Target },
          { id: "cta", label: "CTA", icon: MessageSquare },
        ]
      : []),
  ]);

  $effect(() => {
    if (form?.success) {
      toast.success("Content saved successfully");
      submitting = false;
    } else if (form?.message) {
      toast.error(form.message);
      submitting = false;
    }
  });
</script>

<div class="flex flex-col gap-4 pb-20 w-full">
  <EditorHeader
    title={`Edit ${data.path === "/" ? "Homepage" : data.path}`}
    isSubmitting={submitting}
    onSave={handleSave}
  />

  <EditorJumpLinks links={jumpLinks} />

  <div class="space-y-4">
    <SEOSection
      bind:title={pageTitle}
      bind:description={pageDescription}
      bind:ogImage
      {isUploadingOg}
      onImageUpload={handleOgUpload}
    />

    {#if data.path === "/"}
      {#if visualData}
        <HomepageForm
          bind:content={visualData}
          onReelUpload={handleReelUpload}
          onReelDelete={handleReelDelete}
        />
      {:else}
        <div class="p-20 text-center opacity-50">
          <Loader2 class="size-8 animate-spin mx-auto mb-4" />
          Initializing visual data...
        </div>
      {/if}
    {:else}
      <SectionWrapper
        id="content"
        title="Page Content"
        description="Edit the content for this page"
        icon={Globe}
      >
        <div class="p-8 text-center text-muted-foreground">
          Visual editor for sub-pages is coming soon.
        </div>
      </SectionWrapper>
    {/if}
  </div>
</div>
