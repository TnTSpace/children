import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectWorkspace, getOrCreateWallet } from '$lib/db/media-queries';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(302, `/auth/login?redirectTo=/projects/${params.id}`);
  const ws = await getProjectWorkspace(params.id, locals.user.id);
  if (!ws) throw error(404, 'Project not found');
  const wallet = await getOrCreateWallet(locals.user.id);
  return { ...ws, wallet };
};
