import Redis from 'ioredis';
import { env } from '$env/dynamic/private';

/**
 * Redis/Valkey layer for safe parallel, multi-user operation.
 *
 * Server: Valkey (BSD-licensed Redis fork) — `docker run -p 6379:6379 valkey/valkey`.
 * Set REDIS_URL in .env (defaults to redis://localhost:6379).
 *
 * Provides what Windmill's job queue does NOT cover for the app itself:
 *  - cache()      : shared read-through cache (presigned URLs, model catalog, …)
 *  - rateLimit()  : per-user / per-provider throttling (protect credits + kie.ai quota)
 *  - withLock()   : distributed lock for idempotency (e.g. kie webhook callbacks)
 *  - publish()/subscribe() : live job-progress fan-out to browsers across instances
 */

const REDIS_URL = env.REDIS_URL || 'redis://localhost:6379';

// Cache the connection across Vite HMR reloads so dev doesn't leak sockets.
const g = globalThis as unknown as {
  __redis?: Redis;
  __redisSub?: Redis;
};

function create(): Redis {
  const client = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null, // never throw on transient blips; keep retrying
    enableReadyCheck: true,
    lazyConnect: false
  });
  client.on('error', (e) => console.error('[redis] error:', e.message));
  return client;
}

/** Shared command connection. */
export const redis: Redis = g.__redis ?? (g.__redis = create());

/** Separate connection for subscriptions (a subscribed client can't run commands). */
export const redisSub: Redis = g.__redisSub ?? (g.__redisSub = create());

/* -------------------------------------------------------------------------- */
/*  Read-through cache                                                         */
/* -------------------------------------------------------------------------- */
export async function cache<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const hit = await redis.get(key);
  if (hit !== null) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      /* fall through and recompute */
    }
  }
  const value = await producer();
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  return value;
}

export async function cacheInvalidate(...keys: string[]): Promise<void> {
  if (keys.length) await redis.del(...keys);
}

/* -------------------------------------------------------------------------- */
/*  Rate limiting — fixed window via INCR + EXPIRE                             */
/* -------------------------------------------------------------------------- */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

/**
 * @param key        unique bucket, e.g. `rl:gen:${userId}` or `rl:kie:global`
 * @param limit      max actions per window
 * @param windowSec  window length in seconds
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<RateLimitResult> {
  const k = `rl:${key}`;
  const count = await redis.incr(k);
  if (count === 1) await redis.expire(k, windowSec);
  const ttl = await redis.ttl(k);
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetSeconds: ttl < 0 ? windowSec : ttl
  };
}

/* -------------------------------------------------------------------------- */
/*  Distributed lock — SET NX PX (run a critical section at most once)         */
/* -------------------------------------------------------------------------- */
/**
 * Acquire `key` for `ttlMs`, run `fn`, then release (only if we still own it).
 * Returns `null` if the lock was already held (work was skipped — caller decides).
 * Ideal for webhook idempotency: withLock(`job:${jobId}:callback`, …).
 */
export async function withLock<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const lockKey = `lock:${key}`;
  const token = crypto.randomUUID();
  const acquired = await redis.set(lockKey, token, 'PX', ttlMs, 'NX');
  if (!acquired) return null;
  try {
    return await fn();
  } finally {
    // Compare-and-delete so we never release someone else's lock.
    await redis.eval(
      `if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end`,
      1,
      lockKey,
      token
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Pub/sub — live progress fan-out (e.g. to an SSE endpoint per project)      */
/* -------------------------------------------------------------------------- */
export async function publish(channel: string, payload: unknown): Promise<void> {
  await redis.publish(channel, JSON.stringify(payload));
}

/**
 * Subscribe to a channel; returns an unsubscribe function.
 * Use from a SvelteKit SSE route to stream job updates to the browser.
 */
export async function subscribe(channel: string, onMessage: (payload: unknown) => void): Promise<() => void> {
  const handler = (ch: string, message: string) => {
    if (ch !== channel) return;
    try {
      onMessage(JSON.parse(message));
    } catch {
      onMessage(message);
    }
  };
  await redisSub.subscribe(channel);
  redisSub.on('message', handler);
  return async () => {
    redisSub.off('message', handler);
    await redisSub.unsubscribe(channel);
  };
}
