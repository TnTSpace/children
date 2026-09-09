<script lang="ts">
  interface Props {
    index: number;
    heading?: string | null;
    prose?: string | null;
    imageUrl?: string | null;
    caption?: string | null;
    fallbackAlt: string;
  }

  let { index, heading, prose, imageUrl, caption, fallbackAlt }: Props = $props();
  const imageFirst = $derived(index % 2 === 1);
</script>

<article
  class="flex flex-col gap-6 print:break-inside-avoid lg:items-center lg:gap-10 {imageFirst
    ? 'lg:flex-row-reverse'
    : 'lg:flex-row'}"
>
  <div class="lg:w-1/2">
    {#if heading}
      <h3 class="mb-4 text-xl font-bold tracking-tight text-foreground">{heading}</h3>
    {/if}
    {#if prose}
      <p class="leading-relaxed whitespace-pre-line text-foreground/90">{prose}</p>
    {/if}
  </div>

  {#if imageUrl}
    <figure class="lg:w-1/2">
      <div class="overflow-hidden rounded-xl border bg-muted shadow-sm">
        <img src={imageUrl} alt={caption ?? heading ?? fallbackAlt} class="aspect-4/3 w-full object-cover" loading="lazy" />
      </div>
      {#if caption}
        <figcaption class="mt-2 text-xs text-muted-foreground">{caption}</figcaption>
      {/if}
    </figure>
  {/if}
</article>
