<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Separator } from "$lib/components/ui/separator";
	import * as Dialog from "$lib/components/ui/dialog";
	import SelectComponent from "$lib/components/ui/select/select-component.svelte";
	import {
		Search,
		Filter,
		MoreHorizontal,
		Eye,
		CheckCircle2,
		XCircle,
		Clock,
		AlertTriangle,
		Loader2,
		GraduationCap,
		Mail,
		Phone,
		Calendar,
		ArrowRight,
	} from "@lucide/svelte";
	import { infiniteScroll } from "$lib/hooks/use-infinite-scroll.svelte";
	import { Fields } from "$lib/constants";
	import type { iAdmission } from "$lib/interface";
	import { toast } from "svelte-sonner";

	let { data } = $props();

	let searchTerm = $state("");
	let statusFilter = $state("all");
	let programFilter = $state("all");

	const listQuery = infiniteScroll.listQueryAlternate<iAdmission>(() => ({
		field: Fields.ADMISSION,
		search: searchTerm,
		status: statusFilter,
		programType: programFilter,
	}));

	let admissions = $derived($listQuery.data?.results || []);

	const statusOptions = [
		{ label: "All Statuses", value: "all" },
		{ label: "Submitted", value: "submitted" },
		{ label: "Under Review", value: "under_review" },
		{ label: "Approved", value: "approved" },
		{ label: "Rejected", value: "rejected" },
		{ label: "Info Required", value: "additional_info_required" },
	];

	const programOptions = [
		{ label: "All Programs", value: "all" },
		{ label: "Foundation", value: "foundation" },
		{ label: "Undergraduate", value: "undergraduate" },
		{ label: "Masters", value: "masters" },
		{ label: "Research Masters", value: "research_masters" },
	];

	function getStatusBadge(status: string) {
		const variants: Record<string, string> = {
			submitted: "bg-blue-500/10 text-blue-600 border-blue-200",
			under_review: "bg-amber-500/10 text-amber-600 border-amber-200",
			approved: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
			rejected: "bg-rose-500/10 text-rose-600 border-rose-200",
			additional_info_required: "bg-orange-500/10 text-orange-600 border-orange-200",
		};
		return variants[status] || "bg-muted/50 border-muted-foreground/20";
	}

	let selectedApp = $state<iAdmission | null>(null);
	let isDialogOpen = $state(false);

	function openAdminDialog(app: iAdmission) {
		selectedApp = app;
		isDialogOpen = true;
	}
</script>

<div class="space-y-6">
	<!-- Page Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Application Management</h1>
			<p class="text-muted-foreground">
				Manage and track all student admissions and recruitment cycles.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Badge variant="outline" class="font-mono text-xs py-1 px-3 bg-primary/5">
				Total: {$listQuery.data?.total || 0}
			</Badge>
		</div>
	</div>

	<!-- Filters & Search -->
	<Card.Root class="overflow-hidden border-primary/10 shadow-sm">
		<Card.Content class="p-4 bg-muted/5">
			<div
				class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end"
			>
				<div class="md:col-span-2 space-y-2">
					<Label
						class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>Search Student</Label
					>
					<div class="relative group">
						<Search
							class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors"
						/>
						<Input
							placeholder="Search by name, email, or ID..."
							bind:value={searchTerm}
							class="pl-10 h-10 border-primary/10 focus-visible:ring-primary/20"
						/>
					</div>
				</div>
				<div class="space-y-2">
					<Label
						class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>Status</Label
					>
					<SelectComponent
						name="status"
						placeholder="Select Status"
						options={statusOptions}
						bind:value={statusFilter}
					/>
				</div>
				<div class="space-y-2">
					<Label
						class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>Program Type</Label
					>
					<SelectComponent
						name="programType"
						placeholder="Select Program type"
						options={programOptions}
						bind:value={programFilter}
					/>
				</div>
				<div>
					<Button
						variant="ghost"
						class="w-full text-muted-foreground hover:text-primary h-10 group"
						onclick={() => {
							searchTerm = "";
							statusFilter = "all";
							programFilter = "all";
						}}
					>
						<Filter
							class="mr-2 size-4 group-hover:rotate-180 transition-transform duration-500"
						/>
						Reset
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Applications List -->
	<div class="grid grid-cols-1 gap-4">
		{#if $listQuery.isLoading && admissions.length === 0}
			<div class="flex flex-col items-center justify-center py-24 space-y-4">
				<Loader2 class="size-10 animate-spin text-primary/40" />
				<p class="text-sm font-medium text-muted-foreground animate-pulse">
					Loading applications...
				</p>
			</div>
		{:else if admissions.length === 0}
			<div
				class="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-3xl border-primary/10 bg-primary/2"
			>
				<div class="p-4 rounded-full bg-primary/5 text-primary/40 mb-4">
					<Search class="size-12" />
				</div>
				<h3 class="text-xl font-bold">No results found</h3>
				<p class="text-muted-foreground max-w-xs mt-1">
					Try adjusting your filters or search terms to find what you're looking
					for.
				</p>
			</div>
		{:else}
			{#each admissions as app}
				<div
					class="group relative overflow-hidden rounded-2xl border border-primary/10 bg-card hover:border-primary/30 hover:shadow-xl transition-all duration-300"
				>
					<div class="p-5 md:p-6 grid md:grid-cols-4 gap-6 items-center">
						<div class="md:col-span-2 space-y-4">
							<div class="flex items-start gap-4">
								<div
									class="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/10 group-hover:bg-primary/10 transition-colors"
								>
									<GraduationCap class="size-6" />
								</div>
								<div>
									<h3
										class="text-lg font-bold group-hover:text-primary transition-colors"
									>
										{app.fullName}
									</h3>
									<div
										class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-1"
									>
										<p class="flex items-center gap-1.5">
											<Mail class="size-3.5" />
											{app.email}
										</p>
										<p class="flex items-center gap-1.5">
											<Phone class="size-3.5" />
											{app.phone || "N/A"}
										</p>
									</div>
								</div>
							</div>
						</div>

						<div class="space-y-2">
							<div class="flex items-center gap-2">
								<Badge variant="outline" class={getStatusBadge(app.status)}>
									{app.status?.replace(/_/g, " ").toUpperCase()}
								</Badge>
							</div>
							<p
								class="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5 px-1 truncate"
							>
								<ArrowRight class="size-3 text-primary" />
								{app.course || "No Course Selected"}
							</p>
						</div>

						<div class="flex items-center justify-end gap-3 px-2">
							<Button
								variant="outline"
								size="sm"
								href="/application/{app.id}"
								class="h-9 gap-2"
							>
								<Eye class="size-4" />
								View
							</Button>
							<Button
								variant="secondary"
								size="sm"
								class="h-9 gap-2 text-primary"
								onclick={() => openAdminDialog(app)}
							>
								<MoreHorizontal class="size-4" />
								Manage
							</Button>
						</div>
					</div>

					<!-- Progress strip -->
					<div
						class="absolute bottom-0 left-0 h-1 bg-primary/10 w-full overflow-hidden"
					>
						<div
							class="h-full bg-primary/40 group-hover:bg-primary transition-colors"
							style="width: 100%"
						></div>
					</div>
				</div>
			{/each}

			<!-- Infinite Scroll Trigger -->
			{#if $listQuery.hasNextPage}
				<div class="flex justify-center py-10">
					<Button
						variant="ghost"
						disabled={$listQuery.isFetching}
						onclick={() => $listQuery.fetchNextPage()}
						class="text-primary hover:bg-primary/5 h-12 px-8 rounded-xl font-bold"
					>
						{#if $listQuery.isFetching}
							<Loader2 class="size-4 mr-2 animate-spin" />
							Loading More...
						{:else}
							Load More Applications
						{/if}
					</Button>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Admin Management Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="max-w-md sm:rounded-3xl">
		<Dialog.Header>
			<Dialog.Title class="text-2xl font-bold tracking-tight"
				>Status Management</Dialog.Title
			>
			<Dialog.Description
				>Review {selectedApp?.fullName}'s progress and update application
				status.</Dialog.Description
			>
		</Dialog.Header>

		{#if selectedApp}
			<form
				method="POST"
				action="?/updateStatus"
				use:enhance={() => {
					return async ({ result, update }) => {
						if (result.type === "success") {
							toast.success("Application status updated!");
							isDialogOpen = false;
							// Invalidate the query to refresh the list reactively without a full page reload
							infiniteScroll.queryClient.invalidateQueries({
								queryKey: ["infinite-scroll-alt", Fields.ADMISSION]
							});
						}
						await update();
					};
				}}
				class="space-y-6 pt-4"
			>
				<input type="hidden" name="id" value={selectedApp.id} />
				<div class="space-y-2">
					<Label
						for="status"
						class="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1"
						>Application Status</Label
					>
					<SelectComponent
						name="status"
						placeholder="Select Status"
						options={statusOptions.filter((o) => o.value !== "all")}
						bind:value={selectedApp.status}
					/>
				</div>

				<div class="space-y-2">
					<Label
						for="adminNotes"
						class="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1"
						>Admin Internal Notes</Label
					>
					<Textarea
						name="adminNotes"
						bind:value={selectedApp.adminNotes}
						placeholder="Add specific instructions or feedback for the student..."
						class="min-h-[120px] rounded-2xl border-primary/10 shadow-sm focus-visible:ring-primary/20"
					/>
				</div>

				<div class="flex items-center gap-3 pt-2">
					<Button
						variant="ghost"
						type="button"
						class="flex-1 rounded-2xl"
						onclick={() => (isDialogOpen = false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						class="flex-1 rounded-2xl shadow-xl shadow-primary/20"
					>
						Update Status
					</Button>
				</div>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<style>
	:global(.animate-in) {
		animation: fadeIn 0.4s ease-out forwards;
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
