export type RazorpayDisplayConfig = {
  display: {
    blocks: Record<
      string,
      {
        name: string;
        instruments: Array<{ method: "upi" | "card" | "netbanking" | "wallet"; flows?: Array<"qr" | "collect" | "intent">; apps?: string[] }>;
      }
    >;
    sequence: string[];
    preferences: { show_default_blocks: boolean };
  };
};

export const UPI_FIRST_DISPLAY: RazorpayDisplayConfig = {
  display: {
    blocks: {
      upi: {
        name: "Pay with UPI",
        instruments: [
          { method: "upi", flows: ["qr"] },
          { method: "upi", flows: ["intent"], apps: ["google_pay", "phonepe", "paytm", "bhim"] },
        ],
      },
    },
    sequence: ["block.upi"],
    preferences: { show_default_blocks: true },
  },
};
