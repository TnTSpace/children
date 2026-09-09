import { json, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload, deleteFileById, updateFile, listObjects, getDirectObjectUrl } from '$lib/server/minio';
import { createFileRecord } from '$lib/db/crm';
import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.MINIO_BUCKET || 'education';

/** Storage failures are configuration/infrastructure issues — report them verbatim. */
const fail = (error: unknown, fallback: string) => {
	console.error(`[api/files] ${fallback}:`, error);
	return json({ error: (error as Error)?.message || fallback }, { status: 500 });
};

export const GET: RequestHandler = async () => {
	try {
		const objects = await listObjects(BUCKET_NAME);
		const files = objects.map((obj: any) => ({
			id: obj.name, url: getDirectObjectUrl(BUCKET_NAME, obj.name),
			filename: obj.name.split('-').slice(1).join('-') || obj.name,
			size: obj.size, etag: obj.etag, uploadedAt: obj.lastModified
		}));
		return json({ success: true, files });
	} catch (error) { return fail(error, 'Failed to list files'); }
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file) return json({ error: 'No file uploaded' }, { status: 400 });
	try {
		const result = await handleFileUpload(file, BUCKET_NAME);

		// Determine file type from content type
		const contentType = result.contentType || '';
		let fileType = 'file';
		if (contentType.startsWith('image/')) fileType = 'image';
		else if (contentType.startsWith('video/')) fileType = 'video';
		else if (contentType.startsWith('audio/')) fileType = 'audio';

		// Register file in the database
		await createFileRecord({
			id: result.id,
			url: result.directUrl,
			directUrl: result.directUrl,
			fileId: result.id,
			size: String(result.size),
			type: fileType,
		});

		return json({ success: true, ...result });
	}
	catch (error) { return fail(error, 'Upload failed'); }
};

export const PUT: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const objectId = formData.get('id') as string | null;
	if (!file || !objectId) return json({ error: 'File and ID required' }, { status: 400 });
	try { const result = await updateFile(BUCKET_NAME, objectId, file); return json({ success: true, ...result }); }
	catch (error) { return fail(error, 'Update failed'); }
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	if (!id) return json({ error: 'ID required' }, { status: 400 });
	try {
		// Delete from MinIO
		await deleteFileById(BUCKET_NAME, id);
		// Delete from database
		const { deleteFileRecord } = await import('$lib/db/crm');
		await deleteFileRecord(id);
		return json({ success: true, message: 'File deleted successfully' });
	}
	catch (error) { return fail(error, 'Delete failed'); }
};
