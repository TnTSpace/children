import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOrCreateWallet, getLedger } from '$lib/db/media-queries';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/auth/login?redirectTo=/credits');
  const [wallet, ledger] = await Promise.all([
    getOrCreateWallet(locals.user.id),
    getLedger(locals.user.id, 100)
  ]);
  return { wallet, ledger };
};
