<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import BlogDrawerContent from "../components/BlogDrawerContent.svelte";
  import type { iBlog } from "$lib/interface";

  let isSaving = $state(false);
  let blog = $state<Partial<iBlog>>({
    title: "",
    description: "",
    content: "",
    fileId: null,
    imageUrl: null,
  });

  const handleSave = async () => {
    if (!blog.title || !blog.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Blog created successfully");
      goto("/admin/blogs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create blog");
    } finally {
      isSaving = false;
    }
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onclick={() => goto("/admin/blogs")}
        class="rounded-xl"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Create Blog</h1>
        <p class="text-muted-foreground mt-1">
          Add a new post to your documentation.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        onclick={() => goto("/admin/blogs")}
        disabled={isSaving}
        class="rounded-xl"
      >
        Cancel
      </Button>
      <Button
        onclick={handleSave}
        disabled={isSaving}
        class="rounded-xl shadow-lg"
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Saving...
        {:else}
          <Save class="mr-2 h-4 w-4" />
          Save Blog
        {/if}
      </Button>
    </div>
  </div>

  <Card.Root class="rounded-xl shadow-lg border-muted/20">
    <Card.Content>
      <BlogDrawerContent bind:item={blog} mode="create" />
    </Card.Content>
  </Card.Root>
</div>
