import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProjectsByUser, getOrCreateWallet } from '$lib/db/media-queries';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/auth/login?redirectTo=/projects');
  if (locals.user.role !== 'admin' && locals.user.role !== 'superadmin') throw redirect(302, '/dashboard');
  const userId = locals.user.id;
  const [projects, wallet] = await Promise.all([getProjectsByUser(userId), getOrCreateWallet(userId)]);
  return { projects, wallet };
};
