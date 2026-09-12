import "server-only";
import { headers } from "next/headers";
import { checkLimit, type PolicyName } from "./core";

export class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super("Too many requests. Please slow down.");
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

export async function requestIp() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "anonymous";
}

export async function enforceLimit(policy: PolicyName, subject?: string | null) {
  const key = subject ?? (await requestIp());
  const verdict = await checkLimit(policy, key);
  if (!verdict.ok) throw new RateLimitError(verdict.retryAfter);
}

export { policies, type PolicyName } from "./core";
