import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const PACKS = {
  starter: { credits: 500, price_cents: 500, label: 'Starter Pack — 500 credits' },
  builder: { credits: 2000, price_cents: 1500, label: 'Builder Pack — 2,000 credits' },
  power: { credits: 6000, price_cents: 4000, label: 'Power Pack — 6,000 credits' },
  mega: { credits: 20000, price_cents: 10000, label: 'Mega Pack — 20,000 credits' },
} as const;

export const POST: RequestHandler = async ({ request, locals, url }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({})) as { pack?: string };
  const pack = PACKS[body.pack as keyof typeof PACKS];
  if (!pack) return json({ ok: false, error: 'Invalid pack' }, { status: 400 });

  const secretKey = env.STRIPE_SECRET_KEY;
  if (!secretKey) return json({ ok: false, error: 'Stripe not configured' }, { status: 500 });

  const origin = url.origin;
  const successUrl = `${origin}/credits/success?pack=${body.pack}&session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${origin}/pricing?cancelled=1`;

  const params = new URLSearchParams({
    'mode': 'payment',
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'usd',
    'line_items[0][price_data][product_data][name]': pack.label,
    'line_items[0][price_data][product_data][description]': `Add ${pack.credits.toLocaleString()} credits to your toolsntuts account`,
    'line_items[0][price_data][unit_amount]': String(pack.price_cents),
    'line_items[0][quantity]': '1',
    'success_url': successUrl,
    'cancel_url': cancelUrl,
    'metadata[userId]': locals.user.id,
    'metadata[pack]': body.pack!,
    'metadata[credits]': String(pack.credits),
    'customer_email': locals.user.email ?? '',
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) return json({ ok: false, error: data?.error?.message || 'Stripe error' }, { status: 500 });
  return json({ ok: true, url: data.url });
};
