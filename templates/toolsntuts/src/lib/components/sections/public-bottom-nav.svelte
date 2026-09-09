<script lang="ts">
	import { page } from '$app/state';
	import { Home, Sparkles, Tag, MoreHorizontal, BookOpen, X } from '@lucide/svelte';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button';
	import BrandLink from '$lib/components/widgets/BrandLink.svelte';
	import { cn } from '$lib/utils';
	import type { User } from '$lib/auth';

	const user = $derived(page.data.user as User | undefined);
	const pathname = $derived(page.url.pathname);

	let sheetOpen = $state(false);

	const tabs = [
		{ label: 'Home',     href: '/',              icon: Home },
		{ label: 'Features', href: '/#features',     icon: Sparkles },
		{ label: 'Pricing',  href: '/pricing',       icon: Tag },
	] as const;

	const drawerLinks = [
		{ label: 'Features',     href: '/#features' },
		{ label: 'How It Works', href: '/#how-it-works' },
		{ label: 'Pricing',      href: '/pricing' },
		{ label: 'Docs',         href: '/documentation' },
	] as const;

	const isActive = (href: string) => {
		if (href === '/') return pathname === '/';
		return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/';
	};
</script>

<!-- Fixed bottom bar — mobile only -->
<nav
	class="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md"
	style="padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px)"
	aria-label="Mobile navigation"
>
	<div class="flex items-center justify-around px-2 pt-1 pb-1">
		{#each tabs as tab}
			{@const active = isActive(tab.href)}
			<a
				href={tab.href}
				class={cn(
					'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors min-w-0',
					active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
				)}
				aria-current={active ? 'page' : undefined}
			>
				<div class="relative flex items-center justify-center">
					<tab.icon class="size-5" />
					{#if active}
						<span class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary"></span>
					{/if}
				</div>
				<span class="text-[10px] font-medium leading-none mt-1">{tab.label}</span>
			</a>
		{/each}

		<!-- More button -->
		<Sheet.Root bind:open={sheetOpen}>
			<Sheet.Trigger>
				{#snippet child({ props })}
					<button
						{...props}
						class={cn(
							'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors min-w-0',
							sheetOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
						)}
						aria-label="More navigation options"
					>
						<MoreHorizontal class="size-5" />
						<span class="text-[10px] font-medium leading-none mt-1">More</span>
					</button>
				{/snippet}
			</Sheet.Trigger>

			<Sheet.Content side="bottom" class="flex flex-col rounded-t-2xl p-0 max-h-[85dvh]">
				<Sheet.Header class="border-b border-border px-6 py-4 flex-row items-center justify-between">
					<BrandLink />
					<Sheet.Title class="sr-only">Navigation</Sheet.Title>
				</Sheet.Header>

				<nav class="flex flex-col gap-1 px-4 py-4 overflow-y-auto" aria-label="All navigation">
					{#each drawerLinks as link}
						<a
							href={link.href}
							onclick={() => (sheetOpen = false)}
							class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
						>
							{link.label}
						</a>
					{/each}
				</nav>

				<div class="mt-auto flex flex-col gap-2 border-t border-border px-6 py-6">
					{#if user}
						<Button href="/dashboard" class="w-full" onclick={() => (sheetOpen = false)}>
							Dashboard
						</Button>
					{:else}
						<Button
							href="/auth/login"
							variant="outline"
							class="w-full"
							onclick={() => (sheetOpen = false)}
						>
							Sign in
						</Button>
						<Button
							href="/auth/login?redirectTo=/dashboard"
							class="w-full"
							onclick={() => (sheetOpen = false)}
						>
							Get started free
						</Button>
					{/if}
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</nav>
