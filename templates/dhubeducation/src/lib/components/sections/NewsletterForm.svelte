<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Send, CheckCircle, AlertCircle, Loader2 } from "@lucide/svelte";
  import { fade } from "svelte/transition";

  type Variant = "inline" | "compact" | "full";

  let { variant = "inline" as Variant }: { variant?: Variant } = $props();

  let email = $state("");
  let status = $state<"idle" | "loading" | "success" | "error">("idle");
  let message = $state("");

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    status = "loading";
    message = "";

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      status = data.success ? "success" : "error";
      message = data.message;

      if (data.success) {
        email = "";
        setTimeout(() => {
          status = "idle";
          message = "";
        }, 5000);
      }
    } catch {
      status = "error";
      message = "Network error. Please try again.";
    }
  }
</script>

{#if variant === "compact"}
  <!-- Compact: sidebar/footer style -->
  <form onsubmit={handleSubmit} class="space-y-3">
    <div class="flex gap-2">
      <Input
        type="email"
        bind:value={email}
        placeholder="Email address"
        required
        disabled={status === "loading"}
        class="border-none bg-background"
      />
      <Button
        type="submit"
        size="icon"
        disabled={status === "loading"}
        class="shrink-0"
      >
        {#if status === "loading"}
          <Loader2 class="size-4 animate-spin" />
        {:else}
          <Send class="size-4" />
        {/if}
      </Button>
    </div>
    {#if message}
      <div
        transition:fade={{ duration: 200 }}
        class="flex items-center gap-2 text-xs font-medium {status === 'success'
          ? 'text-primary'
          : 'text-destructive'}"
      >
        {#if status === "success"}
          <CheckCircle class="size-3 shrink-0" />
        {:else}
          <AlertCircle class="size-3 shrink-0" />
        {/if}
        {message}
      </div>
    {/if}
  </form>
{:else if variant === "full"}
  <!-- Full: blog detail sidebar style -->
  <form onsubmit={handleSubmit} class="space-y-4">
    <Input
      type="email"
      bind:value={email}
      placeholder="Your email address"
      required
      disabled={status === "loading"}
      class="bg-background border-none"
    />
    <Button type="submit" class="w-full" disabled={status === "loading"}>
      {#if status === "loading"}
        <Loader2 class="size-4 animate-spin mr-2" />
        Subscribing...
      {:else}
        Subscribe Now
      {/if}
    </Button>
    {#if message}
      <div
        transition:fade={{ duration: 200 }}
        class="flex items-center gap-2 text-xs font-medium {status === 'success'
          ? 'text-primary'
          : 'text-destructive'}"
      >
        {#if status === "success"}
          <CheckCircle class="size-3 shrink-0" />
        {:else}
          <AlertCircle class="size-3 shrink-0" />
        {/if}
        {message}
      </div>
    {/if}
  </form>
{:else}
  <!-- Inline: blogs page bottom CTA style -->
  <form
    onsubmit={handleSubmit}
    class="flex flex-col sm:flex-row gap-3 items-center justify-center max-w-md mx-auto"
  >
    <Input
      type="email"
      bind:value={email}
      placeholder="Enter your email"
      required
      disabled={status === "loading"}
    />
    <Button
      type="submit"
      class="w-full sm:w-auto"
      disabled={status === "loading"}
    >
      {#if status === "loading"}
        <Loader2 class="size-4 animate-spin mr-2" />
      {/if}
      Subscribe
    </Button>
  </form>
  {#if message}
    <div
      transition:fade={{ duration: 200 }}
      class="mt-4 flex items-center justify-center gap-2 text-sm font-medium {status ===
      'success'
        ? 'text-primary'
        : 'text-destructive'}"
    >
      {#if status === "success"}
        <CheckCircle class="size-4 shrink-0" />
      {:else}
        <AlertCircle class="size-4 shrink-0" />
      {/if}
      {message}
    </div>
  {/if}
{/if}
