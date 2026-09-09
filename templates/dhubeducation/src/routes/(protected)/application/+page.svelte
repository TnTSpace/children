<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import {
		Plus,
		FileText,
		GraduationCap,
		Clock,
		CheckCircle2,
		AlertCircle,
		ChevronRight,
		Loader2,
		ArrowRight,
		ClipboardList,
	} from "@lucide/svelte";
	import Metatag from "$lib/components/ui/seo/Metatag.svelte";

	let { data } = $props();
	let isCreating = $state(false);

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			draft: "bg-muted text-muted-foreground border-muted-foreground/20",
			submitted:
				"bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-500/20",
			under_review:
				"bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-500/20",
			approved:
				"bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-500/20",
			rejected:
				"bg-red-500/10 text-red-600 border-red-200 dark:border-red-500/20",
			additional_info_required:
				"bg-orange-500/10 text-orange-600 border-orange-200 dark:border-orange-500/20",
		};
		return colors[status] || colors.draft;
	}

	function formatStatus(status: string) {
		return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
	}
</script>

<Metatag title="My Applications" />

<div class="w-full space-y-8 pb-12">
	<!-- Hero Section -->
	<div
		class="relative overflow-hidden rounded-3xl bg-primary/5 border border-primary/10 p-8 md:p-12"
	>
		<div
			class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
		>
			<div class="space-y-4 max-w-2xl">
				<Badge
					variant="outline"
					class="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors px-3 py-1"
				>
					Admissions Portal
				</Badge>
				<h1 class="text-3xl md:text-4xl font-bold tracking-tight">
					Your Journey Starts Here
				</h1>
				<p class="text-lg text-muted-foreground leading-relaxed">
					Track your current university applications or start a new journey with
					DHUB Education. We're here to support every step of your international
					experience.
				</p>
			</div>

			<form
				method="POST"
				action="?/create"
				use:enhance={() => {
					isCreating = true;
					return async ({ update }) => {
						isCreating = false;
						await update();
					};
				}}
			>
				<Button
					type="submit"
					disabled={isCreating}
					class="shadow-xl shadow-primary/20 gap-2 rounded-2xl"
				>
					{#if isCreating}
						<Loader2 class="h-5 w-5 animate-spin" />
						Starting...
					{:else}
						<Plus class="h-5 w-5" />
						New Application
					{/if}
				</Button>
			</form>
		</div>

		<!-- Decorative Background Element -->
		<div class="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
			<GraduationCap class="size-96 text-primary rotate-12" />
		</div>
	</div>

	<!-- Applications Grid -->
	<div class="space-y-6">
		<div class="flex items-center justify-between px-2">
			<h2 class="text-xl font-bold flex items-center gap-2">
				<ClipboardList class="h-5 w-5 text-primary" />
				Active Applications
				<Badge variant="secondary" class="ml-2 font-mono"
					>{data.applications?.length || 0}</Badge
				>
			</h2>
		</div>

		{#if !data.applications || data.applications.length === 0}
			<Card.Root class="border-dashed py-20 bg-muted/5">
				<Card.Content
					class="flex flex-col items-center justify-center text-center space-y-4"
				>
					<div class="p-4 rounded-full bg-primary/5 text-primary/40">
						<FileText class="size-12" />
					</div>
					<div class="max-w-xs">
						<h3 class="text-lg font-semibold">No applications found</h3>
						<p class="text-sm text-muted-foreground mt-1">
							You haven't started any applications yet. Click the button above
							to begin.
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.applications as app}
					<a
						href="/application/{app.id}"
						class="group block h-full outline-hidden"
					>
						<Card.Root
							class="h-full border-primary/10 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden relative group-hover:translate-y-[-4px]"
						>
							<Card.Header class="pb-4">
								<div class="flex justify-between items-start">
									<Badge class={getStatusColor(app.status)}>
										{formatStatus(app.status)}
									</Badge>
									<span
										class="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter"
									>
										ID: {app.id.split("-")[0]}
									</span>
								</div>
								<Card.Title class="text-xl mt-4 line-clamp-1"
									>{app.course || "Draft Application"}</Card.Title
								>
								<Card.Description class="flex items-center gap-1.5 capitalize">
									<GraduationCap class="h-3.5 w-3.5" />
									{app.programType?.replace(/_/g, " ") || "Programme not set"}
								</Card.Description>
							</Card.Header>

							<Card.Content class="pb-6">
								<div class="space-y-4">
									<div
										class="flex items-center gap-3 text-sm text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-secondary"
									>
										<Clock class="h-4 w-4 text-primary" />
										<span
											>Updated {new Date(
												app.updatedAt,
											).toLocaleDateString()}</span
										>
									</div>

									<div class="flex items-center justify-between pt-2">
										<span
											class="text-xs font-semibold text-primary flex items-center gap-1"
										>
											View Details <ArrowRight class="h-3 w-3" />
										</span>
										<ChevronRight
											class="h-5 w-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all"
										/>
									</div>
								</div>
							</Card.Content>

							<!-- Glassmorphism overlay on hover -->
							<div
								class="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
							></div>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.animate-in) {
		animation: fadeIn 0.5s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
