import { json, error, type RequestHandler } from '@sveltejs/kit';
import { deleteFileById } from '$lib/server/minio';
import { deleteFileRecord, updateReferee, getReferee } from '$lib/db/crm';
import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.MINIO_BUCKET || 'education';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');
  if (locals.user.role !== 'admin' && locals.user.role !== 'editor') {
    throw error(403, 'Forbidden');
  }

  const { refereeId, fileId } = await request.json();

  if (!refereeId || !fileId) {
    return json({ error: 'Missing refereeId or fileId' }, { status: 400 });
  }

  try {
    const existingReferee = await getReferee(refereeId);
    if (!existingReferee) {
      return json({ error: 'Referee not found' }, { status: 404 });
    }

    // Clear receipt data from referee
    const existingData = existingReferee.data ? JSON.parse(existingReferee.data) : {};
    const { receiptFileId, receiptUrl, receiptFileName, receiptFileType, paymentStatus, paidAt, ...restData } = existingData;
    
    await updateReferee(refereeId, {
      data: JSON.stringify(restData),
    });

    // Delete file record from DB
    await deleteFileRecord(fileId);

    // Delete from MinIO
    try {
      await deleteFileById(BUCKET_NAME, fileId);
    } catch (e) {
      console.warn('MinIO delete failed:', e);
    }

    return json({ success: true });
  } catch (e) {
    console.error('Referral receipt delete error:', e);
    return json({ error: 'Delete failed' }, { status: 500 });
  }
};
