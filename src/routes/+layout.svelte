<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { SiteMeta } from '$lib/constants';

	let { children } = $props();
</script>

<svelte:head>
	<!-- Every route supplies its own title/description/OG/canonical via <Seo>.
	     This only sets the keywords meta, which has no per-page equivalent. -->
	<meta name="keywords" content={SiteMeta.keywords.join(', ')} />
</svelte:head>

<Toaster richColors position="top-center" />
<ModeWatcher disableTransitions={true} defaultMode="dark" />
{@render children?.()}
