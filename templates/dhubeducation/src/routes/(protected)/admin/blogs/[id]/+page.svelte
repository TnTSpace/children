<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save, Trash2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import BlogDrawerContent from "../components/BlogDrawerContent.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import type { iBlog } from "$lib/interface";

  let { data } = $props();
  let isSaving = $state(false);
  let isDeleteDialogOpen = $state(false);
  // untrack: the initial value is a snapshot; the effect below keeps it in sync
  // when navigating between blog posts (avoids state_referenced_locally).
  let blog = $state<iBlog>(untrack(() => data.blog));

  $effect(() => {
    blog = data.blog;
  });

  const handleSave = async () => {
    if (!blog.title || !blog.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch(`/api/blog/${blog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Blog updated successfully");
      goto("/admin/blogs");
    } catch (err: any) {
      toast.error(err.message || "Failed to update blog");
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
        <h1 class="text-3xl font-bold tracking-tight">Edit Blog</h1>
        <p class="text-muted-foreground mt-1">Update your blog post details.</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="destructive"
        onclick={() => (isDeleteDialogOpen = true)}
        class="rounded-xl"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Delete
      </Button>
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
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <Card.Root class="rounded-xl shadow-lg border-muted/20">
    <Card.Content>
      <BlogDrawerContent bind:item={blog} mode="edit" />
    </Card.Content>
  </Card.Root>
</div>

{#if isDeleteDialogOpen}
  <AdminCRUDDeleteDialog
    item={blog}
    open={isDeleteDialogOpen}
    title="Delete Blog Post"
    endpoint="/api/blog"
    onOpenChange={(open) => (isDeleteDialogOpen = open)}
    onSuccess={() => {
      isDeleteDialogOpen = false;
      goto("/admin/blogs");
    }}
  />
{/if}
