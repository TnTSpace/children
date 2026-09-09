<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { AlertCircleIcon, Loader2, Search } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input/index.js";
  import EditDialog from "./components/EditDialog.svelte";
  import DeleteDialog from "./components/DeleteDialog.svelte";
  import { page } from "$app/state";
  import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
  } from "$lib/components/ui/table/index.js";
  import ListCard from "./components/ListCard.svelte";
  import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte.js";
  import { Debounced } from "runed";
  import * as Alert from "$lib/components/ui/alert/index.js";
  import type { User } from "$lib/auth.js";

  let editingUser = $state<User | null>(null);
  let deletingUser = $state<User | null>(null);

  const onEdit = async (user: User) => (editingUser = user);
  const onDelete = async (user: User) => (deletingUser = user);

  let handleInput = $state("");
  const debouncedHandle = new Debounced(() => handleInput, 500);

  const query = infiniteScroll.listQuery<User>(
    () => ({ search: debouncedHandle.current }),
    page.url.origin,
    "users",
  );
</script>

<div class="flex flex-col gap-6">
  <div
    class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <h1 class="text-3xl font-bold tracking-tight">
        Users ({#if $query.isPending}<Loader2
            class="inline h-6 w-6 animate-spin"
          />{:else}{$query?.data?.total ?? 0}{/if})
      </h1>
      <p class="mt-1 text-muted-foreground">
        Manage administrative and student users.
      </p>
    </div>
  </div>

  <div class="flex flex-col items-center gap-4 md:flex-row">
    <div class="relative w-full sm:max-w-md">
      <Search
        class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground"
      />
      <Input
        placeholder="Search users..."
        bind:value={handleInput}
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
        class="hidden lg:block border rounded-xl overflow-hidden bg-background shadow-lg border-muted/20"
      >
        <Table>
          <TableHeader class="bg-muted/50 border-b">
            <TableRow>
              <TableHead class="w-16">S/N</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each $query.data.results as user, i}
              <ListCard onDelete={() => onDelete(user)} screen="desktop" {i} {user} />
            {/each}
          </TableBody>
        </Table>
      </div>

      <!-- Mobile View -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {#each $query.data.results as user, i}
          <ListCard onDelete={() => onDelete(user)} screen="mobile" {i} {user} />
        {/each}
      </div>

      <!-- Pagination/More -->
      <div class="flex justify-center py-10">
        {#if $query.isFetching || $query.isFetchingNextPage}
          <div class="flex items-center gap-2 text-muted-foreground">
            <Loader2 class="h-6 w-6 animate-spin" />
            <span>Loading more...</span>
          </div>
        {:else if $query.hasNextPage}
          <Button
            variant="outline"
            class="rounded-full px-8"
            onclick={() => $query.fetchNextPage()}
          >
            Load More Users
          </Button>
        {:else if $query.data.results.length === 0}
          <p class="text-sm italic text-muted-foreground">
            No users found matching your criteria.
          </p>
        {:else}
          <p class="text-sm italic text-muted-foreground">
            You've reached the end of the user list.
          </p>
        {/if}
      </div>
    </div>
  {/if}

  {#if editingUser}
    <EditDialog
      user={editingUser}
      open={!!editingUser}
      onOpenChange={(open) => !open && (editingUser = null)}
    />
  {/if}

  {#if deletingUser}
    <DeleteDialog
      user={deletingUser}
      open={!!deletingUser}
      onOpenChange={(open) => !open && (deletingUser = null)}
    />
  {/if}
</div>

<style>
</style>
