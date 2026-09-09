import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getOrCreateWallet, getLedger } from '$lib/db/media-queries';
import { STARTER_CREDITS } from '$lib/constants/media';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const [wallet, ledger] = await Promise.all([
    getOrCreateWallet(locals.user.id),
    getLedger(locals.user.id, 10)
  ]);

  // Map ledger entries to the Tx shape CreditBalance.svelte expects
  const recent = ledger.map((entry) => ({
    id: entry.id,
    amount: entry.amount,
    balanceAfter: entry.balanceAfter,
    type: entry.reason,
    operation: entry.modelKey ?? null,
    description: null as string | null,
    createdAt: entry.createdAt,
  }));

  return json({
    ok: true,
    balance: wallet.balance,
    monthlyAllocation: STARTER_CREDITS,
    topupBalance: 0,
    recent,
  });
};
