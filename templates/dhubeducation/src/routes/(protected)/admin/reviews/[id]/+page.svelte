<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save, Trash2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import ReviewDrawerContent from "../components/ReviewDrawerContent.svelte";
  import type { iReview } from "$lib/interface";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";

  let { data } = $props();

  let isSaving = $state(false);
  let isDeleteDialogOpen = $state(false);
  let review = $derived<iReview>(data.review);

  const handleSave = async () => {
    if (!review.name || !review.review || !review.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch(`/api/review/${review.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Review updated successfully");
      goto("/admin/reviews");
    } catch (err: any) {
      toast.error(err.message || "Failed to update review");
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
        onclick={() => goto("/admin/reviews")}
        class="rounded-xl"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Edit Review</h1>
        <p class="text-muted-foreground mt-1">
          Update the testimonial details.
        </p>
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
        onclick={() => goto("/admin/reviews")}
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
    <Card.Content class="pt-6">
      <ReviewDrawerContent bind:item={review} mode="edit" />
    </Card.Content>
  </Card.Root>
</div>

{#if isDeleteDialogOpen}
  <AdminCRUDDeleteDialog
    item={review}
    open={isDeleteDialogOpen}
    title="Delete Review"
    endpoint="/api/review"
    onOpenChange={(open) => (isDeleteDialogOpen = open)}
    onSuccess={() => {
      isDeleteDialogOpen = false;
      goto("/admin/reviews");
    }}
  />
{/if}
