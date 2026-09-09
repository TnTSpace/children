import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectsByUser, getOrCreateWallet } from '$lib/db/media-queries';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/auth/login?redirectTo=/dashboard');
  const [projects, wallet] = await Promise.all([
    getProjectsByUser(locals.user.id),
    getOrCreateWallet(locals.user.id)
  ]);
  return { projects, wallet };
};
