<script lang="ts">
  import * as Card from "$lib/components/ui/card";

  interface Props {
    id: string;
    title: string;
    description?: string;
    icon?: any;
    children: import("svelte").Snippet;
    class?: string;
    CardContentClass?: string;
    headerAction?: import("svelte").Snippet;
  }

  let {
    id,
    title,
    description,
    icon: Icon,
    children,
    class: className = "",
    CardContentClass = "p-4 space-y-8",
    headerAction,
  }: Props = $props();
</script>

<section {id} class="scroll-mt-32 space-y-6 {className}">
  <div class="flex items-center justify-between px-1">
    <div class="flex items-center gap-2">
      <div class="bg-primary/10 p-2 rounded-lg text-primary">
        {#if Icon}
          <Icon class="size-5" />
        {/if}
      </div>
      <div>
        <h2 class="text-lg font-bold">{title}</h2>
        {#if description}
          <p class="text-sm text-muted-foreground leading-none">
            {description}
          </p>
        {/if}
      </div>
    </div>
    {#if headerAction}
      {@render headerAction()}
    {/if}
  </div>

  <Card.Root class="border-border/60 shadow-md">
    <Card.Content class={CardContentClass}>
      {@render children()}
    </Card.Content>
  </Card.Root>
</section>
