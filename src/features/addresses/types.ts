import type { AddressType } from "@/lib/db/enums";

export type AddressDto = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: AddressType;
  isDefault: boolean;
};

export type AddressSnapshot = Omit<AddressDto, "id" | "isDefault">;
