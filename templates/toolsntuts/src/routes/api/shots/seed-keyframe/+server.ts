import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { shot, asset, project } from '$lib/db/media';
import { eq, and } from 'drizzle-orm';
import { createAsset, updateShot } from '$lib/db/media-queries';

/**
 * POST /api/shots/seed-keyframe
 * Body: { shotId, sourceAssetId }
 *
 * Imports a keyframe image from any project the user owns into the target shot.
 * Creates a lightweight asset copy (same storage URL, new projectId) and updates
 * the shot's keyframeAssetId — no re-download needed.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) throw error(401, 'Unauthorized');

  const body = await request.json().catch(() => ({})) as { shotId?: string; sourceAssetId?: string };
  if (!body.shotId || !body.sourceAssetId) {
    throw error(400, 'shotId and sourceAssetId are required');
  }

  // Verify the target shot belongs to a project the user owns
  const [targetShot] = await db.select({ id: shot.id, projectId: shot.projectId })
    .from(shot)
    .where(eq(shot.id, body.shotId))
    .limit(1);
  if (!targetShot) throw error(404, 'Shot not found');

  const [targetProj] = await db.select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, targetShot.projectId), eq(project.userId, locals.user.id)))
    .limit(1);
  if (!targetProj) throw error(403, 'Forbidden');

  // Fetch source asset — verify it also belongs to a project the user owns
  const [sourceAsset] = await db.select()
    .from(asset)
    .where(eq(asset.id, body.sourceAssetId))
    .limit(1);
  if (!sourceAsset) throw error(404, 'Source asset not found');

  const [sourceProj] = await db.select({ id: project.id })
    .from(project)
    .where(and(eq(project.id, sourceAsset.projectId!), eq(project.userId, locals.user.id)))
    .limit(1);
  if (!sourceProj) throw error(403, 'Source project forbidden');

  // If source already belongs to the target project, just set it directly
  if (sourceAsset.projectId === targetProj.id) {
    await updateShot(body.shotId, { keyframeAssetId: sourceAsset.id, status: 'storyboard_ready' });
    return json({ ok: true, assetId: sourceAsset.id, url: sourceAsset.url });
  }

  // Create a lightweight copy in the target project (shared storage URL, no re-download)
  const copy = await createAsset({
    projectId: targetProj.id,
    kind: 'image',
    bucket: sourceAsset.bucket ?? 'external',
    objectKey: sourceAsset.objectKey ?? sourceAsset.url ?? '',
    url: sourceAsset.url ?? undefined,
    mimeType: sourceAsset.mimeType ?? 'image/webp',
    sizeBytes: sourceAsset.sizeBytes ?? 0,
    meta: {
      ...(sourceAsset.meta as Record<string, unknown> ?? {}),
      importedFrom: sourceAsset.id,
      importedFromProject: sourceAsset.projectId,
    },
  });

  await updateShot(body.shotId, { keyframeAssetId: copy.id, status: 'storyboard_ready' });

  return json({ ok: true, assetId: copy.id, url: copy.url });
};
