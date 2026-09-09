import { error, fail, redirect, isRedirect, isHttpError } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getAdmission } from '$lib/db/admission';
import { db } from '$lib/db/drizzle';
import { admission_application as admission } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { adminRoles, Role } from '$lib/constants';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(302, '/auth/login');

	const application = await getAdmission(params.id);
	const role = locals.user.role as Role;
	const isAdmin = adminRoles.includes(role);
	const isOwner = application?.userId === locals.user.id;

	if (!application || (!isOwner && !isAdmin)) {
		throw error(404, 'Application not found');
	}

	return {
		admission: application,
		isAdmin,
		isOwner
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const application = await getAdmission(params.id);
		if (!application) throw error(404, 'Application not found');
		
		if (application.userId !== locals.user.id) {
			throw error(403, 'Only the owner can edit this application');
		}

		if (application.status === 'approved') {
			return fail(403, { message: 'Application is approved and cannot be edited' });
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const updates: Record<string, any> = {
			programType: data.programType as string,
			programmeInterest1: data.programmeInterest1 as string,
			programmeInterest2: data.programmeInterest2 as string,
			fullName: data.fullName as string,
			email: data.email as string,
			phone: data.phone as string,
			address: data.address as string,
			maritalStatus: data.maritalStatus as string,
			highestQualification: data.highestQualification as string,
			countryChoice: data.countryChoice as string,
			cityChoice: data.cityChoice as string,
			course: data.course as string,
			yearOfGraduation: data.yearOfGraduation as string,
			grade: data.grade as string,
			budget: data.budget as string,
			visaRefusedBefore: data.visaRefusedBefore as string,
			dateOfBirth: data.dateOfBirth as string,
			dependants: data.dependants as string,
			personalStatement: data.personalStatement as string,
			proposal: data.proposal as string,

			// New Fields
			appliedToOtherSchool: data.appliedToOtherSchool as string,
			travelingWithOthers: data.travelingWithOthers as string,
			tuitionBudget: data.tuitionBudget as string,
			depositBudget: data.depositBudget as string,
			immigrationSupport: data.immigrationSupport as string,
			accommodationSupport: data.accommodationSupport as string,
			jobSupport: data.jobSupport as string,

			updatedAt: new Date(),
		};

		try {
			await db.update(admission)
				.set(updates)
				.where(
					and(
						eq(admission.id, params.id),
						eq(admission.userId, locals.user.id)
					)
				);
			return { success: true, message: 'Application saved successfully' };
		} catch (e) {
			console.error('Error saving admission:', e);
			return fail(500, { message: 'Failed to save progress' });
		}
	},

	submit: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const application = await getAdmission(params.id);
		if (!application) throw error(404, 'Application not found');

		if (application.userId !== locals.user.id) {
			throw error(403, 'Only the owner can submit this application');
		}

		if (application.status === 'approved') {
			return fail(403, { message: 'Application is approved and cannot be edited' });
		}

		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const updates: Record<string, any> = {
			programType: data.programType as string,
			programmeInterest1: data.programmeInterest1 as string,
			programmeInterest2: data.programmeInterest2 as string,
			fullName: data.fullName as string,
			email: data.email as string,
			phone: data.phone as string,
			address: data.address as string,
			maritalStatus: data.maritalStatus as string,
			highestQualification: data.highestQualification as string,
			countryChoice: data.countryChoice as string,
			cityChoice: data.cityChoice as string,
			course: data.course as string,
			yearOfGraduation: data.yearOfGraduation as string,
			grade: data.grade as string,
			budget: data.budget as string,
			visaRefusedBefore: data.visaRefusedBefore as string,
			dateOfBirth: data.dateOfBirth as string,
			dependants: data.dependants as string,
			personalStatement: data.personalStatement as string,
			proposal: data.proposal as string,

			// New Fields
			appliedToOtherSchool: data.appliedToOtherSchool as string,
			travelingWithOthers: data.travelingWithOthers as string,
			tuitionBudget: data.tuitionBudget as string,
			depositBudget: data.depositBudget as string,
			immigrationSupport: data.immigrationSupport as string,
			accommodationSupport: data.accommodationSupport as string,
			jobSupport: data.jobSupport as string,

			status: 'submitted',
			updatedAt: new Date(),
		};

		try {
			await db.update(admission)
				.set(updates)
				.where(
					and(
						eq(admission.id, params.id),
						eq(admission.userId, locals.user.id)
					)
				);

			return { success: true, message: 'Application submitted successfully' };
		} catch (e) {
			if (isRedirect(e) || isHttpError(e)) throw e;
			console.error('Error submitting admission:', e);
			return fail(500, { message: 'Failed to submit application' });
		}
	},

	updateStatus: async ({ request, params, locals }) => {
		const role = locals?.user?.role as Role;
		if (!locals.user || !adminRoles.includes(role)) {
			throw error(403, 'Forbidden');
		}

		const formData = await request.formData();
		const status = formData.get('status') as any;
		const adminNotes = formData.get('adminNotes') as string;

		if (!status) return fail(400, { message: 'Missing status' });

		try {
			await db.update(admission)
				.set({
					status,
					adminNotes,
					updatedAt: new Date()
				})
				.where(eq(admission.id, params.id));

			return { success: true, message: 'Application status updated successfully' };
		} catch (e) {
			console.error('Error updating admission status:', e);
			return fail(500, { message: 'Failed to update status' });
		}
	}
};
