import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { shot, asset, project } from '$lib/db/media';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * GET /api/projects/keyframes?projectId=xxx
 * Returns all shots with storyboard images for a project the user owns.
 * Used by the cross-project character seeding dialog.
 */
export const GET: RequestHandler = async ({ locals, url }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const projectId = url.searchParams.get('projectId');
  if (!projectId) return json({ ok: false, error: 'projectId is required' }, { status: 400 });

  // Verify the user owns this project
  const [proj] = await db.select({ id: project.id, title: project.title })
    .from(project)
    .where(and(eq(project.id, projectId), eq(project.userId, locals.user.id)))
    .limit(1);

  if (!proj) return json({ ok: false, error: 'Project not found' }, { status: 404 });

  // Get all shots for the project, filter to those with a keyframe in JS
  const allShots = await db.select({
    id: shot.id,
    shotNumber: shot.shotNumber,
    prompt: shot.prompt,
    keyframeAssetId: shot.keyframeAssetId,
  })
    .from(shot)
    .where(eq(shot.projectId, projectId));

  const shots = allShots.filter((s) => s.keyframeAssetId != null);

  if (!shots.length) return json({ ok: true, projectTitle: proj.title, keyframes: [] });

  const assetIds = shots.map((s) => s.keyframeAssetId!);
  const assets = await db.select({ id: asset.id, url: asset.url, mimeType: asset.mimeType })
    .from(asset)
    .where(inArray(asset.id, assetIds));

  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const keyframes = shots
    .map((s) => {
      const a = assetMap.get(s.keyframeAssetId!);
      if (!a?.url) return null;
      return { shotId: s.id, shotNumber: s.shotNumber, prompt: s.prompt, assetId: s.keyframeAssetId!, url: a.url };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => (a.shotNumber ?? 0) - (b.shotNumber ?? 0));

  return json({ ok: true, projectTitle: proj.title, keyframes });
};
