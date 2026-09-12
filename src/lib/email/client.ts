import "server-only";
import { Resend } from "resend";
import { env } from "@/lib/env";

let client: Resend | null = null;

export const emailConfigured = !!env.RESEND_API_KEY;

export function resend() {
  client ??= new Resend(env.RESEND_API_KEY);
  return client;
}

export async function sendEmail(input: { to: string; subject: string; body: React.ReactElement }) {
  if (!emailConfigured) return { skipped: true as const };
  const { error } = await resend().emails.send({ from: env.EMAIL_FROM, to: input.to, subject: input.subject, react: input.body });
  if (error) throw new Error(error.message);
  return { skipped: false as const };
}
