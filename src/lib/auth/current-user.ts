import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDb } from "@/lib/db/mongoose";
import { User, type UserRole } from "@/lib/db/models";
import { adminEmails } from "@/lib/env";

export type SessionUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  imageUrl: string;
  role: UserRole;
};

function resolveRole(email: string, existing?: UserRole): UserRole {
  if (existing === "admin") return "admin";
  return adminEmails.includes(email.toLowerCase()) ? "admin" : "customer";
}

async function syncFromClerk(clerkId: string): Promise<SessionUser | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "";

  await connectDb();
  const existing = await User.findOne({ clerkId }).lean();
  const role = resolveRole(email, existing?.role);

  const doc = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: { email, name, imageUrl: clerkUser.imageUrl ?? "", role, lastSeenAt: new Date() },
      $setOnInsert: { clerkId },
    },
    { upsert: true, new: true },
  ).lean();

  if (!doc) return null;
  return {
    id: doc._id.toString(),
    clerkId,
    email: doc.email,
    name: doc.name ?? "",
    imageUrl: doc.imageUrl ?? "",
    role: doc.role,
  };
}

export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  await connectDb();
  const doc = await User.findOne({ clerkId }).lean();
  if (!doc) return syncFromClerk(clerkId);

  const role = resolveRole(doc.email, doc.role);
  if (role !== doc.role) {
    await User.updateOne({ _id: doc._id }, { $set: { role } });
  }

  return {
    id: doc._id.toString(),
    clerkId,
    email: doc.email,
    name: doc.name ?? "",
    imageUrl: doc.imageUrl ?? "",
    role,
  };
});

export async function requireSessionUser(redirectTo = "/"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/sign-in?redirect_url=${encodeURIComponent(redirectTo)}`);
  return user;
}

export async function requireAdmin(redirectTo = "/admin"): Promise<SessionUser> {
  const user = await requireSessionUser(redirectTo);
  if (user.role !== "admin") redirect("/");
  return user;
}

export class AuthRequiredError extends Error {
  constructor() {
    super("Please sign in to continue.");
    this.name = "AuthRequiredError";
  }
}

export class ForbiddenError extends Error {
  constructor() {
    super("You do not have permission to do that.");
    this.name = "ForbiddenError";
  }
}
