import "server-only";
import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import {
  AuthRequiredError,
  ForbiddenError,
  getSessionUser,
  type SessionUser,
} from "@/lib/auth/current-user";
import { connectDb } from "@/lib/db/mongoose";
import { isKnownError } from "@/lib/errors";
import { enforceLimit, type PolicyName } from "@/lib/ratelimit";

const metadataSchema = z.object({
  name: z.string(),
  limit: z.custom<PolicyName>().optional(),
});

export const actionClient = createSafeActionClient({
  defaultValidationErrorsShape: "flattened",
  defineMetadataSchema: () => metadataSchema,
  handleServerError(error, { metadata }) {
    if (isKnownError(error)) return error.message;
    console.error(`[action:${metadata?.name ?? "unknown"}]`, error);
    return "Something went wrong. Please try again.";
  },
}).use(async ({ next, metadata }) => {
  await connectDb();
  const user = await getSessionUser();
  await enforceLimit(metadata.limit ?? "action", user ? `u:${user.id}` : undefined);
  return next({ ctx: { user } });
});

export const authAction = actionClient.use(async ({ next, ctx }) => {
  if (!ctx.user) throw new AuthRequiredError();
  return next({ ctx: { user: ctx.user as SessionUser } });
});

export const adminAction = authAction.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin") throw new ForbiddenError();
  return next({ ctx });
});
