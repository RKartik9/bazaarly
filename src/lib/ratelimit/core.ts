import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type LimitVerdict = { ok: true } | { ok: false; retryAfter: number };

export type LimitPolicy = {
  requests: number;
  windowSeconds: number;
};

export const policies = {
  page: { requests: 120, windowSeconds: 60 },
  search: { requests: 40, windowSeconds: 60 },
  action: { requests: 60, windowSeconds: 60 },
  cart: { requests: 40, windowSeconds: 60 },
  checkout: { requests: 15, windowSeconds: 60 },
  coupon: { requests: 6, windowSeconds: 60 },
  review: { requests: 5, windowSeconds: 300 },
  contact: { requests: 3, windowSeconds: 600 },
  webhook: { requests: 120, windowSeconds: 60 },
  admin: { requests: 120, windowSeconds: 60 },
} satisfies Record<string, LimitPolicy>;

export type PolicyName = keyof typeof policies;

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

const limiterCache = new Map<PolicyName, Ratelimit>();

function upstashLimiter(name: PolicyName) {
  let limiter = limiterCache.get(name);
  if (!limiter) {
    const policy = policies[name];
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(policy.requests, `${policy.windowSeconds} s`),
      prefix: `rl:${name}`,
      analytics: false,
    });
    limiterCache.set(name, limiter);
  }
  return limiter;
}

type Bucket = { count: number; resetAt: number };
const memory = new Map<string, Bucket>();

function memoryLimit(name: PolicyName, key: string): LimitVerdict {
  const policy = policies[name];
  const now = Date.now();
  const id = `${name}:${key}`;
  const bucket = memory.get(id);

  if (!bucket || bucket.resetAt <= now) {
    memory.set(id, { count: 1, resetAt: now + policy.windowSeconds * 1000 });
    if (memory.size > 10_000) pruneMemory(now);
    return { ok: true };
  }

  bucket.count += 1;
  if (bucket.count > policy.requests) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true };
}

function pruneMemory(now: number) {
  for (const [id, bucket] of memory) {
    if (bucket.resetAt <= now) memory.delete(id);
  }
}

export async function checkLimit(name: PolicyName, key: string): Promise<LimitVerdict> {
  if (!hasUpstash) return memoryLimit(name, key);

  const result = await upstashLimiter(name).limit(key);
  if (result.success) return { ok: true };
  return { ok: false, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
}
