<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import ModeToggle from '$lib/components/widgets/ModeToggle.svelte';
	import AuthDialog from '$lib/authentication/ui/user/auth-dialog.svelte';
	import BrandLink from '$lib/components/widgets/BrandLink.svelte';
	import { cn } from '$lib/utils';
	import type { User } from '$lib/auth';

	const navLinks = [
		{ label: 'Features', href: '/#features' },
		{ label: 'How It Works', href: '/#how-it-works' },
		{ label: 'Pricing', href: '/pricing' },
		{ label: 'Docs', href: '/documentation' },
	] as const;

	let scrolled = $state(false);

	const isHome = $derived(page.url.pathname === '/');
	const transparent = $derived(isHome && !scrolled);
	const user = $derived(page.data.user as User | undefined);

	onMount(() => {
		const onScroll = () => { scrolled = window.scrollY > 40; };
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<header
	class={cn(
		'fixed inset-x-0 top-0 z-50 transition-all duration-300',
		transparent
			? 'bg-transparent'
			: 'bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80 border-b border-border/50 shadow-sm'
	)}
>
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand logo -->
		<div class={cn('flex items-center transition-colors', transparent ? '[&_span]:text-white' : '')}>
			<BrandLink />
		</div>

		<!-- Desktop nav -->
		<nav class="hidden md:flex items-center gap-1" aria-label="Main navigation">
			{#each navLinks as link}
				<a
					href={link.href}
					class={cn(
						'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
						transparent
							? 'text-white/85 hover:text-white hover:bg-white/10'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted'
					)}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<!-- Right actions (desktop only for auth; ModeToggle always visible) -->
		<div class="flex items-center gap-2">
			<ModeToggle />

			<div class="hidden md:flex items-center gap-2">
				{#if user}
					<Button href="/dashboard" size="sm" variant="ghost"
						class={cn(transparent && 'text-white/90 hover:text-white hover:bg-white/10')}>
						Dashboard
					</Button>
					<AuthDialog />
				{:else}
					<Button
						href="/auth/login"
						variant="ghost"
						size="sm"
						class={cn(transparent && 'text-white/90 hover:text-white hover:bg-white/10 border-transparent')}
					>
						Sign in
					</Button>
					<Button
						href="/auth/login?redirectTo=/dashboard"
						size="sm"
						class={cn(transparent && 'bg-white text-gray-900 hover:bg-white/90 border-white/20')}
					>
						Get started free
					</Button>
				{/if}
			</div>
		</div>
	</div>
</header>

<!-- Spacer prevents content from being hidden under the fixed header on non-home pages -->
{#if !isHome}
	<div class="h-16" aria-hidden="true"></div>
{/if}
