<script lang="ts">
  import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Edit, Trash2, Eye } from "@lucide/svelte";
  import { editors, Role } from "$lib/constants";
  import { page } from "$app/state";
  import type { User } from "$lib/auth";

  interface Props {
    item: any;
    index: number;
    title: string;
    subtitle?: string;
    description?: string;
    onView?: (item: any) => void;
    onEdit?: (item: any) => void;
    onDelete?: (item: any) => void;
    content?: import("svelte").Snippet;
    badge?: import("svelte").Snippet;
  }

  let {
    item,
    index,
    title,
    subtitle,
    description,
    onView,
    onEdit,
    onDelete,
    content,
    badge,
  }: Props = $props();

  const user = page.data.user as User;
</script>

<Card class="rounded-xl shadow-md overflow-hidden">
  <CardHeader class="p-4 border-b bg-muted/30">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md"
          >
            #{index + 1}
          </span>
          {#if badge}
            {@render badge()}
          {/if}
        </div>
        <CardTitle class="text-lg font-bold truncate">{title}</CardTitle>
        {#if subtitle}
          <p class="text-xs text-muted-foreground truncate">{subtitle}</p>
        {/if}
      </div>
      <Button variant="ghost" onclick={() => onView?.(item)}>
        <Eye class="size-4" />
      </Button>
    </div>
  </CardHeader>

  <CardContent class="p-4">
    {#if description}
      <p class="text-sm text-muted-foreground line-clamp-2 mb-3">
        {description}
      </p>
    {/if}

    {#if content}
      <div class="space-y-2">
        {@render content()}
      </div>
    {/if}

    {#if editors.includes(user.role as Role)}
      <div class="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
        <Button variant="outline" onclick={() => onEdit?.(item)}>
          <Edit class="size-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          onclick={() => onDelete?.(item)}
          class="text-destructive border-destructive/20 hover:bg-destructive/10"
        >
          <Trash2 class="size-4 mr-2" />
          Delete
        </Button>
      </div>
    {/if}
  </CardContent>
</Card>
