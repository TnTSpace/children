<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { AlertCircleIcon, Loader2, Search, Plus } from "@lucide/svelte";
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
  import type { iService } from "$lib/interface";
  import AdminCRUDRow from "$lib/components/admin/AdminCRUDRow.svelte";
  import AdminCRUDCard from "$lib/components/admin/AdminCRUDCard.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import { toast } from "svelte-sonner";

  let searchQuery = $state("");
  const debouncedSearch = new Debounced(() => searchQuery, 500);

  const query = infiniteScroll.listQuery<iService>(
    () => ({ search: debouncedSearch.current }),
    page.url.origin,
    "service",
  );

  let isDeleteDialogOpen = $state(false);
  let itemToDelete = $state<iService | null>(null);

  const openDelete = (item: iService) => {
    itemToDelete = item;
    isDeleteDialogOpen = true;
  };

  const { sentinel } = useInfiniteScroll({
    onLoadMore: () => $query.fetchNextPage(),
    disabled: () => !$query.hasNextPage || $query.isFetchingNextPage,
  });
</script>

<div class="flex flex-col gap-6">
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Services ({#if $query.isPending}<Loader2
            class="inline h-6 w-6 animate-spin"
          />{:else}{$query?.data?.total ?? 0}{/if})
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage educational services and consultancy offerings.
      </p>
    </div>
    <Button
      onclick={() => goto("/admin/services/create")}
      class="rounded-xl shadow-lg border-muted/20"
    >
      <Plus class="mr-2 h-4 w-4" />
      Create Service
    </Button>
  </div>

  <div class="flex flex-col items-center gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search services..."
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
              <TableHead class="w-16">S/N</TableHead>
              <TableHead>Service Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $query.data.results as service, i}
              <AdminCRUDRow
                item={service}
                index={i}
                onView={(item) => goto(`/admin/services/${item.id}`)}
                onEdit={(item) => goto(`/admin/services/${item.id}`)}
                onDelete={openDelete}
              >
                {#snippet columns()}
                  <TableCell class="font-semibold">{service.name}</TableCell>
                  <TableCell class="text-muted-foreground"
                    >{new Date(
                      service.createdAt,
                    ).toLocaleDateString()}</TableCell
                  >
                {/snippet}
              </AdminCRUDRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {#each $query.data.results as service, i}
          <AdminCRUDCard
            item={service}
            index={i}
            title={service.name}
            description={service.description}
            onView={(item) => goto(`/admin/services/${item.id}`)}
            onEdit={(item) => goto(`/admin/services/${item.id}`)}
            onDelete={openDelete}
          />
        {/each}
      </div>

      <!-- Infinite Scroll Sentinel -->
      <div use:sentinel class="py-10 flex justify-center">
        {#if $query.isFetchingNextPage}
          <div class="flex items-center gap-2 text-muted-foreground">
            <Loader2 class="h-6 w-6 animate-spin" />
            <span>Loading more services...</span>
          </div>
        {:else if !$query.hasNextPage && $query.data.results.length > 0}
          <p class="text-sm text-muted-foreground italic text-center">
            You've reached the end of the list.
          </p>
        {:else if $query.data.results.length === 0}
          <p class="text-sm text-muted-foreground italic text-center">
            No services found matching your criteria.
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if isDeleteDialogOpen && itemToDelete}
    <AdminCRUDDeleteDialog
      item={itemToDelete}
      open={isDeleteDialogOpen}
      title="Delete Service"
      endpoint="/api/service"
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
