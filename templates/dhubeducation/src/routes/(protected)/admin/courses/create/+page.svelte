<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { Loader2, ArrowLeft, Save } from "@lucide/svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import * as Card from "$lib/components/ui/card/index.js";
  import CourseDrawerContent from "../components/CourseDrawerContent.svelte";
  import type { iCourse } from "$lib/interface";

  let isSaving = $state(false);
  let course = $state<Partial<iCourse>>({
    name: "",
    description: "",
    content: "",
  });

  const handleSave = async () => {
    if (!course.name || !course.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      isSaving = true;
      const response = await fetch("/api/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(course),
      });

      const result = await response.json();
      if (result.status === "error") throw new Error(result.message);

      toast.success("Course created successfully");
      goto("/admin/courses");
    } catch (err: any) {
      toast.error(err.message || "Failed to create course");
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
        <h1 class="text-3xl font-bold tracking-tight">Create Course</h1>
        <p class="text-muted-foreground mt-1">
          Add a new course to your curriculum.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-2">
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
          Save Course
        {/if}
      </Button>
    </div>
  </div>

  <Card.Root class="rounded-xl shadow-lg border-muted/20">
    <Card.Content>
      <CourseDrawerContent bind:item={course} mode="create" />
    </Card.Content>
  </Card.Root>
</div>
