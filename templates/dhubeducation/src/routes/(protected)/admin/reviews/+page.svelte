<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { AlertCircleIcon, Loader2, Search, Plus, Star } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    TableCell,
  } from "$lib/components/ui/table/index.js";
  import {
    infiniteScroll,
    useInfiniteScroll,
  } from "$lib/hooks/use-infinite-scroll.svelte";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import type { iReview } from "$lib/interface";
  import AdminCRUDRow from "$lib/components/admin/AdminCRUDRow.svelte";
  import AdminCRUDCard from "$lib/components/admin/AdminCRUDCard.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import { toast } from "svelte-sonner";
  import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "$lib/components/ui/avatar/index.js";

  let searchQuery = $state("");
  const debouncedSearch = new Debounced(() => searchQuery, 500);

  const query = infiniteScroll.listQuery<iReview>(
    () => ({ search: debouncedSearch.current }),
    page.url.origin,
    "review",
  );

  let isDeleteDialogOpen = $state(false);
  let itemToDelete = $state<iReview | null>(null);

  const openDelete = (item: iReview) => {
    itemToDelete = item;
    isDeleteDialogOpen = true;
  };

  const { sentinel } = useInfiniteScroll({
    onLoadMore: () => $query.fetchNextPage(),
    disabled: () => !$query.hasNextPage || $query.isFetchingNextPage,
  });

  function stripHtml(html: string) {
    if (!html) return "";
    return html.replace(/<[^>]*>?/gm, "");
  }
</script>

<div class="flex flex-col gap-6">
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Reviews ({#if $query.isPending}<Loader2
            class="inline h-6 w-6 animate-spin"
          />{:else}{$query?.data?.total ?? 0}{/if})
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage student testimonials and video reviews.
      </p>
    </div>
    <Button
      onclick={() => goto("/admin/reviews/create")}
      class="rounded-xl shadow-lg border-muted/20"
    >
      <Plus class="mr-2 h-4 w-4" />
      Create Review
    </Button>
  </div>

  <div class="flex flex-col items-center gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search reviews..."
        bind:value={searchQuery}
        class="pl-10 rounded-xl"
      />
    </div>
  </div>

  {#if $query.error}
    <Alert.Root
      variant="destructive"
      class="rounded-xl border-destructive/20 bg-destructive/5"
    >
      <AlertCircleIcon class="size-4" />
      <Alert.Title>Error</Alert.Title>
      <Alert.Description>{$query.error.message}</Alert.Description>
    </Alert.Root>
  {/if}

  {#if $query.isSuccess}
    <div class="space-y-6">
      <!-- Desktop View -->
      <div
        class="hidden lg:block border rounded-xl overflow-hidden bg-background shadow-sm"
      >
        <Table>
          <TableHeader class="bg-muted/50">
            <TableRow>
              <TableHead class="w-16 text-center">Avatar</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Review</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $query.data.results as review, i}
              <AdminCRUDRow
                item={review}
                index={i}
                onView={(item) => goto(`/admin/reviews/${item.id}`)}
                onEdit={(item) => goto(`/admin/reviews/${item.id}`)}
                onDelete={openDelete}
              >
                {#snippet columns()}
                  <TableCell class="flex justify-center py-4">
                    <Avatar class="h-10 w-10 border-2 border-muted/20">
                      <AvatarImage
                        src={review.imageUrl}
                        alt={review.name}
                        class="object-cover"
                      />
                      <AvatarFallback
                        >{review.name?.charAt(0) ?? "R"}</AvatarFallback
                      >
                    </Avatar>
                  </TableCell>
                  <TableCell class="font-semibold">{review.name}</TableCell>
                  <TableCell class="text-muted-foreground"
                    >{review.location}</TableCell
                  >
                  <TableCell>
                    <div class="flex items-center gap-1">
                      <Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span class="text-sm font-medium">{review.rating}</span>
                    </div>
                  </TableCell>
                  <TableCell class="text-muted-foreground max-w-xs truncate"
                    >{stripHtml(review.review)}</TableCell
                  >
                {/snippet}
              </AdminCRUDRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {#each $query.data.results as review, i}
          <AdminCRUDCard
            item={review}
            index={i}
            title={review.name}
            description={stripHtml(review.review)}
            onView={(item) => goto(`/admin/reviews/${item.id}`)}
            onEdit={(item) => goto(`/admin/reviews/${item.id}`)}
            onDelete={openDelete}
          />
        {/each}
      </div>

      <!-- Infinite Scroll Sentinel -->
      <div use:sentinel class="py-10 flex justify-center">
        {#if $query.isFetchingNextPage}
          <div class="flex items-center gap-2 text-muted-foreground">
            <Loader2 class="h-6 w-6 animate-spin" />
            <span>Loading more reviews...</span>
          </div>
        {:else if !$query.hasNextPage && $query.data.results.length > 0}
          <p class="text-sm text-muted-foreground italic text-center">
            You've reached the end of the list.
          </p>
        {:else if $query.data.results.length === 0}
          <p class="text-sm text-muted-foreground italic text-center">
            No reviews found matching your criteria.
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if isDeleteDialogOpen && itemToDelete}
    <AdminCRUDDeleteDialog
      item={itemToDelete}
      open={isDeleteDialogOpen}
      title="Delete Review"
      endpoint="/api/review"
      onOpenChange={(open) => (isDeleteDialogOpen = open)}
      onSuccess={() => {
        isDeleteDialogOpen = false;
        $query.refetch();
      }}
    />
  {/if}
</div>

<style>
</style>
