<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    AlertCircleIcon,
    Loader2,
    Search,
    Plus,
    Image as ImageIcon,
  } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import { page } from "$app/state";
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
  import type { iCampaign } from "$lib/interface";
  import AdminCRUDRow from "$lib/components/admin/AdminCRUDRow.svelte";
  import AdminCRUDCard from "$lib/components/admin/AdminCRUDCard.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import { goto } from "$app/navigation";

  let searchQuery = $state("");
  const debouncedSearch = new Debounced(() => searchQuery, 500);

  const query = infiniteScroll.listQuery<iCampaign>(
    () => ({ search: debouncedSearch.current }),
    page.url.origin,
    "campaign",
  );

  let isDeleteDialogOpen = $state(false);
  let itemToDelete = $state<iCampaign | null>(null);

  const openDelete = (item: iCampaign) => {
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
        Campaigns ({#if $query.isPending}<Loader2
            class="inline h-6 w-6 animate-spin"
          />{:else}{$query?.data?.total ?? 0}{/if})
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage marketing campaigns and promotions.
      </p>
    </div>
    <Button
      onclick={() => goto("/admin/campaigns/new")}
      class="rounded-xl shadow-lg bg-primary hover:shadow-primary/20 transition-all"
    >
      <Plus class="mr-2 h-5 w-5" />
      Create Campaign
    </Button>
  </div>

  <div class="flex flex-col items-center gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search campaigns..."
        bind:value={searchQuery}
        class="pl-10 rounded-xl h-11 border-muted/20"
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
        class="hidden lg:block border rounded-xl overflow-hidden bg-background shadow-lg border-muted/20"
      >
        <Table>
          <TableHeader class="bg-muted/50 border-b">
            <TableRow>
              <TableHead class="w-16">S/N</TableHead>
              <TableHead>Preview</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $query.data.results as campaign, i}
              <AdminCRUDRow
                item={campaign}
                index={i}
                onView={(item) => goto(`/admin/campaigns/${item.id}`)}
                onEdit={(item) => goto(`/admin/campaigns/${item.id}`)}
                onDelete={openDelete}
              >
                {#snippet columns()}
                  <TableCell>
                    <div
                      class="h-10 w-16 rounded-md overflow-hidden bg-muted/50 border border-muted/30 shadow-sm"
                    >
                      {#if campaign.imageUrl}
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          class="h-full w-full object-cover"
                        />
                      {:else}
                        <div
                          class="h-full w-full flex items-center justify-center"
                        >
                          <ImageIcon class="size-4 text-muted-foreground/40" />
                        </div>
                      {/if}
                    </div>
                  </TableCell>
                  <TableCell class="font-bold">{campaign.title}</TableCell>
                  <TableCell class="text-muted-foreground"
                    >{campaign.startDate
                      ? new Date(campaign.startDate).toLocaleDateString()
                      : "N/A"}</TableCell
                  >
                  <TableCell class="text-muted-foreground"
                    >{campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : "Present"}</TableCell
                  >
                {/snippet}
              </AdminCRUDRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {#each $query.data.results as campaign, i}
          <AdminCRUDCard
            item={campaign}
            index={i}
            title={campaign.title}
            description={campaign.description}
            onView={(item) => goto(`/admin/campaigns/${item.id}`)}
            onEdit={(item) => goto(`/admin/campaigns/${item.id}`)}
            onDelete={openDelete}
          >
            {#snippet content()}
              {#if campaign.imageUrl}
                <div
                  class="aspect-video w-full rounded-lg overflow-hidden border mb-2 shadow-sm"
                >
                  <img
                    src={campaign.imageUrl}
                    alt={campaign.title}
                    class="h-full w-full object-cover"
                  />
                </div>
              {/if}
              <div
                class="flex items-center justify-between text-xs text-muted-foreground"
              >
                <span
                  >Start: {campaign.startDate
                    ? new Date(campaign.startDate).toLocaleDateString()
                    : "N/A"}</span
                >
                <span
                  >End: {campaign.endDate
                    ? new Date(campaign.endDate).toLocaleDateString()
                    : "Present"}</span
                >
              </div>
            {/snippet}
          </AdminCRUDCard>
        {/each}
      </div>

      <!-- Infinite Scroll Sentinel -->
      <div use:sentinel class="py-10 flex justify-center">
        {#if $query.isFetchingNextPage}
          <div class="flex items-center gap-2 text-muted-foreground">
            <Loader2 class="h-6 w-6 animate-spin" />
            <span>Loading more campaigns...</span>
          </div>
        {:else if !$query.hasNextPage && $query.data.results.length > 0}
          <p class="text-sm text-muted-foreground italic text-center">
            You've reached the end of the list.
          </p>
        {:else if $query.data.results.length === 0}
          <p class="text-sm text-muted-foreground italic text-center">
            No campaigns found matching your criteria.
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if isDeleteDialogOpen && itemToDelete}
    <AdminCRUDDeleteDialog
      item={itemToDelete}
      open={isDeleteDialogOpen}
      title="Delete Campaign"
      endpoint="/api/campaign"
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
