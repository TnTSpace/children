import { json, error, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload } from '$lib/server/minio';
import { createFileRecord } from '$lib/db/crm';
import { db } from '$lib/db/drizzle';
import { admission_application as admission, admission_document } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

const VALID_FIELDS = [
	'passport', 'waec', 'ielts', 'transcript',
	'certificate', 'cv', 'referenceLetter'
] as const;

type ValidField = typeof VALID_FIELDS[number];

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');

	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const field = formData.get('field') as string | null;
	const admissionId = formData.get('admissionId') as string | null;

	if (!file || !field || !admissionId) {
		return json({ error: 'Missing file, field, or admissionId' }, { status: 400 });
	}

	if (!VALID_FIELDS.includes(field as ValidField)) {
		return json({ error: `Invalid field: ${field}` }, { status: 400 });
	}

	if (file.size > 10 * 1024 * 1024) {
		return json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
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

		// 2. Upload to MinIO
		const result = await handleFileUpload(file);

		// 3. Create file record in DB
		const contentType = result.contentType || '';
		let fileType = 'file';
		if (contentType.startsWith('image/')) fileType = 'image';

		await createFileRecord({
			id: result.id,
			url: result.directUrl,
			directUrl: result.directUrl,
			fileId: result.id,
			size: String(result.size),
			type: fileType,
		});

		// 4. Link file via admission_document table
		await db.insert(admission_document).values({
			id: crypto.randomUUID(),
			admissionId,
			category: field,
			fileId: result.id,
			createdAt: new Date(),
		});

		// Update application timestamp
		await db.update(admission).set({ updatedAt: new Date() }).where(eq(admission.id, admissionId));

		return json({
			success: true,
			fileId: result.id,
			url: result.directUrl,
			fileType,
			field,
		});
	} catch (e) {
		console.error('Admission file upload error:', e);
		return json({ error: (e as Error)?.message || 'Upload failed' }, { status: 500 });
	}
};
