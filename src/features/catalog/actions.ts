"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";
import { getSearchSuggestions } from "./queries";

export const suggestAction = actionClient
  .metadata({ name: "catalog.suggest", limit: "search" })
  .inputSchema(z.object({ q: z.string().trim().min(2).max(60) }))
  .action(async ({ parsedInput }) => getSearchSuggestions(parsedInput.q));
