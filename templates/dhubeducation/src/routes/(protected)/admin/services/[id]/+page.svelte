<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save, Trash2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import ServiceDrawerContent from "../components/ServiceDrawerContent.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import type { iService } from "$lib/interface";

  let { data } = $props();

  let isSaving = $state(false);
  let isDeleteDialogOpen = $state(false);
  let service = $derived<iService>(data.service);

  const handleSave = async () => {
    if (!service.name || !service.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch(`/api/service/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Service updated successfully");
      goto("/admin/services");
    } catch (err: any) {
      toast.error(err.message || "Failed to update service");
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
        onclick={() => goto("/admin/services")}
        class="rounded-xl"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Edit Service</h1>
        <p class="text-muted-foreground mt-1">Update your service details.</p>
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
        onclick={() => goto("/admin/services")}
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
      <ServiceDrawerContent bind:item={service} mode="edit" />
    </Card.Content>
  </Card.Root>
</div>

{#if isDeleteDialogOpen}
  <AdminCRUDDeleteDialog
    item={service}
    open={isDeleteDialogOpen}
    title="Delete Service"
    endpoint="/api/service"
    onOpenChange={(open) => (isDeleteDialogOpen = open)}
    onSuccess={() => {
      isDeleteDialogOpen = false;
      goto("/admin/services");
    }}
  />
{/if}
