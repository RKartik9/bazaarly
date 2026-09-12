import "server-only";
import { cache } from "react";
import { getSessionUser } from "@/lib/auth/current-user";
import { connectDb } from "@/lib/db/mongoose";
import { readGuestToken } from "./guest";
import { buildCartDto, findCart, mergeGuestCartIntoUser } from "./service";
import type { CartDto } from "./types";

export const getCart = cache(async (): Promise<CartDto> => {
  await connectDb();
  const [user, guestToken] = await Promise.all([getSessionUser(), readGuestToken()]);

  if (user && guestToken) {
    await mergeGuestCartIntoUser(user.id, guestToken);
  }

  const cart = await findCart({ userId: user?.id, guestToken: user ? null : guestToken });
  return buildCartDto(cart, user?.id);
});
