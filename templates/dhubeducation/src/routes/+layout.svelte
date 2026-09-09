<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { ModeWatcher } from 'mode-watcher';
	import { SiteMeta } from '$lib/constants';
	
	let { children } = $props();
</script>

<Toaster richColors position="top-center" />
<ModeWatcher disableTransitions={true} />
{@render children?.()}
