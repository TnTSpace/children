import { json, error, type RequestHandler } from '@sveltejs/kit';
import { deleteFileById } from '$lib/server/minio';
import { deleteFileRecord } from '$lib/db/crm';
import { db } from '$lib/db/drizzle';
import { admission_application as admission, admission_document } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.MINIO_BUCKET || 'uploads';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const { admissionId, fileId, documentId } = await request.json();

	if (!admissionId || !fileId) {
		return json({ error: 'Missing admissionId or fileId' }, { status: 400 });
	}

	try {
		// 1. Verify ownership and check status
		const [app] = await db
			.select({ id: admission.id, status: admission.status })
			.from(admission)
			.where(and(
				eq(admission.id, admissionId),
				eq(admission.userId, locals.user.id)
			));

		if (!app) {
			return json({ error: 'Application not found' }, { status: 404 });
		}

		if (app.status === 'approved') {
			return json({ error: 'Application is approved and cannot be edited' }, { status: 403 });
		}

		// 2. Unlink file from admission (delete from admission_document)
		if (documentId) {
			await db.delete(admission_document)
				.where(and(
					eq(admission_document.id, documentId),
					eq(admission_document.admissionId, admissionId)
				));
		} else {
			// Fallback for old system if documentId is not provided
			await db.delete(admission_document)
				.where(and(
					eq(admission_document.fileId, fileId),
					eq(admission_document.admissionId, admissionId)
				));
		}

		// Update application timestamp
		await db.update(admission).set({ updatedAt: new Date() }).where(eq(admission.id, admissionId));

		// 3. Delete file record from DB
		await deleteFileRecord(fileId);

		// 4. Delete from MinIO
		try {
			await deleteFileById(BUCKET_NAME, fileId);
		} catch (e) {
			console.warn('MinIO delete failed:', e);
		}

		return json({ success: true });
	} catch (e) {
		console.error('Admission file delete error:', e);
		return json({ error: 'Delete failed' }, { status: 500 });
	}
};
