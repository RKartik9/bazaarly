"use client";

import { useCallback } from "react";
import { UPI_FIRST_DISPLAY, type RazorpayDisplayConfig } from "./razorpay-display";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  config?: RazorpayDisplayConfig;
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (res: { error: { description?: string; reason?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

let loader: Promise<void> | null = null;

function loadScript() {
  if (window.Razorpay) return Promise.resolve();
  loader ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      reject(new Error("Could not load Razorpay"));
    };
    document.body.appendChild(script);
  });
  return loader;
}

export type OpenCheckoutInput = Omit<RazorpayOptions, "handler" | "modal"> & {
  onSuccess: (response: RazorpaySuccess) => void;
  onFailure: (reason: string) => void;
  onDismiss: () => void;
};

export function useRazorpay() {
  return useCallback(async ({ onSuccess, onFailure, onDismiss, ...options }: OpenCheckoutInput) => {
    await loadScript();
    if (!window.Razorpay) throw new Error("Razorpay unavailable");
    const instance = new window.Razorpay({
      config: UPI_FIRST_DISPLAY,
      ...options,
      handler: onSuccess,
      modal: { ondismiss: onDismiss, confirm_close: true },
    });
    instance.on("payment.failed", (res) => onFailure(res.error.description ?? res.error.reason ?? "Payment failed"));
    instance.open();
  }, []);
}
