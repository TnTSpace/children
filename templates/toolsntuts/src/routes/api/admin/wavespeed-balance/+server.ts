import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const WS_BASE = 'https://api.wavespeed.ai/api/v3';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) return json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  if (locals.user.role !== 'superadmin') {
    return json({ ok: false, error: 'Forbidden' }, { status: 403 });
  }

  const apiKey = env.WAVESPEED_API_KEY?.trim();
  if (!apiKey) return json({ ok: false, error: 'WAVESPEED_API_KEY not configured' }, { status: 500 });

  try {
    // Try several known WaveSpeed balance endpoints
    const endpoints = [
      `${WS_BASE}/user/balance`,
      `${WS_BASE}/account/balance`,
      `${WS_BASE}/balance`,
    ];

    let remaining = 0;
    let found = false;

    for (const url of endpoints) {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(8_000),
      });
      if (!res.ok) continue;
      const data = await res.json().catch(() => null);
      if (!data) continue;
      // Try common balance field paths
      const balance =
        data?.data?.remaining ??
        data?.data?.balance ??
        data?.remaining ??
        data?.balance ??
        data?.credits ??
        data?.data?.credits;
      if (typeof balance === 'number') {
        remaining = balance;
        found = true;
        break;
      }
    }

    if (!found) {
      // Return a placeholder so the widget still renders
      return json({ ok: true, remaining: null, message: 'Balance endpoint not available — check WaveSpeed dashboard' });
    }

    return json({ ok: true, remaining });
  } catch (err) {
    return json({ ok: false, error: String(err) }, { status: 500 });
  }
};
