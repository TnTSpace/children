<script lang="ts">
	import { page } from "$app/state";
	import ErrorComponent from "$lib/authentication/ui/error-component.svelte";
</script>

<ErrorComponent
	code={page.status || 500}
	message={page.error?.message || "Internal Server Error"}
	description="But if you don't change your direction, and if you keep looking, you may end up where you are
			heading."
	href="/"
/>
