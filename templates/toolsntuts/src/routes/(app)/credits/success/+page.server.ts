import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import {
  getOrCreateWallet,
  creditCredits,
  hasStripeSessionCredited
} from '$lib/db/media-queries';

const PACK_LABELS: Record<string, string> = {
  starter: 'Starter Pack (500 credits)',
  builder: 'Builder Pack (2,000 credits)',
  power: 'Power Pack (6,000 credits)',
  mega: 'Mega Pack (20,000 credits)'
};

/**
 * Server-side fallback: if the Stripe webhook missed or failed, this load
 * function retrieves the checkout session directly from Stripe, verifies
 * payment, checks idempotency, and credits the user before the page renders.
 *
 * No double-crediting: hasStripeSessionCredited() blocks if webhook already ran.
 */
export const load: PageServerLoad = async ({ url, locals }) => {
  const pack = url.searchParams.get('pack') ?? '';
  const sessionId = url.searchParams.get('session_id') ?? '';
  const packLabel = PACK_LABELS[pack] ?? 'Credit pack';

  // Can't verify without Stripe key, user, or session_id
  if (!env.STRIPE_SECRET_KEY || !locals.user || !sessionId) {
    return { pack, packLabel, credited: false, newBalance: null };
  }

  // Idempotency: webhook may have already credited this session
  const alreadyCredited = await hasStripeSessionCredited(sessionId);
  if (alreadyCredited) {
    const wallet = await getOrCreateWallet(locals.user.id);
    return { pack, packLabel, credited: true, newBalance: wallet.balance };
  }

  // Fetch session directly from Stripe
  let session: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
    });
    if (res.ok) session = await res.json() as Record<string, unknown>;
  } catch (e) {
    console.error('[credits/success] Stripe session fetch failed:', e);
  }

  if (!session) {
    return { pack, packLabel, credited: false, newBalance: null };
  }

  const metadata = session.metadata as Record<string, string> | null;

  // Security: payment must be paid AND belong to THIS user
  if (
    session.payment_status !== 'paid' ||
    metadata?.userId !== locals.user.id
  ) {
    return { pack, packLabel, credited: false, newBalance: null };
  }

  const credits = Number(metadata?.credits ?? 0);
  if (credits <= 0) {
    return { pack, packLabel, credited: false, newBalance: null };
  }

  // Credit — success page fallback (webhook missed/late)
  try {
    const newBalance = await creditCredits({
      userId: locals.user.id,
      amount: credits,
      reason: 'topup',
      meta: {
        pack,
        stripeSessionId: sessionId,
        source: 'success_page_fallback',
        stripePaid: session.amount_total
      }
    });
    console.log(`[credits/success] Fallback credited ${credits} to ${locals.user.id}`);
    return { pack, packLabel, credited: true, newBalance };
  } catch (e) {
    console.error('[credits/success] Fallback credit failed:', e);
    return { pack, packLabel, credited: false, newBalance: null };
  }
};
