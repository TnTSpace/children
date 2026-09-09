<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Table from "$lib/components/ui/table";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Drawer from "$lib/components/ui/drawer";
  import { Badge } from "$lib/components/ui/badge";
  import {
    Users,
    UserPlus,
    Search,
    Loader2,
    Trash2,
    ExternalLink,
    Clipboard,
    FileText,
    Wallet,
    CheckCircle2,
    Eye,
    Upload,
    CreditCard,
    Settings,
    Building2
  } from "@lucide/svelte";
  import { toast } from "svelte-sonner";
  import Metatag from "$lib/components/ui/seo/Metatag.svelte";

  let { data } = $props();
  let rSearch = $state("");
  let refSearch = $state("");
  let isUpdatingReward = $state(false);
  let editRewardOpen = $state(false);
  let rewardMinInput = $state(String(data.rewardMin));
  let rewardMaxInput = $state(String(data.rewardMax));

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

  // --- Receipt Upload ---
  let uploadingRefereeId = $state<string | null>(null);
  let uploadProgress = $state(0);
  let uploadRewardOpen = $state(false);
  let uploadRewardAmount = $state("");
  let pendingFile = $state<File | null>(null);
  let pendingRefereeId = $state<string | null>(null);

  async function uploadReceipt(refereeId: string, file: File, rewardAmount: string) {
    uploadingRefereeId = refereeId;
    uploadProgress = 0;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("refereeId", refereeId);
    formData.append("rewardAmount", rewardAmount);

    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/referral/receipt/upload");

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener("load", () => {
        uploadingRefereeId = null;
        uploadProgress = 0;
        if (xhr.status === 200) {
          toast.success("Receipt uploaded successfully!");
          // Reload to see changes
          window.location.reload();
        } else {
          const err = JSON.parse(xhr.responseText);
          toast.error(err.error || "Upload failed");
        }
        resolve();
      });

      xhr.addEventListener("error", () => {
        uploadingRefereeId = null;
        uploadProgress = 0;
        toast.error("Upload failed. Please try again.");
        reject(new Error("Upload failed"));
      });

      xhr.send(formData);
    });
  }

  function handleFileSelect(refereeId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return;
      }
      pendingFile = file;
      pendingRefereeId = refereeId;
      uploadRewardAmount = String(data.rewardMin); // Default to min
      uploadRewardOpen = true;
    }
  }

  function confirmUpload() {
    if (pendingRefereeId && pendingFile && uploadRewardAmount) {
      uploadReceipt(pendingRefereeId, pendingFile, uploadRewardAmount);
      uploadRewardOpen = false;
      pendingFile = null;
      pendingRefereeId = null;
    }
  }

  // --- Receipt Preview ---
  let previewOpen = $state(false);
  let previewUrl = $state("");
  let previewTitle = $state("");

  function openReceipt(url: string, name: string) {
    previewUrl = url;
    previewTitle = `Payment Receipt - ${name}`;
    previewOpen = true;
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  }

  // Stats
  const totalAmbassadors = $derived(data.referrals.total);
  const totalLeads = $derived(data.referees.total);
  const admittedLeads = $derived(
    data.referees.data.filter((r: any) => {
      try { return r.data && JSON.parse(r.data).status === 'admitted'; }
      catch { return false; }
    }).length
  );
  const paidLeads = $derived(
    data.referees.data.filter((r: any) => {
      try { return r.data && JSON.parse(r.data).paymentStatus === 'paid'; }
      catch { return false; }
    }).length
  );
</script>

<Metatag title="Referral Management | Admin" />

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

<div class="w-full space-y-8">
  <!-- Header -->
  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Referral Management</h1>
      <p class="text-muted-foreground">Manage ambassadors, leads, and program rewards.</p>
    </div>
    <div class="flex items-center gap-2">
      <Button variant="outline" href="/referral-program" target="_blank">
        <ExternalLink class="size-4 mr-2" />
        View Landing Page
      </Button>
    </div>
  </div>

  <!-- Stats Row -->
  <div class="grid gap-4 grid-cols-2 md:grid-cols-4">
    <Card.Root class="rounded-xl shadow-sm">
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Ambassadors</Card.Title>
        <Users class="size-4 text-primary" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{totalAmbassadors}</div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-xl shadow-sm">
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Total Leads</Card.Title>
        <UserPlus class="size-4 text-primary" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{totalLeads}</div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-xl shadow-sm">
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Admitted</Card.Title>
        <CheckCircle2 class="size-4 text-emerald-500" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">{admittedLeads}</div>
      </Card.Content>
    </Card.Root>
    <Card.Root class="rounded-xl shadow-sm bg-primary/5 border-primary/20">
      <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
        <Card.Title class="text-sm font-medium">Reward Rate</Card.Title>
        <Wallet class="size-4 text-primary" />
      </Card.Header>
      <Card.Content>
        <div class="flex items-center gap-2">
          <span class="text-2xl font-bold text-primary">£{data.rewardMin} - £{data.rewardMax}</span>
          <Button variant="ghost" size="icon" class="size-7 rounded-lg" onclick={() => { editRewardOpen = true; rewardMinInput = String(data.rewardMin); rewardMaxInput = String(data.rewardMax); }}>
            <Settings class="size-3.5" />
          </Button>
        </div>
      </Card.Content>
    </Card.Root>
  </div>

  <!-- Reward Amount Edit Dialog -->
  <Dialog.Root bind:open={editRewardOpen}>
    <Dialog.Content class="sm:max-w-[380px] rounded-xl">
      <Dialog.Header>
        <Dialog.Title class="flex items-center gap-2">
          <Wallet class="size-5 text-primary" />
          Edit Reward Range
        </Dialog.Title>
        <Dialog.Description>
          Set the reward range (£) paid per successful admission referral.
        </Dialog.Description>
      </Dialog.Header>
      <form
        method="POST"
        action="?/updateRewardAmount"
        class="space-y-4 py-4"
        use:enhance={() => {
          isUpdatingReward = true;
          return async ({ result, update }) => {
            isUpdatingReward = false;
            if (result.type === 'success') {
              editRewardOpen = false;
              toast.success("Reward amount updated!");
              await update();
            } else {
              toast.error("Failed to update reward amount");
            }
          };
        }}
      >
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="reward-min">Minimum Reward (£)</Label>
            <Input
              id="reward-min"
              name="minAmount"
              type="number"
              min="1"
              bind:value={rewardMinInput}
              required
            />
          </div>
          <div class="grid gap-2">
            <Label for="reward-max">Maximum Reward (£)</Label>
            <Input
              id="reward-max"
              name="maxAmount"
              type="number"
              min="1"
              bind:value={rewardMaxInput}
              required
            />
          </div>
        </div>
        <Dialog.Footer>
          <Button type="submit" disabled={isUpdatingReward} class="w-full rounded-xl">
            {#if isUpdatingReward}
              <Loader2 class="size-4 animate-spin mr-2" />
              Saving...
            {:else}
              Save Range
            {/if}
          </Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Exact Reward Upload Dialog -->
  <Dialog.Root bind:open={uploadRewardOpen}>
    <Dialog.Content class="sm:max-w-[380px] rounded-xl">
      <Dialog.Header>
        <Dialog.Title class="flex items-center gap-2">
          <CreditCard class="size-5 text-primary" />
          Specify Reward Amount
        </Dialog.Title>
        <Dialog.Description>
          Enter the exact amount paid for this referral before uploading the receipt.
        </Dialog.Description>
      </Dialog.Header>
      <div class="space-y-4 py-4">
        <div class="grid gap-2">
          <Label for="exact-reward">Exact Reward Amount (£)</Label>
          <Input
            id="exact-reward"
            type="number"
            min="0"
            bind:value={uploadRewardAmount}
            placeholder="e.g. 250"
          />
          <p class="text-[10px] text-muted-foreground italic">
            Current range: £{data.rewardMin} - £{data.rewardMax}
          </p>
        </div>
      </div>
      <Dialog.Footer>
        <Button variant="outline" onclick={() => uploadRewardOpen = false}>Cancel</Button>
        <Button onclick={confirmUpload} class="rounded-xl">Confirm & Upload</Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Tabs -->
  <Tabs.Root value="referrals" class="space-y-6">
    <Tabs.List class="grid w-full grid-cols-2 lg:w-[300px]">
      <Tabs.Trigger value="referrals">Ambassadors</Tabs.Trigger>
      <Tabs.Trigger value="referees">Leads</Tabs.Trigger>
    </Tabs.List>

    <!-- Ambassadors Tab -->
    <Tabs.Content value="referrals" class="space-y-4">
      <Card.Root class="rounded-xl shadow-md overflow-hidden">
        <Card.Header class="border-b bg-muted/20">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Card.Title class="font-bold flex items-center gap-2">
                <Users class="size-5 text-primary" />
                Referral Ambassadors
              </Card.Title>
              <Card.Description>Users who have joined the referral program.</Card.Description>
            </div>
            <div class="relative w-full md:w-64">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search ambassadors..." class="pl-9" bind:value={rSearch} />
            </div>
          </div>
        </Card.Header>
        <Card.Content class="p-0 overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Email</Table.Head>
                <Table.Head>ID</Table.Head>
                <Table.Head>Bank</Table.Head>
                <Table.Head>Joined</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.referrals.data as referral}
                {@const refData = referral.data ? JSON.parse(referral.data) : {}}
                {@const hasBank = !!(refData.accountName && refData.bankName)}
                <Table.Row class="hover:bg-muted/30 transition-colors">
                  <Table.Cell class="font-bold">{referral.name}</Table.Cell>
                  <Table.Cell class="text-muted-foreground">{referral.email}</Table.Cell>
                  <Table.Cell>
                    <button
                      class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono cursor-pointer hover:bg-muted/80 transition-colors"
                      onclick={() => copyToClipboard(referral.id)}
                      title="Click to copy full ID"
                    >
                      {referral.id.split('-')[0]}
                    </button>
                  </Table.Cell>
                  <Table.Cell>
                    {#if hasBank}
                      <Badge variant="outline" class="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                        <Building2 class="size-3" />
                        {refData.bankName}
                      </Badge>
                    {:else}
                      <Badge variant="outline" class="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Not Set
                      </Badge>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-muted-foreground text-sm">
                    {new Date(referral.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <form method="POST" action="?/deleteReferral" use:enhance={() => {
                      return async ({ result, update }) => {
                        if (result.type === 'success') {
                          toast.success("Ambassador removed");
                          await update();
                        }
                      };
                    }}>
                      <input type="hidden" name="id" value={referral.id} />
                      <Button variant="ghost" size="icon" class="size-8 rounded-lg text-destructive hover:bg-destructive/10">
                        <Trash2 class="size-4" />
                      </Button>
                    </form>
                  </Table.Cell>
                </Table.Row>
              {:else}
                <Table.Row>
                  <Table.Cell colspan={6} class="h-32 text-center text-muted-foreground">No ambassadors found.</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Leads/Referees Tab -->
    <Tabs.Content value="referees" class="space-y-4">
      <Card.Root class="rounded-xl shadow-md overflow-hidden">
        <Card.Header class="border-b bg-muted/20">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Card.Title class="font-bold flex items-center gap-2">
                <UserPlus class="size-5 text-primary" />
                Referred Leads
              </Card.Title>
              <Card.Description>Friends referred by ambassadors. Manage status, payments, and receipts.</Card.Description>
            </div>
            <div class="relative w-full md:w-64">
              <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." class="pl-9" bind:value={refSearch} />
            </div>
          </div>
        </Card.Header>
        <Card.Content class="p-0 overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head>Lead</Table.Head>
                <Table.Head>Referrer</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.Head>Reward</Table.Head>
                <Table.Head>Payment</Table.Head>
                <Table.Head class="text-right">Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each data.referees.data as lead}
                {@const leadData = lead.data ? JSON.parse(lead.data) : {}}
                {@const status = leadData.status || 'pending'}
                {@const paymentStatus = leadData.paymentStatus || 'unpaid'}
                {@const isUploading = uploadingRefereeId === lead.id}
                <Table.Row class="hover:bg-muted/30 transition-colors">
                  <Table.Cell>
                    <div class="flex flex-col">
                      <span class="font-bold">{lead.name}</span>
                      <span class="text-xs text-muted-foreground">{lead.email}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <button
                      class="bg-muted px-1.5 py-0.5 rounded text-xs font-mono cursor-pointer hover:bg-muted/80"
                      onclick={() => copyToClipboard(lead.referralId)}
                      title="Click to copy full ID"
                    >
                      {lead.referralId?.split('-')[0] || '—'}
                    </button>
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
                    {#if leadData.rewardAmount}
                      <span class="font-bold text-emerald-600">£{leadData.rewardAmount}</span>
                    {:else if status === 'admitted'}
                      <span class="text-xs text-muted-foreground">Range: £{data.rewardMin}-£{data.rewardMax}</span>
                    {:else}
                      <span class="text-muted-foreground">—</span>
                    {/if}
                  </Table.Cell>
                  <Table.Cell>
                    {#if paymentStatus === 'paid'}
                      <Badge variant="outline" class="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                        <CheckCircle2 class="size-3" />
                        Paid
                      </Badge>
                    {:else if status === 'admitted'}
                      <Badge variant="outline" class="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Unpaid
                      </Badge>
                    {:else}
                      <span class="text-muted-foreground">—</span>
                    {/if}
                  </Table.Cell>
                  <Table.Cell class="text-right">
                    <div class="flex items-center justify-end gap-1">
                      <!-- View Receipt -->
                      {#if leadData.receiptUrl}
                        <Button
                          variant="ghost"
                          size="icon"
                          class="size-8 rounded-lg hover:bg-emerald-500/10 text-emerald-600"
                          onclick={() => openReceipt(leadData.receiptUrl, lead.name)}
                          title="View Receipt"
                        >
                          <Eye class="size-4" />
                        </Button>
                      {/if}
                      
                      <!-- Upload Receipt (only for admitted) -->
                      {#if status === 'admitted'}
                        <label
                          class="inline-flex items-center justify-center rounded-lg size-8 hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
                          title="Upload Receipt"
                        >
                          {#if isUploading}
                            <Loader2 class="size-4 animate-spin text-primary" />
                          {:else}
                            <Upload class="size-4" />
                          {/if}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            class="hidden"
                            onchange={(e) => handleFileSelect(lead.id, e)}
                            disabled={isUploading}
                          />
                        </label>
                      {/if}

                      <!-- Toggle Status -->
                      <form method="POST" action="?/updateRefereeStatus" use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === 'success') {
                            toast.success("Status updated!");
                            await update();
                          } else {
                            toast.error("Failed to update status");
                          }
                        };
                      }}>
                        <input type="hidden" name="id" value={lead.id} />
                        <input type="hidden" name="status" value={status === 'admitted' ? 'pending' : 'admitted'} />
                        <Button variant="outline" type="submit" class="rounded-lg text-xs">
                          {status === 'admitted' ? 'Revoke' : 'Approve'}
                        </Button>
                      </form>

                      <!-- Delete -->
                      <form method="POST" action="?/deleteReferee" use:enhance={() => {
                        return async ({ result, update }) => {
                          if (result.type === 'success') {
                            toast.success("Lead removed");
                            await update();
                          }
                        };
                      }}>
                        <input type="hidden" name="id" value={lead.id} />
                        <Button variant="ghost" size="icon" class="size-8 rounded-lg text-destructive hover:bg-destructive/10">
                          <Trash2 class="size-4" />
                        </Button>
                      </form>
                    </div>
                  </Table.Cell>
                </Table.Row>
              {:else}
                <Table.Row>
                  <Table.Cell colspan={6} class="h-32 text-center text-muted-foreground">No leads found.</Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
