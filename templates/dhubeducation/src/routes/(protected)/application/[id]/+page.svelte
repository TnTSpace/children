<script lang="ts">
	import type { PageData } from "./$types";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Textarea } from "$lib/components/ui/textarea";
	import * as Card from "$lib/components/ui/card";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Drawer from "$lib/components/ui/drawer";
	import { Badge } from "$lib/components/ui/badge";
	import SelectComponent from "$lib/components/ui/select/select-component.svelte";
	import {
		Save,
		Send,
		ArrowLeft,
		FileText,
		User,
		GraduationCap,
		MapPin,
		PlusCircle,
		Loader2,
		UploadCloud,
		FileCheck,
		Trash2,
		AlertCircle,
		Eye,
		X,
		ShieldCheck,
	} from "@lucide/svelte";
	import { toast } from "svelte-sonner";
	import Metatag from "$lib/components/ui/seo/Metatag.svelte";

	let { data = $bindable() } = $props();
	let admission = $state({
		...data.admission,
		immigrationSupport: data.admission.immigrationSupport || "None",
		accommodationSupport: data.admission.accommodationSupport || "None",
		jobSupport: data.admission.jobSupport || "None",
		appliedToOtherSchool: data.admission.appliedToOtherSchool || "no",
		travelingWithOthers: data.admission.travelingWithOthers || "no"
	});

	let isSaving = $state(false);
	let isSubmitting = $state(false);
	let isDeleting = $state(false);

	// ─── File Preview ───
	let previewOpen = $state(false);
	let previewUrl = $state("");
	let previewTitle = $state("");
	let previewType = $state("");
	let isMobile = $state(false);

	function checkMobile() {
		isMobile = typeof window !== "undefined" && window.innerWidth < 768;
	}

	$effect(() => {
		checkMobile();
		if (typeof window !== "undefined") {
			window.addEventListener("resize", checkMobile);
			return () => window.removeEventListener("resize", checkMobile);
		}
	});

	const { isAdmin, isOwner } = data;
	const isApproved = admission.status === 'approved';
	const isReadOnly = (isAdmin && !isOwner) || isApproved;

	const statusOptions = [
		{ label: "Submitted", value: "submitted" },
		{ label: "Under Review", value: "under_review" },
		{ label: "Approved", value: "approved" },
		{ label: "Rejected", value: "rejected" },
		{ label: "Info Required", value: "additional_info_required" },
	];

	const statusMap: Record<string, { label: string; color: string }> = {
		draft: {
			label: "Draft",
			color: "bg-muted/50 text-muted-foreground border-muted-foreground/20",
		},
		submitted: {
			label: "Submitted",
			color: "bg-blue-500/10 text-blue-600 border-blue-100",
		},
		under_review: {
			label: "Under Review",
			color: "bg-amber-500/10 text-amber-600 border-amber-100",
		},
		approved: {
			label: "Approved",
			color: "bg-emerald-500/10 text-emerald-600 border-emerald-100",
		},
		rejected: {
			label: "Rejected",
			color: "bg-rose-500/10 text-rose-600 border-rose-100",
		},
		additional_info_required: {
			label: "Info Required",
			color: "bg-orange-500/10 text-orange-600 border-orange-100",
		},
	};

	function openPreview(url: string, title: string, type: string = "file") {
		previewUrl = url;
		previewTitle = title;
		previewType = type;
		previewOpen = true;
	}

	const programTypes = [
		{ label: "Foundation", value: "foundation" },
		{ label: "Undergraduate", value: "undergraduate" },
		{ label: "Masters", value: "masters" },
		{ label: "Research Masters", value: "research_masters" },
	];

	const qualificationOptions = [
		{ label: "O-Level", value: "olevel" },
		{ label: "OND", value: "ond" },
		{ label: "HND", value: "hnd" },
		{ label: "B.Sc.", value: "bsc" },
		{ label: "M.Sc.", value: "msc" },
	];

	const maritalOptions = [
		{ label: "Single", value: "single" },
		{ label: "Married", value: "married" },
	];

	const visaOptions = [
		{ label: "No", value: "no" },
		{ label: "Yes", value: "yes" },
	];

	const supportOptions = [
		{ label: "None", value: "None" },
		{ label: "Required", value: "Required" },
	];

	const travelingOptions = [
		{ label: "No one", value: "no" },
		{ label: "Yes, family/friends", value: "yes" },
	];

	const appliedBeforeOptions = [
		{ label: "No", value: "no" },
		{ label: "Yes", value: "yes" },
	];

	// ─── Async File Upload State ───
	type UploadStatus = "idle" | "uploading" | "success" | "error" | "deleting";

	interface FileUploadState {
		id: string; // Unique identifier for state tracking
		status: UploadStatus;
		progress: number;
		fileName: string;
		error: string;
		fileId: string;
		fileUrl: string;
		fileType: string;
	}

	const DOCUMENT_FIELDS = [
		{ key: "passport", label: "International Passport" },
		{ key: "waec", label: "WAEC / O-Level Result" },
		{ key: "ielts", label: "IELTS / English Test" },
		{ key: "transcript", label: "Academic Transcript" },
		{ key: "certificate", label: "Degree Certificate" },
		{ key: "cv", label: "Updated CV / Resume" },
		{ key: "referenceLetter", label: "Reference Letter" },
	] as const;

	type DocumentCategory = typeof DOCUMENT_FIELDS[number]["key"];

	// ─── Multi-File State Management ───
	let uploads = $state<Record<string, FileUploadState[]>>(
		Object.fromEntries(
			DOCUMENT_FIELDS.map((f) => [
				f.key,
				(data.admission.documents || [])
					.filter((d: any) => d.category === f.key)
					.map((d: any) => ({
						status: "success" as const,
						progress: 100,
						fileName: d.fileName || "Uploaded File",
						error: "",
						fileId: d.fileId,
						fileUrl: d.fileUrl || "",
						fileType: d.fileType || "file",
						id: d.id, // Junction table ID
					})),
			]),
		),
	);

	function uploadFile(category: string, file: File) {
		const tempId = crypto.randomUUID();
		const newState: FileUploadState = {
			status: "uploading",
			progress: 0,
			fileName: file.name,
			error: "",
			fileId: "",
			fileUrl: "",
			fileType: "file",
			id: tempId
		};

		uploads[category] = [...uploads[category], newState];

		const formData = new FormData();
		formData.append("file", file);
		formData.append("field", category);
		formData.append("admissionId", admission.id);

		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", (e) => {
			if (e.lengthComputable) {
				const idx = uploads[category].findIndex(u => u.id === tempId);
				if (idx !== -1) uploads[category][idx].progress = Math.round((e.loaded / e.total) * 100);
			}
		});

		xhr.addEventListener("load", () => {
			const idx = uploads[category].findIndex(u => u.id === tempId);
			if (idx === -1) return;

			if (xhr.status >= 200 && xhr.status < 300) {
				const result = JSON.parse(xhr.responseText);
				uploads[category][idx] = {
					...uploads[category][idx],
					status: "success",
					progress: 100,
					fileId: result.fileId,
					fileUrl: result.url,
					fileType: result.fileType,
				};
				toast.success(`${file.name} uploaded`);
			} else {
				let msg = "Upload failed";
				try {
					msg = JSON.parse(xhr.responseText).error || msg;
				} catch {}
				uploads[category][idx].status = "error";
				uploads[category][idx].error = msg;
				toast.error(msg);
			}
		});

		xhr.addEventListener("error", () => {
			const idx = uploads[category].findIndex(u => u.id === tempId);
			if (idx !== -1) {
				uploads[category][idx].status = "error";
				uploads[category][idx].error = "Network error";
			}
			toast.error("Network error during upload");
		});

		xhr.open("POST", "/api/admission/upload");
		xhr.send(formData);
	}

	async function deleteFile(category: string, doc: FileUploadState) {
		const idx = uploads[category].findIndex(u => u.id === doc.id);
		if (idx === -1) return;

		const originalStatus = uploads[category][idx].status;
		uploads[category][idx].status = "deleting";

		try {
			const res = await fetch("/api/admission/delete-file", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					admissionId: admission.id,
					fileId: doc.fileId,
					documentId: doc.id === doc.fileId ? undefined : doc.id // Only send if it's a real junction record ID
				}),
			});

			if (res.ok) {
				uploads[category] = uploads[category].filter(u => u.id !== doc.id);
				toast.success("File removed");
			} else {
				const err = await res.json();
				uploads[category][idx].status = originalStatus;
				toast.error(err.error || "Failed to delete file");
			}
		} catch {
			uploads[category][idx].status = originalStatus;
			toast.error("Network error");
		}
	}

	function handleFileSelect(fieldKey: string, event: Event) {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];
		if (!file) return;

		if (file.size > 10 * 1024 * 1024) {
			toast.error("File too large. Maximum size is 10MB.");
			return;
		}

		uploadFile(fieldKey, file);
		input.value = "";
	}

	function handleEnhance(type: 'save' | 'submit' = 'save') {
		if (type === 'save') isSaving = true;
		else isSubmitting = true;

		return async ({ result }: any) => {
			try {
				if (result.type === "success") {
					toast.success(result.data?.message || (type === 'save' ? "Progress saved" : "Application submitted"));
					if (type === 'submit') goto("/application");
				} else if (result.type === "redirect") {
					goto(result.location);
				} else if (result.type === "failure") {
					toast.error(result.data?.message || "Action failed");
				} else {
					toast.error("Something went wrong");
				}
			} catch {
				toast.error("An unexpected error occurred");
			} finally {
				isSaving = false;
				isSubmitting = false;
			}
		};
	}

	let isUpdatingStatus = $state(false);
	function handleUpdateStatus() {
		isUpdatingStatus = true;
		return async ({ result }: any) => {
			isUpdatingStatus = false;
			if (result.type === "success") {
				toast.success("Status updated successfully");
			} else {
				toast.error(result.data?.message || "Failed to update status");
			}
		};
	}

	// ─── Local UI Toggles for Conditional Fields ───
	let appliedToggle = $state(admission.appliedToOtherSchool && admission.appliedToOtherSchool !== 'no' ? 'yes' : 'no');
	let travelingToggle = $state(admission.travelingWithOthers && admission.travelingWithOthers !== 'no' ? 'yes' : 'no');

	$effect(() => {
		if (appliedToggle === 'no') admission.appliedToOtherSchool = 'no';
		else if (admission.appliedToOtherSchool === 'no') admission.appliedToOtherSchool = '';
		
		if (travelingToggle === 'no') admission.travelingWithOthers = 'no';
		else if (admission.travelingWithOthers === 'no') admission.travelingWithOthers = '';
	});
</script>

<Metatag title="Edit Application" />

<!-- ─── File Preview Dialog (Desktop) ─── -->
{#if !isMobile}
	<Dialog.Root bind:open={previewOpen}>
		<Dialog.Content
			class="max-w-4xl w-[90vw] h-[85vh] p-0 gap-0 overflow-hidden"
		>
			<Dialog.Header class="px-6 py-4 border-b bg-muted/30 flex flex-row items-center justify-between">
				<div>
					<Dialog.Title class="flex items-center gap-2 text-base">
						<FileText class="h-4 w-4 text-primary" />
						{previewTitle}
					</Dialog.Title>
					<Dialog.Description class="sr-only">Document preview</Dialog.Description>
				</div>
				<div class="flex items-center gap-2 mr-8">
					<Button variant="outline" size="sm" href={previewUrl} target="_blank" download class="h-8 gap-1.5">
						<UploadCloud class="h-3.5 w-3.5" />
						Download
					</Button>
				</div>
			</Dialog.Header>
			<div class="flex-1 h-full min-h-0 bg-muted/5 flex items-center justify-center overflow-auto p-4">
				{#if previewOpen && previewUrl}
					{#if previewType === 'image' || previewType?.startsWith('image/')}
						<img
							src={previewUrl}
							alt={previewTitle}
							class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
						/>
					{:else}
						<iframe
							src={previewUrl}
							title={previewTitle}
							class="w-full h-full border-0 rounded-lg bg-background shadow-lg"
						></iframe>
					{/if}
				{/if}
			</div>
		</Dialog.Content>
	</Dialog.Root>
{/if}

<!-- ─── File Preview Drawer (Mobile) ─── -->
{#if isMobile}
	<Drawer.Root bind:open={previewOpen}>
		<Drawer.Content class="h-[95vh]">
			<Drawer.Header class="border-b flex flex-row items-center justify-between px-4">
				<div>
					<Drawer.Title class="flex items-center gap-2 text-base">
						<FileText class="h-4 w-4 text-primary" />
						{previewTitle}
					</Drawer.Title>
					<Drawer.Description class="sr-only">Document preview</Drawer.Description>
				</div>
				<Button variant="outline" size="sm" href={previewUrl} target="_blank" download class="h-8 gap-1.5">
					<UploadCloud class="h-3.5 w-3.5" />
					Download
				</Button>
			</Drawer.Header>
			<div class="flex-1 min-h-0 p-4 bg-muted/5 flex items-center justify-center overflow-auto">
				{#if previewOpen && previewUrl}
					{#if previewType === 'image'}
						<img
							src={previewUrl}
							alt={previewTitle}
							class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
						/>
					{:else}
						<iframe
							src={previewUrl}
							title={previewTitle}
							class="w-full h-full border-0 rounded-lg bg-background shadow-lg"
							style="min-height: calc(95vh - 120px)"
						></iframe>
					{/if}
				{/if}
			</div>
		</Drawer.Content>
	</Drawer.Root>
{/if}

<div class="w-full space-y-8 pb-32">
	<!-- Navigation & Status Header -->
	<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<Button
				variant="ghost"
				size="icon"
				href="/application"
				class="rounded-full"
			>
				<ArrowLeft class="h-5 w-5" />
			</Button>
			<div>
				<h1 class="text-2xl font-bold tracking-tight">Application Form</h1>
				<p class="text-xs text-muted-foreground font-mono opacity-60">
					ID: {admission.id}
				</p>
			</div>
		</div>
		<div class="flex flex-col items-end gap-1">
			{#if admission.status && statusMap[admission.status]}
				<Badge
					variant="outline"
					class="uppercase font-mono text-[10px] tracking-widest px-2.5 py-0.5 {statusMap[
						admission.status
					].color}"
				>
					{statusMap[admission.status].label}
				</Badge>
			{/if}
		</div>
	</div>

	{#if isAdmin || (admission.status && admission.status !== 'draft')}
		<Card.Root class="shadow-sm border-primary/20 bg-primary/5 overflow-hidden">
			<Card.Header
				class="bg-primary/10 py-4 flex flex-row items-center justify-between"
			>
				<div>
					<Card.Title class="text-lg flex items-center gap-2">
						<ShieldCheck class="h-5 w-5 text-primary" />
						Admin Management
					</Card.Title>
					<Card.Description
						>Review and update application status</Card.Description
					>
				</div>
				<Badge variant="outline" class="bg-background font-bold tracking-wider">
					{admission.status?.toUpperCase().replace("_", " ")}
				</Badge>
			</Card.Header>
			<Card.Content class="pt-6">
				<form
					method="POST"
					action="?/updateStatus"
					use:enhance={handleUpdateStatus}
					class="grid md:grid-cols-3 gap-6 items-end"
				>
					<div class="space-y-2">
						<Label for="status">Current Status</Label>
						<SelectComponent
							name="status"
							placeholder="Select status"
							options={statusOptions}
							bind:value={admission.status}
							disabled={!isAdmin}
						/>
					</div>
					<div class="md:col-span-2 space-y-2 relative">
						<Label for="adminNotes"
							>Internal Admin Notes (Visible to Student)</Label
						>
						<div class="flex gap-3">
							<Textarea
								name="adminNotes"
								bind:value={admission.adminNotes}
								placeholder="Admin feedback will appear here..."
								class="min-h-[40px] flex-1 bg-background"
								disabled={!isAdmin}
							/>
							{#if isAdmin}
								<Button type="submit" disabled={isUpdatingStatus} class="h-auto">
									{#if isUpdatingStatus}
										<Loader2 class="h-4 w-4 animate-spin" />
									{:else}
										Update
									{/if}
								</Button>
							{/if}
						</div>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<form
		id="application-form"
		method="POST"
		action="?/save"
		use:enhance={() => handleEnhance('save')}
		class="space-y-8"
	>
		<!-- 1. Programme Selection -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<PlusCircle class="h-5 w-5 text-primary" />
					Programme Interest
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid md:grid-cols-2 gap-6 pt-6">
				<div class="space-y-2">
					<Label for="programType">Program Type</Label>
					<SelectComponent
						placeholder="Enter program type"
						name="programType"
						options={programTypes}
						bind:value={admission.programType}
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="programmeInterest1">Primary Choice of Course</Label>
					<Input
						name="programmeInterest1"
						bind:value={admission.programmeInterest1}
						placeholder="e.g. Computer Science"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="programmeInterest2">Secondary Choice (Optional)</Label>
					<Input
						name="programmeInterest2"
						bind:value={admission.programmeInterest2}
						placeholder="e.g. Data Science"
						disabled={isReadOnly}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 2. Personal Information -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<User class="h-5 w-5 text-primary" />
					Personal Information
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid md:grid-cols-2 gap-6 pt-6">
				<div class="space-y-2">
					<Label for="fullName">Full Name (as in Passport)</Label>
					<Input
						name="fullName"
						bind:value={admission.fullName}
						required
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="email">Email Address</Label>
					<Input
						name="email"
						type="email"
						bind:value={admission.email}
						required
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="phone">Phone Number</Label>
					<Input
						name="phone"
						bind:value={admission.phone}
						placeholder="+234..."
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="dateOfBirth">Date of Birth</Label>
					<Input
						name="dateOfBirth"
						type="date"
						bind:value={admission.dateOfBirth}
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2 md:col-span-2">
					<Label for="address">Residential Address</Label>
					<Textarea
						name="address"
						bind:value={admission.address}
						placeholder="Enter your full home address"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="maritalStatus">Marital Status</Label>
					<SelectComponent
						placeholder="Marital Status"
						name="maritalStatus"
						options={maritalOptions}
						bind:value={admission.maritalStatus}
						disabled={isReadOnly}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 3. Academic Information -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<GraduationCap class="h-5 w-5 text-primary" />
					Academic Background
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid md:grid-cols-2 gap-6 pt-6">
				<div class="space-y-2">
					<Label for="highestQualification">Highest Qualification</Label>
					<SelectComponent
						placeholder="Highest Qualification"
						name="highestQualification"
						options={qualificationOptions}
						bind:value={admission.highestQualification}
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="course">Last Course of Study</Label>
					<Input
						name="course"
						bind:value={admission.course}
						placeholder="e.g. Accounting"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="yearOfGraduation">Year of Graduation</Label>
					<Input
						name="yearOfGraduation"
						bind:value={admission.yearOfGraduation}
						placeholder="YYYY"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="grade">Final Grade / Class</Label>
					<Input
						name="grade"
						bind:value={admission.grade}
						placeholder="e.g. Second Class Upper"
						disabled={isReadOnly}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 5. Location & Budget -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<MapPin class="h-5 w-5 text-primary" />
					Location & Budget
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid md:grid-cols-2 gap-6 pt-6">
				<div class="space-y-2">
					<Label for="countryChoice">Preferred Study Country</Label>
					<Input
						name="countryChoice"
						bind:value={admission.countryChoice}
						placeholder="e.g. UK, Canada"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="cityChoice">Preferred City (Optional)</Label>
					<Input
						name="cityChoice"
						bind:value={admission.cityChoice}
						placeholder="e.g. London, Toronto"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="tuitionBudget">Total Tuition Budget</Label>
					<Input
						name="tuitionBudget"
						bind:value={admission.tuitionBudget}
						placeholder="e.g. £15,000"
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="depositBudget">Total Deposit Budget</Label>
					<Input
						name="depositBudget"
						bind:value={admission.depositBudget}
						placeholder="e.g. £5,000"
						disabled={isReadOnly}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 6. Support Services -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<ShieldCheck class="h-5 w-5 text-primary" />
					Support Services (Optional)
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
				<div class="space-y-2">
					<Label for="immigrationSupport">Immigration Support</Label>
					<SelectComponent
						placeholder="Immigration Support"
						name="immigrationSupport"
						options={supportOptions}
						bind:value={admission.immigrationSupport}
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="accommodationSupport">Accommodation Support</Label>
					<SelectComponent
						placeholder="Accommodation Support"
						name="accommodationSupport"
						options={supportOptions}
						bind:value={admission.accommodationSupport}
						disabled={isReadOnly}
					/>
				</div>
				<div class="space-y-2">
					<Label for="jobSupport">Job Support</Label>
					<SelectComponent
						placeholder="Job Support"
						name="jobSupport"
						options={supportOptions}
						bind:value={admission.jobSupport}
						disabled={isReadOnly}
					/>
				</div>
			</Card.Content>
		</Card.Root>

		<!-- 7. Additional Info -->
		<Card.Root class="shadow-sm border-primary/10 overflow-hidden">
			<Card.Header class="bg-primary/5 py-4">
				<Card.Title class="text-lg flex items-center gap-2">
					<FileText class="h-5 w-5 text-primary" />
					Additional Information
				</Card.Title>
			</Card.Header>
			<Card.Content class="grid md:grid-cols-2 gap-6 pt-6">
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="visaRefusedBefore">Have you been refused a visa before?</Label>
						<SelectComponent
							placeholder="Visa Refused Before"
							name="visaRefusedBefore"
							options={visaOptions}
							bind:value={admission.visaRefusedBefore}
							disabled={isReadOnly}
						/>
					</div>
					
					<div class="space-y-2">
						<Label for="appliedToOtherSchool">Have you applied to another school?</Label>
						<SelectComponent
							placeholder="Applied To Other School"
							name="appliedToOtherSchool"
							options={appliedBeforeOptions}
							bind:value={appliedToggle}
							disabled={isReadOnly}
						/>
						{#if appliedToggle === "yes"}
							<Input 
								name="appliedToOtherSchool" 
								bind:value={admission.appliedToOtherSchool} 
								placeholder="Please mention the schools..." 
								class="mt-2"
								disabled={isReadOnly}
							/>
						{/if}
					</div>
				</div>

				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="travelingWithOthers">Is anybody traveling with you?</Label>
						<SelectComponent
							placeholder="Traveling With Others"
							name="travelingWithOthers"
							options={travelingOptions}
							bind:value={travelingToggle}
							disabled={isReadOnly}
						/>
						{#if travelingToggle === "yes"}
							<Input 
								name="travelingWithOthers" 
								bind:value={admission.travelingWithOthers} 
								placeholder="How many people are traveling with you?" 
								class="mt-2"
								disabled={isReadOnly}
							/>
						{/if}
					</div>

					{#if admission.programType?.includes("masters")}
						<div class="space-y-2">
							<Label for="dependants">How many dependants? (Specialists)</Label>
							<Input
								name="dependants"
								type="number"
								bind:value={admission.dependants}
								disabled={isReadOnly}
							/>
						</div>
					{/if}
				</div>

				{#if admission.programType?.includes("masters")}
					<div class="space-y-2 md:col-span-2">
						<Label for="personalStatement">Personal Statement</Label>
						<div class="rounded-xl border bg-background overflow-hidden p-1">
							<Textarea
								name="personalStatement"
								bind:value={admission.personalStatement}
								placeholder="Write your personal statement here..."
								class="min-h-[150px] border-0 focus-visible:ring-0"
								disabled={isReadOnly}
							/>
						</div>
					</div>
				{/if}

				{#if admission.programType === "research_masters"}
					<div class="space-y-2 md:col-span-2">
						<Label for="proposal">Research Proposal (Initial Draft)</Label>
						<div class="rounded-xl border bg-background overflow-hidden p-1">
							<Textarea
								name="proposal"
								bind:value={admission.proposal}
								placeholder="Briefly outline your research proposal..."
								class="min-h-[150px] border-0 focus-visible:ring-0"
								disabled={isReadOnly}
							/>
						</div>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</form>

	<!-- 4. Document Uploads (OUTSIDE form — async XHR) -->
	<Card.Root class="shadow-sm border-primary/10 overflow-hidden bg-muted/5">
		<Card.Header class="bg-primary/5 py-4 border-b">
			<Card.Title class="text-lg flex items-center gap-2">
				<UploadCloud class="h-5 w-5 text-primary" />
				Document Uploads
			</Card.Title>
			<Card.Description>
				Files upload individually and instantly. PDF, JPEG, PNG accepted (max
				10MB).
			</Card.Description>
		</Card.Header>
		<Card.Content class="p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				{#each DOCUMENT_FIELDS as field}
					{@const docs = uploads[field.key]}
					<div class="space-y-4 p-4 rounded-xl border bg-background/50">
						<div class="flex items-center justify-between">
							<div class="flex items-center gap-2">
								<Label class="text-sm font-bold">{field.label}</Label>
								<Badge variant="outline" class="font-mono text-[10px] opacity-60">
									{docs.length} / 5
								</Badge>
							</div>
						</div>

						<div class="space-y-3">
							{#each docs as doc}
								<div class="flex flex-col gap-2 p-3 rounded-lg border bg-background shadow-sm">
									<div class="flex items-center justify-between gap-3">
										<div class="flex items-center gap-2 min-w-0">
											<FileText class="h-4 w-4 text-primary shrink-0" />
											<span class="text-xs truncate font-medium">
												{doc.fileName || 'Untitled Document'}
											</span>
										</div>
										<div class="flex items-center gap-1.5 shrink-0">
											{#if doc.status === "success"}
												<Button
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-primary"
													onclick={() => openPreview(doc.fileUrl, field.label, doc.fileType)}
												>
													<Eye class="h-4 w-4" />
												</Button>
												{#if !isReadOnly}
													<Button
														variant="ghost"
														size="icon"
														class="h-8 w-8 text-destructive hover:bg-destructive/10"
														onclick={() => deleteFile(field.key, doc)}
													>
														<Trash2 class="h-4 w-4" />
													</Button>
												{/if}
											{:else if doc.status === "uploading"}
												<div class="flex items-center gap-2 px-2 py-1 bg-primary/5 rounded-md">
													<Loader2 class="h-3 w-3 animate-spin text-primary" />
													<span class="text-[10px] font-bold text-primary">{doc.progress}%</span>
												</div>
											{:else if doc.status === "deleting"}
												<Loader2 class="h-4 w-4 animate-spin text-muted-foreground" />
											{:else if doc.status === "error"}
												<Badge variant="outline" class="bg-red-50 text-red-600 border-red-100 text-[10px]">
													Error
												</Badge>
												{#if !isReadOnly}
													<Button
														variant="ghost"
														size="icon"
														class="h-8 w-8 text-destructive"
														onclick={() => deleteFile(field.key, doc)}
													>
														<X class="h-4 w-4" />
													</Button>
												{/if}
											{/if}
										</div>
									</div>

									{#if doc.status === "uploading"}
										<div class="h-1 w-full bg-muted rounded-full overflow-hidden">
											<div 
												class="h-full bg-primary transition-all duration-300"
												style="width: {doc.progress}%"
											></div>
										</div>
									{/if}

									{#if doc.status === "error" && doc.error}
										<p class="text-[10px] text-red-500 italic px-1">
											{doc.error}
										</p>
									{/if}
								</div>
							{/each}

							{#if docs.length < 5 && !isReadOnly}
								<div class="relative">
									<input
										type="file"
										accept=".pdf,.jpg,.jpeg,.png"
										onchange={(e) => handleFileSelect(field.key, e)}
										disabled={isReadOnly}
										class="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
									/>
									<div class="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20">
										<PlusCircle class="h-4 w-4 text-primary" />
										<span class="text-xs font-semibold text-primary">Add {field.label}</span>
									</div>
								</div>
							{:else if docs.length === 0}
								<div class="flex flex-col items-center justify-center py-6 border-2 border-dashed rounded-lg bg-muted/20 border-muted-foreground/10">
									<UploadCloud class="h-8 w-8 text-muted-foreground/30 mb-2" />
									<p class="text-xs text-muted-foreground italic">No documents uploaded yet</p>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Sticky Action Bar -->
	<div
		class="fixed bottom-0 left-0 right-0 md:left-72 bg-background/80 backdrop-blur-md border-t p-4 flex items-center justify-between gap-4 z-50"
	>
		<div class="hidden md:block text-sm text-muted-foreground font-medium">
			{isApproved ? 'This application is approved and locked.' : 'Update your information and upload required documents.'}
		</div>
		<div class="flex items-center gap-3 w-full md:w-auto">
			{#if isOwner && !isApproved}
				<Button
					form="application-form"
					type="submit"
					disabled={isSaving || isSubmitting}
					variant="outline"
					class="flex-1 md:flex-none"
				>
					{#if isSaving}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Saving...
					{:else}
						<Save class="h-4 w-4 mr-2" />
						Save Changes
					{/if}
				</Button>

				<form
					action="?/submit"
					method="POST"
					use:enhance={() => handleEnhance('submit')}
					class="flex-1 md:flex-none"
				>
					<!-- Pass form data to submit action as well -->
					{#each Object.entries(admission) as [key, value]}
						{#if typeof value === 'string' || typeof value === 'number'}
							<input type="hidden" name={key} value={value} />
						{/if}
					{/each}
					
					<Button
						type="submit"
						disabled={isSaving || isSubmitting}
						class="w-full shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]"
					>
						{#if isSubmitting}
							<Loader2 class="h-4 w-4 mr-2 animate-spin" />
							Submitting...
						{:else}
							<Send class="h-4 w-4 mr-2" />
							Submit Application
						{/if}
					</Button>
				</form>
			{:else if isAdmin}
				<div
					class="text-sm font-semibold text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 flex items-center gap-2"
				>
					<ShieldCheck class="h-4 w-4" />
					Admin Review Mode
				</div>
			{:else if isApproved}
				<div
					class="text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2"
				>
					<ShieldCheck class="h-4 w-4" />
					Admission Granted - View Only
				</div>
			{/if}
		</div>
	</div>
</div>
