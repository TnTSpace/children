import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db/drizzle';
import { admission_application as admission } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { adminRoles, Role } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
	const role = locals?.user?.role as Role
	if (!locals.user || !adminRoles.includes(role)) {
		throw error(403, 'Forbidden');
	}
	
	// Initial data fetch - infinite scroll will handle subsequent pages
	const initialApplications = await db
		.select()
		.from(admission)
		.limit(12)
		.orderBy(admission.updatedAt);
	
	return {
		initialApplications
	};
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const role = locals?.user?.role as Role
		if (!locals.user || !adminRoles.includes(role)) {
			throw error(403, 'Forbidden');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;
		const status = formData.get('status') as any;
		const adminNotes = formData.get('adminNotes') as string;

		if (!id || !status) return fail(400, { message: 'Missing ID or status' });

		try {
			await db.update(admission)
				.set({ 
					status, 
					adminNotes,
					updatedAt: new Date() 
				})
				.where(eq(admission.id, id));
			
			return { success: true, message: 'Application updated successfully' };
		} catch (e) {
			console.error('Error updating admission status:', e);
			return fail(500, { message: 'Failed to update status' });
		}
	}
};
