<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { ArrowLeft, Save, Loader2, PlusCircle } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import CampaignForm from "../components/CampaignForm.svelte";
  import { toast } from "svelte-sonner";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import type { iCampaign } from "$lib/interface";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let campaign = $state<Partial<iCampaign>>({
    title: "",
    description: "",
    content: "",
    startDate: null,
    endDate: null,
  });

  let isSaving = $state(false);

  async function handleSave() {
    if (!campaign.title) {
      toast.error("Please enter a campaign title");
      return;
    }

    isSaving = true;
    try {
      const response = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Campaign created successfully");
      goto("/admin/campaigns");
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      isSaving = false;
    }
  }
</script>

<Metatag title="New Campaign" />

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
          >Admin Portal</span
        >
      </div>
      <h1
        class="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70"
      >
        Launch New Campaign
      </h1>
      <p class="text-muted-foreground">
        Fill in the details below to start your new marketing campaign.
      </p>
    </div>

    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        onclick={() => goto("/admin/campaigns")}
        class="text-muted-foreground mr-2"
      >
        Cancel
      </Button>
      <Button
        onclick={handleSave}
        disabled={isSaving}
        class="rounded-xl shadow-xl bg-primary hover:bg-primary/90 transition-all active:scale-95 group"
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-5 w-5 animate-spin" />
          Launching...
        {:else}
          <PlusCircle
            class="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300"
          />
          Create Campaign
        {/if}
      </Button>
    </div>
  </div>

  <!-- Form Content -->
  <div
    class="bg-background border border-muted/20 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-muted/10"
  >
    <!-- Background Decor -->
    <div
      class="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4"
    >
      <PlusCircle size={300} />
    </div>

    <CampaignForm bind:item={campaign} mode="create" />
  </div>

  <!-- Footer Actions -->
  <div class="flex justify-end pt-4 pb-12">
    <Button
      onclick={handleSave}
      disabled={isSaving}
      variant="secondary"
      class="rounded-xl px-12 h-12 border-primary/20 hover:shadow-lg transition-all"
    >
      Finalize & Save
    </Button>
  </div>
</div>

<style>
  :global(.prose) {
    max-width: none;
  }
</style>
