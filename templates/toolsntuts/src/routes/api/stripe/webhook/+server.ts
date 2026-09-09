import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { creditCredits, hasStripeSessionCredited } from '$lib/db/media-queries';

async function verifyStripeSignature(payload: string, header: string | null, secret: string): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((p) => p.split('=')));
  const timestamp = parts['t'];
  const signature = parts['v1'];
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signed = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(signed)).map((b) => b.toString(16).padStart(2, '0')).join('');
  return expected === signature;
}

export const POST: RequestHandler = async ({ request }) => {
  const payload = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (env.STRIPE_WEBHOOK_SECRET) {
    const valid = await verifyStripeSignature(payload, sig, env.STRIPE_WEBHOOK_SECRET);
    if (!valid) return json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { type: string; data: { object: Record<string, unknown> } };
  try { event = JSON.parse(payload); } catch { return json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId as string | undefined;
    const credits = Number(session.metadata?.credits ?? 0);
    const pack = session.metadata?.pack as string | undefined;
    const stripeSessionId = session.id as string;

    if (!userId || !credits || credits <= 0) {
      console.error('[stripe webhook] Missing metadata:', session.metadata);
      return json({ received: true });
    }

    // Idempotency: success page fallback may have already credited this session
    const alreadyCredited = await hasStripeSessionCredited(stripeSessionId).catch(() => false);
    if (alreadyCredited) {
      console.log(`[stripe webhook] Session ${stripeSessionId} already credited — skipping`);
      return json({ received: true });
    }

    try {
      await creditCredits({
        userId,
        amount: credits,
        reason: 'topup',
        meta: { pack, stripeSessionId, source: 'webhook', stripePaid: session.amount_total }
      });
      console.log(`[stripe webhook] Credited ${credits} to ${userId} (pack: ${pack})`);
    } catch (err) {
      console.error('[stripe webhook] Failed to credit:', err);
      return json({ error: 'Credit failed' }, { status: 500 });
    }
  }

  return json({ received: true });
};
