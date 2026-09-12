import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import type { PolicyName } from "@/lib/ratelimit/core";
import { edgeRateLimit } from "@/lib/ratelimit/edge";

const PATH_POLICIES: [prefix: string, policy: PolicyName][] = [
  ["/api/webhooks", "webhook"],
  ["/search", "search"],
  ["/admin", "admin"],
  ["/checkout", "page"],
  ["/account", "page"],
  ["/api/", "page"],
];

function policyFor(pathname: string): PolicyName | null {
  return PATH_POLICIES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? null;
}

export default clerkMiddleware(async (_auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const isAction = req.method === "POST" && req.headers.has("next-action");
  const policy = isAction ? "action" : policyFor(pathname);

  if (policy) {
    const verdict = await edgeRateLimit(req, policy);
    if (!verdict.ok) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: { "Retry-After": String(verdict.retryAfter) },
      });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
