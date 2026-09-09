<script lang="ts">
	import { cn } from "$lib/utils";
	import Button from "$lib/components/ui/button/button.svelte";
	import type { Snippet } from "svelte";
	import { Check, MessageCircleQuestion } from "@lucide/svelte";
    import Binoculars from "$lib/components/icons/binoculars.svelte";

	interface Props {
		code: number;
		message?: string;
		description: string;
		href: string;
		class?: string;
		buttonText?: string;
		children?: Snippet;
		type?: "error" | "info" | "success";
	}

	let {
		code,
		message,
		description,
		href,
		class: className,
		buttonText = "Take me home",
		type = "error",
		children,
	}: Props = $props();
</script>

<div class={cn("flex h-screen w-full items-center justify-center", className)}>
	<div
		class="flex flex-col items-center justify-center px-4 text-center size-full"
	>
		{#if type === "error"}
			<Binoculars class="mb-4 h-16 w-16 text-red-600" />
		{:else if type === "info"}
			<MessageCircleQuestion class="mb-4 h-16 w-16 text-blue-600" />
		{:else if type === "success"}
			<Check class="mb-4 h-16 w-16 text-green-600" />
		{:else if type === "sent"}
			<Check class="mb-4 h-16 w-16 text-blue-600" />
		{:else}
			<Binoculars class="mb-4 h-16 w-16 text-gray-600" />
		{/if}
		<p class="text-6xl leading-tight font-semibold">{code}</p>
		<h1 class="pt-3 text-sm font-bold tracking-wider uppercase">{message}</h1>
		<div class="mx-auto my-6 h-px w-16 bg-muted-foreground"></div>
		<blockquote
			class="mx-auto mb-0 max-w-xs text-sm font-medium text-muted-foreground"
		>
			{description}
		</blockquote>
		{#if children}
			<div class="mt-6 w-full">
				{@render children()}
			</div>
		{:else}
			<div class="mt-6 flex gap-2 items-center">
				<Button onclick={() => window.location.reload()}>Refresh</Button>
				<Button {href} variant="outline">
					{buttonText}
				</Button>
			</div>
		{/if}
	</div>
</div>
