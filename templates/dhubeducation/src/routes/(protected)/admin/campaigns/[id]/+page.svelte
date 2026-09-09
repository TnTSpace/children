<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowLeft, Save, Loader2, Trash2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import CampaignForm from "../components/CampaignForm.svelte";
  import { toast } from "svelte-sonner";
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import type { iCampaign } from "$lib/interface";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data = $bindable() } = $props();
  let campaign = $state({ ...data.campaign });
  let isSaving = $state(false);
  let isDeleteDialogOpen = $state(false);

  async function handleSave() {
    isSaving = true;
    try {
      const response = await fetch(`/api/campaign/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Campaign updated successfully");
      goto("/admin/campaigns");
    } catch (err: any) {
      toast.error(err.message || "Failed to update campaign");
    } finally {
      isSaving = false;
    }
  }
</script>

<Metatag title="Edit Campaign: {campaign.title}" />

<div
  class="max-w-6xl mx-auto space-y-8"
  in:fly={{ y: 20, duration: 600, easing: quintOut }}
>
  <!-- Header Section -->
  <div
    class="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onclick={() => goto("/admin/campaigns")}
          class="rounded-full hover:bg-primary/5 transition-colors"
        >
          <ArrowLeft class="size-5" />
        </Button>
        <span
          class="text-xs font-semibold text-primary uppercase tracking-widest"
          >Campaign Editor</span
        >
      </div>
      <h1
        class="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70"
      >
        {campaign.title || "Untitled Campaign"}
      </h1>
      <p class="text-muted-foreground flex items-center gap-2">
        Last updated: {new Date(campaign.updatedAt).toLocaleDateString()}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        onclick={() => (isDeleteDialogOpen = true)}
        class="rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10"
      >
        <Trash2 class="size-4 mr-2" />
        Delete
      </Button>
      <Button
        onclick={handleSave}
        disabled={isSaving}
        class="rounded-xl shadow-lg bg-primary hover:bg-primary/90 transition-all active:scale-95"
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-5 w-5 animate-spin" />
          Saving...
        {:else}
          <Save class="mr-2 h-5 w-5" />
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <!-- Form Content -->
  <div
    class="bg-background border border-muted/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
  >
    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
      <Save size={200} />
    </div>

    <CampaignForm bind:item={campaign as Partial<iCampaign>} mode="edit" />
  </div>

  <!-- Footer Actions (redundant for convenience on long forms) -->
  <div class="flex justify-end pt-4">
    <Button
      variant="ghost"
      onclick={() => goto("/admin/campaigns")}
      class="mr-4 text-muted-foreground hover:text-foreground"
    >
      Cancel & Discard
    </Button>
    <Button
      onclick={handleSave}
      disabled={isSaving}
      variant="secondary"
      class="rounded-xl px-10 h-12 border-primary/20"
    >
      Save Final Version
    </Button>
  </div>
</div>

{#if isDeleteDialogOpen}
  <AdminCRUDDeleteDialog
    item={campaign}
    open={isDeleteDialogOpen}
    title="Delete Campaign"
    endpoint="/api/campaign"
    onOpenChange={(open) => (isDeleteDialogOpen = open)}
    onSuccess={() => {
      isDeleteDialogOpen = false;
      goto("/admin/campaigns");
    }}
  />
{/if}

<style>
  :global(.prose) {
    max-width: none;
  }
</style>
