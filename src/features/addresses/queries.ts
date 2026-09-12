import "server-only";
import { cache } from "react";
import { connectDb } from "@/lib/db/mongoose";
import { Address, type AddressDoc } from "@/lib/db/models";
import type { AddressDto } from "./types";

export function toAddressDto(doc: AddressDoc): AddressDto {
  return {
    id: doc._id.toString(),
    fullName: doc.fullName,
    phone: doc.phone,
    line1: doc.line1,
    line2: doc.line2 ?? "",
    landmark: doc.landmark ?? "",
    city: doc.city,
    state: doc.state,
    pincode: doc.pincode,
    country: doc.country ?? "India",
    type: doc.type ?? "home",
    isDefault: doc.isDefault ?? false,
  };
}

export const getUserAddresses = cache(async (userId: string): Promise<AddressDto[]> => {
  await connectDb();
  const docs = await Address.find({ userId }).sort({ isDefault: -1, updatedAt: -1 }).lean();
  return docs.map(toAddressDto);
});

export async function getUserAddress(userId: string, id: string): Promise<AddressDto | null> {
  await connectDb();
  const doc = await Address.findOne({ _id: id, userId }).lean();
  return doc ? toAddressDto(doc) : null;
}
