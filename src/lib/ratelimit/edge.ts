import type { NextRequest } from "next/server";
import { checkLimit, type LimitVerdict, type PolicyName } from "./core";

export function clientIp(req: NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

export function edgeRateLimit(req: NextRequest, policy: PolicyName): Promise<LimitVerdict> {
  return checkLimit(policy, clientIp(req));
}
