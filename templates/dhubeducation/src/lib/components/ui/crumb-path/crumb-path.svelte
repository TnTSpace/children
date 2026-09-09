<script lang="ts">
  import * as Breadcrumb from "$lib/components/ui/breadcrumb";
  import { page } from "$app/state";

  interface Props {
    items?: { label: string; href: string }[];
  }

  let { items = [] }: Props = $props();

  const getBreadcrumbs = (url: URL) => {
    const segments = url.pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = "/" + segments.slice(0, index + 1).join("/");
      const name = segment;
      return { label: name.replace(/-/g, " "), href: path };
    });
  };

  let breadcrumbs = $derived(
    items.length > 0 ? items : getBreadcrumbs(page.url),
  );
</script>

<Breadcrumb.Root>
  <Breadcrumb.List class="items-center">
    {#each breadcrumbs as { label, href }, i}
      <Breadcrumb.Item
        class={i < breadcrumbs.length - 1 ? "hidden md:block" : ""}
      >
        <Breadcrumb.Link {href} class="capitalize max-w-20 line-clamp-1"
          >{label}</Breadcrumb.Link
        >
      </Breadcrumb.Item>
      {#if i < breadcrumbs.length - 1}
        <Breadcrumb.Separator class="hidden md:block -mb-0.5" />
      {/if}
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
