<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { AlertTriangle, Loader2 } from "@lucide/svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    item: any;
    open: boolean;
    title: string;
    endpoint: string;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
  }

  let { item, open, title, endpoint, onOpenChange, onSuccess }: Props =
    $props();
  let isLoading = $state(false);

  const handleDelete = async () => {
    isLoading = true;
    try {
      const response = await fetch(`${endpoint}/${item.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);
      toast.success("Successfully deleted");
      if (onSuccess) {
        onSuccess();
      } else {
        location.reload();
      }
      onOpenChange(false);
    } catch (err: any) {
      console.error("Failed to delete:", err);
      toast.error(err.message || "Failed to delete entry");
    } finally {
      isLoading = false;
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) onOpenChange(newOpen);
  };
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Content class="sm:max-w-md rounded-xl shadow-lg border-border">
    <Dialog.Header>
      <Dialog.Title class="flex items-center gap-2 text-destructive font-bold">
        <AlertTriangle class="h-5 w-5" />
        {title}
      </Dialog.Title>
      <Dialog.Description class="text-muted-foreground">
        This action cannot be undone. This will permanently delete this entry.
      </Dialog.Description>
    </Dialog.Header>
    <div class="space-y-2 rounded-lg border bg-muted/30 p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-foreground">Identifier:</span>
        <span class="text-sm text-muted-foreground truncate max-w-[200px]"
          >{item?.title || item?.name || item?.id}</span
        >
      </div>
    </div>
    <Dialog.Footer class="gap-2">
      <Button
        type="button"
        variant="outline"
        onclick={() => handleOpenChange(false)}
        disabled={isLoading}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="destructive"
        onclick={handleDelete}
        disabled={isLoading}
      >
        {#if isLoading}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Deleting...
        {:else}
          Delete
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
