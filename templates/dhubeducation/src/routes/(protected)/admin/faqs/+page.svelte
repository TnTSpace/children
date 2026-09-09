<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { AlertCircleIcon, Loader2, Search, Plus } from "@lucide/svelte";
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
  import type { iFaq } from "$lib/interface";
  import AdminCRUDRow from "$lib/components/admin/AdminCRUDRow.svelte";
  import AdminCRUDCard from "$lib/components/admin/AdminCRUDCard.svelte";
  import AdminCRUDDrawer from "$lib/components/admin/AdminCRUDDrawer.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import FaqDrawerContent from "./components/FaqDrawerContent.svelte";
  import { toast } from "svelte-sonner";

  let searchQuery = $state("");
  const debouncedSearch = new Debounced(() => searchQuery, 500);

  const query = infiniteScroll.listQuery<iFaq>(
    () => ({ search: debouncedSearch.current }),
    page.url.origin,
    "faq",
  );

  let selectedItem = $state<iFaq | null>(null);
  let drawerMode = $state<"view" | "edit" | "create">("view");
  let isDrawerOpen = $state(false);
  let isDeleteDialogOpen = $state(false);
  let itemToDelete = $state<iFaq | null>(null);

  const openDrawer = (item: iFaq | null, mode: "view" | "edit" | "create") => {
    selectedItem = item
      ? { ...item }
      : ({ question: "", answer: "", category: "" } as any);
    drawerMode = mode;
    isDrawerOpen = true;
  };

  const openDelete = (item: iFaq) => {
    itemToDelete = item;
    isDeleteDialogOpen = true;
  };

  const handleSave = async () => {
    try {
      const method = drawerMode === "create" ? "POST" : "PATCH";
      const url =
        drawerMode === "create" ? "/api/faq" : `/api/faq/${selectedItem?.id}`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedItem),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success(
        `FAQ ${drawerMode === "create" ? "created" : "updated"} successfully`,
      );
      isDrawerOpen = false;
      $query.refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save FAQ");
    }
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
        FAQs ({#if $query.isPending}<Loader2
            class="inline h-6 w-6 animate-spin"
          />{:else}{$query?.data?.total ?? 0}{/if})
      </h1>
      <p class="text-muted-foreground mt-1">
        Manage frequently asked questions and categories.
      </p>
    </div>
    <Button
      onclick={() => openDrawer(null, "create")}
      class="rounded-xl shadow-lg"
    >
      <Plus class="mr-2 h-4 w-4" />
      Create FAQ
    </Button>
  </div>

  <div class="flex flex-col items-center gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search FAQs..."
        bind:value={searchQuery}
        class="pl-10 rounded-xl border-muted/20"
      />
    </div>
    <div
      class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar"
    >
      <Button
        variant="outline"
        size="sm"
        class="rounded-full px-4 h-9 border-muted/20">All</Button
      >
      <Button
        variant="ghost"
        size="sm"
        class="rounded-full px-4 h-9 text-muted-foreground hover:text-foreground"
        >Courses</Button
      >
      <Button
        variant="ghost"
        size="sm"
        class="rounded-full px-4 h-9 text-muted-foreground hover:text-foreground"
        >Admission</Button
      >
      <Button
        variant="ghost"
        size="sm"
        class="rounded-full px-4 h-9 text-muted-foreground hover:text-foreground"
        >Partnership</Button
      >
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
              <TableHead>Category</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $query.data.results as faq, i}
              <AdminCRUDRow
                item={faq}
                index={i}
                onView={(item) => openDrawer(item, "view")}
                onEdit={(item) => openDrawer(item, "edit")}
                onDelete={openDelete}
              >
                {#snippet columns()}
                  <TableCell
                    ><span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider"
                      >{faq.category}</span
                    ></TableCell
                  >
                  <TableCell class="font-bold max-w-sm truncate"
                    >{faq.question}</TableCell
                  >
                  <TableCell class="text-muted-foreground"
                    >{new Date(faq.createdAt).toLocaleDateString()}</TableCell
                  >
                {/snippet}
              </AdminCRUDRow>
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {#each $query.data.results as faq, i}
          <AdminCRUDCard
            item={faq}
            index={i}
            title={faq.question}
            description={faq.answer.substring(0, 120) +
              (faq.answer.length > 120 ? "..." : "")}
            onView={(item) => openDrawer(item, "view")}
            onEdit={(item) => openDrawer(item, "edit")}
            onDelete={openDelete}
          >
            {#snippet content()}
              <div class="flex items-center gap-2 mb-2">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider"
                >
                  {faq.category}
                </span>
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
            <span>Loading more FAQs...</span>
          </div>
        {:else if !$query.hasNextPage && $query.data.results.length > 0}
          <p class="text-sm text-muted-foreground italic text-center">
            You've reached the end of the list.
          </p>
        {:else if $query.data.results.length === 0}
          <p class="text-sm text-muted-foreground italic text-center">
            No FAQs found matching your criteria.
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if isDrawerOpen && selectedItem}
    <AdminCRUDDrawer
      bind:open={isDrawerOpen}
      title={drawerMode === "create"
        ? "Create FAQ"
        : drawerMode === "edit"
          ? "Edit FAQ"
          : "View FAQ"}
      mode={drawerMode}
      onOpenChange={(open) => (isDrawerOpen = open)}
      onSave={handleSave}
    >
      <FaqDrawerContent bind:item={selectedItem} mode={drawerMode} />
    </AdminCRUDDrawer>
  {/if}

  {#if isDeleteDialogOpen && itemToDelete}
    <AdminCRUDDeleteDialog
      item={itemToDelete}
      open={isDeleteDialogOpen}
      title="Delete FAQ"
      endpoint="/api/faq"
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
