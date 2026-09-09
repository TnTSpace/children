<script lang="ts">
  import { TableRow, TableCell } from "$lib/components/ui/table";
  import { Button } from "$lib/components/ui/button";
  import { Eye, Edit, Trash2 } from "@lucide/svelte";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    item: any;
    index: number;
    onView?: (item: any) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    columns: import("svelte").Snippet;
  }

  let { item, index, onView, onEdit, onDelete, columns }: Props = $props();
  const user = page.data.user as User;
</script>

<TableRow
  class="cursor-pointer hover:bg-muted/50"
  onclick={() => onView?.(item)}
>
  <TableCell class="font-medium">{index + 1}.</TableCell>

  {#if columns}
    {@render columns()}
  {/if}

  <TableCell class="text-right">
    <div class="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label="View"
        onclick={(e) => {
          e.stopPropagation();
          onView?.(item);
        }}
      >
        <Eye class="size-4" />
      </Button>
      {#if editors.includes(user.role as Role)}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Edit"
          onclick={(e) => {
            e.stopPropagation();
            onEdit?.(item);
          }}
        >
          <Edit class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Delete"
          onclick={(e) => {
            e.stopPropagation();
            onDelete?.(item);
          }}
        >
          <Trash2 class="size-4" />
        </Button>
      {/if}
    </div>
  </TableCell>
</TableRow>
