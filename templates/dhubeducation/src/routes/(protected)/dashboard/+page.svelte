<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import {
    LayoutDashboard,
    Users,
    FileText,
    User as UserIcon,
    GraduationCap,
    ClipboardList,
    Plus,
    Clock,
    Eye,
    AlertTriangle,
  } from "@lucide/svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import type { User } from "$lib/auth";
  import { page } from "$app/state";

  const user = page.data.user as User;

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      submitted: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      under_review: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      approved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
      additional_info_required:
        "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    };
    return colors[status] || colors.draft;
  }

  function formatStatus(status: string) {
    return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
</script>

<div class="flex flex-col gap-6">
  <div>
    <h1 class="text-3xl font-bold">Dashboard</h1>
    <p class="text-muted-foreground">Welcome back, {user?.name || "User"}!</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Total Users</Card.Title>
        <Users class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">0</div>
        <p class="text-xs text-muted-foreground">Registered users</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Active Sessions</Card.Title>
        <UserIcon class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">1</div>
        <p class="text-xs text-muted-foreground">Current session</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">Documents</Card.Title>
        <FileText class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold">0</div>
        <p class="text-xs text-muted-foreground">Total files</p>
      </Card.Content>
    </Card.Root>

    <Card.Root>
      <Card.Header
        class="flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <Card.Title class="text-sm font-medium">System Status</Card.Title>
        <LayoutDashboard class="h-4 w-4 text-muted-foreground" />
      </Card.Header>
      <Card.Content>
        <div class="text-2xl font-bold text-green-500">Online</div>
        <p class="text-xs text-muted-foreground">All systems operational</p>
      </Card.Content>
    </Card.Root>
  </div>

  <div class="grid grid-cols-1 gap-6">
    <Card.Root class="overflow-hidden border-primary/20 bg-primary/2">
      <Card.Header
        class="flex flex-row items-center justify-between bg-primary/5 pb-4 pt-6"
      >
        <div>
          <Card.Title class="text-xl font-bold flex items-center gap-2">
            <GraduationCap class="size-6 text-primary" />
            My Admission Application
          </Card.Title>
          <Card.Description
            >Track your study journey with DHUB Education</Card.Description
          >
        </div>
        {#if page.data.admission}
          <Badge class={getStatusColor(page.data.admission.status)}>
            {formatStatus(page.data.admission.status)}
          </Badge>
        {/if}
      </Card.Header>
      <Card.Content class="p-6">
        {#if !page.data.admission}
          <div
            class="flex flex-col items-center justify-center py-8 text-center space-y-4"
          >
            <div class="rounded-full bg-primary/10 p-4">
              <ClipboardList class="size-10 text-primary" />
            </div>
            <div class="max-w-md">
              <h3 class="text-lg font-semibold">
                Start Your Application Today
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                You haven't started your admission application yet. Fill in your
                details and upload your documents to begin the process.
              </p>
            </div>
            <Button
              href="/application"
              class="gap-2 shadow-lg shadow-primary/20"
            >
              <Plus class="size-4" />
              Begin Application
            </Button>
          </div>
        {:else}
          <div
            class="flex flex-col md:flex-row gap-6 items-center justify-between"
          >
            <div class="space-y-4 flex-1">
              <div class="flex items-center gap-4">
                <div class="p-3 rounded-xl bg-primary/10 text-primary">
                  <Clock class="size-6" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Current Progress
                  </p>
                  <p class="text-lg font-bold">
                    {formatStatus(page.data.admission.status)}
                  </p>
                </div>
              </div>

              <div class="space-y-2">
                <p
                  class="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Programme
                </p>
                <div class="flex items-center gap-2">
                  <Badge variant="outline" class="capitalize"
                    >{page.data.admission.programType.replace(/_/g, " ")}</Badge
                  >
                  <span class="text-sm font-medium"
                    >{page.data.admission.course ||
                      "Course not specified"}</span
                  >
                </div>
              </div>

              {#if page.data.admission.status === "additional_info_required"}
                <div
                  class="p-3 rounded-lg border border-orange-500/30 bg-orange-500/5 flex gap-3"
                >
                  <AlertTriangle class="size-5 text-orange-500 shrink-0" />
                  <div class="text-sm">
                    <p class="font-bold text-orange-700 dark:text-orange-400">
                      Action Required
                    </p>
                    <p class="text-muted-foreground">
                      {page.data.admission.adminNotes ||
                        "Please check your application for missing details."}
                    </p>
                  </div>
                </div>
              {/if}
            </div>

            <div class="flex flex-col gap-2 w-full md:w-fit shrink-0">
              <Button
                href="/application"
                variant="outline"
                class="gap-2 w-full"
              >
                <Eye class="size-4" />
                Track Status
              </Button>
              <Button
                href="/application/{page.data.admission.id}"
                class="gap-2 w-full"
              >
                <FileText class="size-4" />
                View/Update Details
              </Button>
            </div>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
