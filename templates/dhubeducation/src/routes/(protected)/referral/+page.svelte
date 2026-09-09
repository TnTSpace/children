<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Table from "$lib/components/ui/table";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Users,
    UserPlus,
    Trophy,
    Share2,
    Search,
    Loader2,
    CheckCircle2,
    Clipboard,
    Pencil,
    Trash2,
    Wallet,
    Building2,
    Eye,
    FileText,
    CreditCard
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";
  import SelectComponent from "$lib/components/ui/select/select-component.svelte";

  let { data } = $props();
  let isAdding = $state(false);
  let isJoining = $state(false);
  let searchQuery = $state("");
  
  let showAddModal = $state(false);
  let showEditModal = $state(false);
  let showDeleteModal = $state(false);
  let showProfileModal = $state(false);
  
  let editingReferee = $state<any>(null);
  let deletingReferee = $state<any>(null);
  
  let isEditing = $state(false);
  let isDeleting = $state(false);
  let isUpdatingProfile = $state(false);

  // --- Mobile Detection ---
  let isMobile = $state(false);
  function checkMobile() {
    isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  }
  $effect(() => {
    checkMobile();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  });

  // --- Receipt Preview ---
  let previewOpen = $state(false);
  let previewUrl = $state("");
  let previewTitle = $state("");

  function openReceipt(url: string, name: string) {
    previewUrl = url;
    previewTitle = `Payment Receipt - ${name}`;
    previewOpen = true;
  }

  const filteredReferees = $derived(
    data.referees.filter((r: any) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const successfulReferrals = $derived(
    data.referees.filter((r: any) => {
      if (!r.data) return false;
      try {
        return JSON.parse(r.data).status === 'admitted';
      } catch { return false; }
    })
  );

  const totalEarnings = $derived(
    successfulReferrals.reduce((acc: number, r: any) => {
      try {
        const d = r.data ? JSON.parse(r.data) : {};
        return acc + (Number(d.rewardAmount) || 0);
      } catch { return acc; }
    }, 0)
  );

  function copyReferralCode() {
    if (data.referral) {
      navigator.clipboard.writeText(data.referral.id);
      toast.success("Referral code copied!");
    }
  }

  const genders = [
    { value: 'male', label: 'Male' }, 
    { value: 'female', label: 'Female' }
  ];
</script>

<Metatag title="Referral Program" />

<!-- Receipt Preview Modal/Drawer -->
{#if !isMobile}
  <Dialog.Root bind:open={previewOpen}>
    <Dialog.Content class="max-w-4xl w-[90vw] h-[85vh] p-0 overflow-hidden rounded-xl">
      <Dialog.Header class="px-6 py-4 border-b bg-muted/30">
        <Dialog.Title class="flex items-center gap-2">
          <FileText class="size-4 text-primary" />
          {previewTitle}
        </Dialog.Title>
      </Dialog.Header>
      <div class="flex-1 h-full bg-muted/5 flex items-center justify-center p-4">
        {#if previewOpen && previewUrl}
          <iframe
            src={previewUrl}
            title={previewTitle}
            class="w-full h-full border-0 rounded-lg bg-background shadow-lg"
          ></iframe>
        {/if}
      </div>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open={previewOpen}>
    <Drawer.Content class="h-[95vh] rounded-t-xl">
      <Drawer.Header class="border-b px-4">
        <Drawer.Title class="flex items-center gap-2">
          <FileText class="size-4 text-primary" />
          {previewTitle}
        </Drawer.Title>
      </Drawer.Header>
      <div class="flex-1 p-4 bg-muted/5 flex items-center justify-center">
        {#if previewOpen && previewUrl}
          <iframe
            src={previewUrl}
            title={previewTitle}
            class="w-full h-full border-0 rounded-lg bg-background shadow-lg"
            style="min-height: calc(95vh - 120px)"
          ></iframe>
        {/if}
      </div>
    </Drawer.Content>
  </Drawer.Root>
{/if}

<div class="w-full space-y-8 pb-12">
  <!-- Hero Section -->
  <div class="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-primary/10 p-8 md:p-12 shadow-lg">
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
      <div class="space-y-4 max-w-2xl">
        <Badge variant="outline" class="bg-primary/10 text-primary border-primary/20 px-3 py-1">
          Refer & Earn
        </Badge>
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">
          Refer Friends, Support Dreams
        </h1>
        <p class="text-lg text-muted-foreground leading-relaxed">
          Help your friends achieve their global education goals.
        </p>
      </div>

      {#if !data.referral}
        <form
          method="POST"
          action="?/join"
          use:enhance={() => {
            isJoining = true;
            return async ({ update }) => {
              isJoining = false;
              await update();
              toast.success("Welcome to the Referral Program!");
            };
          }}
        >
          <Button
            type="submit"
            disabled={isJoining}
            class="shadow-lg shadow-primary/20 gap-2 rounded-xl"
          >
            {#if isJoining}
              <Loader2 class="size-5 animate-spin" />
              Joining...
            {:else}
              <Trophy class="size-5" />
              Join Program
            {/if}
          </Button>
        </form>
      {:else}
        <div class="flex flex-col gap-4 w-full md:w-auto">
          <Card.Root class="bg-background/50 backdrop-blur-sm border-primary/20 shadow-md">
            <Card.Content class="p-6 space-y-4">
              <div class="flex items-center justify-between gap-4">
                <div>
                  <p class="text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Referral ID</p>
                  <p class="text-xl font-mono font-bold text-primary">{data.referral.id.split('-')[0]}</p>
                </div>
                <Button variant="ghost" size="icon" onclick={copyReferralCode}>
                  <Clipboard class="size-4" />
                </Button>
              </div>
              <div class="flex flex-col gap-2">
                <Button class="w-full gap-2 rounded-xl" onclick={() => (showAddModal = true)}>
                  <UserPlus class="size-4" />
                  Add Referee
                </Button>
                <Button variant="outline" class="w-full gap-2 rounded-xl" onclick={() => (showProfileModal = true)}>
                  <Building2 class="size-4" />
                  Update Bank Details
                </Button>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      {/if}
    </div>

    <!-- Decorative Element -->
    <div class="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
      <Share2 class="size-64 text-primary rotate-12" />
    </div>
  </div>

  {#if data.referral}
    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card.Root class="rounded-xl shadow-sm border-primary/10">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title class="text-sm font-medium">Total Referrals</Card.Title>
          <Users class="size-4 text-primary" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{data.referees.length}</div>
          <p class="text-xs text-muted-foreground">Friends referred so far</p>
        </Card.Content>
      </Card.Root>

      <Card.Root class="rounded-xl shadow-sm border-primary/10">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title class="text-sm font-medium">Successful</Card.Title>
          <CheckCircle2 class="size-4 text-emerald-500" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{successfulReferrals.length}</div>
          <p class="text-xs text-muted-foreground">Successful admissions</p>
        </Card.Content>
      </Card.Root>

      <Card.Root class="rounded-xl shadow-sm border-primary/10 bg-primary/5 border-primary/20">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title class="text-sm font-medium">Total Earnings</Card.Title>
          <Wallet class="size-4 text-primary" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold text-primary">£{totalEarnings}</div>
          <p class="text-xs text-muted-foreground">Earned from admissions</p>
        </Card.Content>
      </Card.Root>

      <Card.Root class="rounded-xl shadow-sm border-primary/10">
        <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title class="text-sm font-medium">In Progress</Card.Title>
          <Loader2 class="size-4 text-amber-500" />
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">
            {data.referees.filter((r: any) => {
              try { return !r.data || JSON.parse(r.data).status === 'pending'; }
              catch { return true; }
            }).length}
          </div>
          <p class="text-xs text-muted-foreground">Awaiting status</p>
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Referrals Table -->
    <Card.Root class="rounded-xl shadow-md border-primary/5 overflow-hidden">
      <Card.Header class="border-b bg-muted/20">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Card.Title class="text-xl font-bold flex items-center gap-2">
              <Clipboard class="size-5 text-primary" />
              Referral History
            </Card.Title>
            <Card.Description>Manage and track your referred friends</Card.Description>
          </div>
          <div class="relative w-full md:w-64">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search referrals..."
              class="pl-9 bg-background"
              bind:value={searchQuery}
            />
          </div>
        </div>
      </Card.Header>
      <Card.Content class="p-0 overflow-x-auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.Head class="w-[50px]">#</Table.Head>
              <Table.Head>Referee</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head>Reward</Table.Head>
              <Table.Head>Added On</Table.Head>
              <Table.Head class="text-right">Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each filteredReferees as referee, i}
              {@const refereeData = referee.data ? JSON.parse(referee.data) : {}}
              {@const status = refereeData.status || 'pending'}
              <Table.Row class="hover:bg-muted/30 transition-colors">
                <Table.Cell class="font-medium text-muted-foreground">{i + 1}</Table.Cell>
                <Table.Cell>
                  <div class="flex flex-col">
                    <span class="font-bold">{referee.name}</span>
                    <span class="text-xs text-muted-foreground">{referee.email}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant="outline"
                    class={status === 'admitted'
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {#if refereeData.rewardAmount}
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-emerald-600">£{refereeData.rewardAmount}</span>
                      {#if refereeData.paymentStatus === 'paid'}
                        <Badge class="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5 py-0">Paid</Badge>
                      {/if}
                    </div>
                  {:else if status === 'admitted'}
                    <span class="text-xs text-muted-foreground italic">Pending Payment</span>
                  {:else}
                    <span class="text-muted-foreground italic text-sm">Waiting</span>
                  {/if}
                </Table.Cell>
                <Table.Cell class="text-muted-foreground text-sm">
                  {new Date(referee.createdAt).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell class="text-right">
                  <div class="flex items-center justify-end gap-1">
                    {#if refereeData.receiptUrl}
                      <Button
                        variant="ghost"
                        size="icon"
                        class="size-8 rounded-lg hover:bg-emerald-500/10 text-emerald-600"
                        onclick={() => openReceipt(refereeData.receiptUrl, referee.name)}
                        title="View Payment Receipt"
                      >
                        <Eye class="size-4" />
                      </Button>
                    {/if}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      class="size-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                      onclick={() => {
                        editingReferee = { ...referee };
                        showEditModal = true;
                      }}
                    >
                      <Pencil class="size-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      class="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                      onclick={() => {
                        deletingReferee = referee;
                        showDeleteModal = true;
                      }}
                    >
                      <Trash2 class="size-4" />
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            {:else}
              <Table.Row>
                <Table.Cell colspan={6} class="h-32 text-center text-muted-foreground">
                  {searchQuery ? "No referrals match your search." : "You haven't referred anyone yet."}
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body>
        </Table.Root>
      </Card.Content>
    </Card.Root>
  {/if}
</div>

<!-- Bank Details Modal/Drawer -->
{#if !isMobile}
  <Dialog.Root bind:open={showProfileModal}>
    <Dialog.Content class="sm:max-w-[500px] rounded-xl">
      <Dialog.Header>
        <Dialog.Title class="text-2xl font-bold flex items-center gap-2">
          <Building2 class="size-6 text-primary" />
          Bank Details
        </Dialog.Title>
        <Dialog.Description>
          Provide your bank account details where you'd like to receive your referral rewards.
        </Dialog.Description>
      </Dialog.Header>
      <form
        method="POST"
        action="?/updateProfile"
        class="space-y-4 py-4"
        use:enhance={() => {
          isUpdatingProfile = true;
          return async ({ result, update }) => {
            isUpdatingProfile = false;
            if (result.type === 'success') {
              showProfileModal = false;
              toast.success("Profile updated successfully!");
              await update();
            } else {
              toast.error("Failed to update profile");
            }
          };
        }}
      >
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="accountName">Account Holder Name</Label>
            <Input id="accountName" name="accountName" value={data.bankDetails?.accountName} placeholder="Full name on account" required />
          </div>
          <div class="grid gap-2">
            <Label for="accountNumber">Account Number</Label>
            <Input id="accountNumber" name="accountNumber" value={data.bankDetails?.accountNumber} placeholder="8-digit account number" required />
          </div>
          <div class="grid gap-2">
            <Label for="bankName">Bank Name</Label>
            <Input id="bankName" name="bankName" value={data.bankDetails?.bankName} placeholder="e.g. HSBC, Barclays" required />
          </div>
          <div class="grid gap-2">
            <Label for="sortCode">Sort Code</Label>
            <Input id="sortCode" name="sortCode" value={data.bankDetails?.sortCode} placeholder="XX-XX-XX" required />
          </div>
        </div>
        <Dialog.Footer class="pt-4">
          <Button type="submit" disabled={isUpdatingProfile} class="w-full rounded-xl">
            {#if isUpdatingProfile}
              <Loader2 class="size-4 animate-spin mr-2" />
              Saving...
            {:else}
              Save Bank Details
            {/if}
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>
{:else}
  <Drawer.Root bind:open={showProfileModal}>
    <Drawer.Content class="rounded-t-xl">
      <Drawer.Header class="px-4">
        <Drawer.Title class="text-2xl font-bold flex items-center gap-2">
          <Building2 class="size-6 text-primary" />
          Bank Details
        </Drawer.Title>
        <Drawer.Description>
          Receive your referral rewards in this account.
        </Drawer.Description>
      </Drawer.Header>
      <form
        method="POST"
        action="?/updateProfile"
        class="space-y-4 px-4 pb-8 pt-4"
        use:enhance={() => {
          isUpdatingProfile = true;
          return async ({ result, update }) => {
            isUpdatingProfile = false;
            if (result.type === 'success') {
              showProfileModal = false;
              toast.success("Profile updated successfully!");
              await update();
            } else {
              toast.error("Failed to update profile");
            }
          };
        }}
      >
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="m-accountName">Account Holder Name</Label>
            <Input id="m-accountName" name="accountName" value={data.bankDetails?.accountName} required />
          </div>
          <div class="grid gap-2">
            <Label for="m-accountNumber">Account Number</Label>
            <Input id="m-accountNumber" name="accountNumber" value={data.bankDetails?.accountNumber} required />
          </div>
          <div class="grid gap-2">
            <Label for="m-bankName">Bank Name</Label>
            <Input id="m-bankName" name="bankName" value={data.bankDetails?.bankName} required />
          </div>
          <div class="grid gap-2">
            <Label for="m-sortCode">Sort Code</Label>
            <Input id="m-sortCode" name="sortCode" value={data.bankDetails?.sortCode} required />
          </div>
        </div>
        <Button type="submit" disabled={isUpdatingProfile} class="w-full rounded-xl mt-4">
          {#if isUpdatingProfile}
            <Loader2 class="size-4 animate-spin mr-2" />
            Saving...
          {:else}
            Save Bank Details
          {/if}
        </Button>
      </form>
    </Drawer.Content>
  </Drawer.Root>
{/if}

<!-- Add Referee Modal -->
<Dialog.Root bind:open={showAddModal}>
  <Dialog.Content class="sm:max-w-[425px] rounded-xl">
    <Dialog.Header>
      <Dialog.Title class="text-2xl font-bold">Add a Friend</Dialog.Title>
      <Dialog.Description>
        Enter your friend's details below.
      </Dialog.Description>
    </Dialog.Header>
    <form
      method="POST"
      action="?/addReferee"
      class="space-y-4 py-4"
      use:enhance={() => {
        isAdding = true;
        return async ({ result, update }) => {
          isAdding = false;
          if (result.type === 'success') {
            showAddModal = false;
            toast.success("Referee added successfully!");
            await update();
          } else if (result.type === 'failure') {
            const message = result.data?.message;
            toast.error(typeof message === 'string' ? message : "Failed to add referee");
          }
        };
      }}
    >
      <div class="grid gap-2">
        <Label for="name">Full Name</Label>
        <Input id="name" name="name" placeholder="John Doe" required />
      </div>
      <div class="grid gap-2">
        <Label for="email">Email Address</Label>
        <Input id="email" name="email" type="email" placeholder="john@example.com" required />
      </div>
      <div class="grid gap-2">
        <Label for="phone">Phone Number (Optional)</Label>
        <Input id="phone" name="phone" placeholder="+234..." />
      </div>
      <div class="grid gap-2">
        <Label for="gender">Gender (Optional)</Label>
        <SelectComponent name="gender" placeholder="Select gender" options={genders} />
      </div>
      <Dialog.Footer class="pt-4">
        <Button type="submit" disabled={isAdding} class="w-full rounded-xl">
          {#if isAdding}
            <Loader2 class="size-4 animate-spin mr-2" />
            Adding...
          {:else}
            Add Friend
          {/if}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>

<!-- Edit Referee Modal -->
<Dialog.Root bind:open={showEditModal}>
  <Dialog.Content class="sm:max-w-[425px] rounded-xl">
    <Dialog.Header>
      <Dialog.Title>Edit Referee</Dialog.Title>
      <Dialog.Description>
        Update your friend's information.
      </Dialog.Description>
    </Dialog.Header>
    {#if editingReferee}
      <form
        method="POST"
        action="?/updateReferee"
        class="space-y-4 py-4"
        use:enhance={() => {
          isEditing = true;
          return async ({ result, update }) => {
            isEditing = false;
            if (result.type === 'success') {
              showEditModal = false;
              toast.success("Referee updated successfully!");
              await update();
            } else if (result.type === 'failure') {
              const message = result.data?.message;
              toast.error(typeof message === 'string' ? message : "Failed to update referee");
            }
          };
        }}
      >
        <input type="hidden" name="id" value={editingReferee.id} />
        <div class="grid gap-2">
          <Label for="edit-name">Full Name</Label>
          <Input id="edit-name" name="name" bind:value={editingReferee.name} placeholder="John Doe" required />
        </div>
        <div class="grid gap-2">
          <Label for="edit-email">Email Address</Label>
          <Input id="edit-email" name="email" type="email" bind:value={editingReferee.email} placeholder="john@example.com" required />
        </div>
        <div class="grid gap-2">
          <Label for="edit-phone">Phone Number (Optional)</Label>
          <Input id="edit-phone" name="phone" bind:value={editingReferee.phone} placeholder="+234..." />
        </div>
        <div class="grid gap-2">
          <Label for="edit-gender">Gender (Optional)</Label>
          <SelectComponent 
            name="gender" 
            placeholder="Select gender" 
            value={editingReferee.gender}
            options={genders} 
          />
        </div>
        <Dialog.Footer class="pt-4">
          <Button type="submit" disabled={isEditing} class="w-full rounded-xl">
            {#if isEditing}
              <Loader2 class="size-4 animate-spin mr-2" />
              Saving...
            {:else}
              Save Changes
            {/if}
          </Button>
        </Dialog.Footer>
      </form>
    {/if}
  </Dialog.Content>
</Dialog.Root>

<!-- Delete Referee Confirmation -->
<AlertDialog.Root bind:open={showDeleteModal}>
  <AlertDialog.Content class="rounded-xl">
    <AlertDialog.Header>
      <AlertDialog.Title>Are you sure?</AlertDialog.Title>
      <AlertDialog.Description>
        This will permanently remove <b>{deletingReferee?.name}</b> from your referrals. This action cannot be undone.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel class="rounded-xl">Cancel</AlertDialog.Cancel>
      <form
        method="POST"
        action="?/deleteReferee"
        use:enhance={() => {
          isDeleting = true;
          return async ({ result, update }) => {
            isDeleting = false;
            if (result.type === 'success') {
              showDeleteModal = false;
              toast.success("Referee deleted successfully");
              await update();
            } else if (result.type === 'failure') {
              toast.error("Failed to delete referee");
            }
          };
        }}
      >
        <input type="hidden" name="id" value={deletingReferee?.id} />
        <Button type="submit" variant="destructive" disabled={isDeleting} class="rounded-xl w-full sm:w-auto">
          {#if isDeleting}
            <Loader2 class="size-4 animate-spin mr-2" />
            Deleting...
          {:else}
            Delete
          {/if}
        </Button>
      </form>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
