<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save, Trash2 } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { untrack } from "svelte";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import CourseDrawerContent from "../components/CourseDrawerContent.svelte";
  import AdminCRUDDeleteDialog from "$lib/components/admin/AdminCRUDDeleteDialog.svelte";
  import type { iCourse } from "$lib/interface";

  let { data } = $props();

  let isSaving = $state(false);
  let isDeleteDialogOpen = $state(false);
  let course = $state<iCourse>(untrack(() => ({ ...data.course })));

  const handleSave = async () => {
    if (!course.name || !course.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch(`/api/course/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Course updated successfully");
      goto("/admin/courses");
    } catch (err: any) {
      toast.error(err.message || "Failed to update course");
    } finally {
      isSaving = false;
    }
  };
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onclick={() => goto("/admin/courses")}
        class="rounded-xl"
      >
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Edit Course</h1>
        <p class="text-muted-foreground mt-1">Update your course details.</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <Button
        variant="destructive"
        onclick={() => (isDeleteDialogOpen = true)}
        class="rounded-xl"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Delete
      </Button>
      <Button
        variant="outline"
        onclick={() => goto("/admin/courses")}
        disabled={isSaving}
        class="rounded-xl"
      >
        Cancel
      </Button>
      <Button
        onclick={handleSave}
        disabled={isSaving}
        class="rounded-xl shadow-lg"
      >
        {#if isSaving}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Saving...
        {:else}
          <Save class="mr-2 h-4 w-4" />
          Save Changes
        {/if}
      </Button>
    </div>
  </div>

  <Card.Root class="rounded-xl shadow-lg border-muted/20">
    <Card.Content>
      <CourseDrawerContent bind:item={course} mode="edit" />
    </Card.Content>
  </Card.Root>
</div>

{#if isDeleteDialogOpen}
  <AdminCRUDDeleteDialog
    item={course}
    open={isDeleteDialogOpen}
    title="Delete Course"
    endpoint="/api/course"
    onOpenChange={(open) => (isDeleteDialogOpen = open)}
    onSuccess={() => {
      isDeleteDialogOpen = false;
      goto("/admin/courses");
    }}
  />
{/if}
