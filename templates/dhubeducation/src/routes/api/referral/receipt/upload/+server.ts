import { json, error, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload } from '$lib/server/minio';
import { createFileRecord } from '$lib/db/crm';
import { updateReferee, getReferee } from '$lib/db/crm';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    throw error(403, 'Forbidden');
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const refereeId = formData.get('refereeId') as string | null;
  const rewardAmount = formData.get('rewardAmount') as string | null;

  if (!file || !refereeId) {
    return json({ error: 'Missing file or refereeId' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
  }

  try {
    const existingReferee = await getReferee(refereeId);
    if (!existingReferee) {
      return json({ error: 'Referee not found' }, { status: 404 });
    }

    // Upload to MinIO
    const result = await handleFileUpload(file);

    // Determine file type
    const contentType = result.contentType || '';
    let fileType = 'file';
    if (contentType.startsWith('image/')) fileType = 'image';

    // Create file record in DB
    await createFileRecord({
      id: result.id,
      url: result.directUrl,
      directUrl: result.directUrl,
      fileId: result.id,
      size: String(result.size),
      type: fileType,
    });

    // Update referee data with receipt info and reward amount
    const existingData = existingReferee.data ? JSON.parse(existingReferee.data) : {};
    const updatedData = {
      ...existingData,
      receiptFileId: result.id,
      receiptUrl: result.directUrl,
      receiptFileName: result.filename,
      receiptFileType: fileType,
      paymentStatus: 'paid',
      paidAt: new Date().toISOString(),
      rewardAmount: rewardAmount ? parseFloat(rewardAmount) : existingData.rewardAmount
    };

    await updateReferee(refereeId, {
      data: JSON.stringify(updatedData),
    });

    return json({
      success: true,
      fileId: result.id,
      url: result.directUrl,
      fileType,
      fileName: result.filename,
    });
  } catch (e) {
    console.error('Referral receipt upload error:', e);
    return json({ error: (e as Error)?.message || 'Upload failed' }, { status: 500 });
  }
};
