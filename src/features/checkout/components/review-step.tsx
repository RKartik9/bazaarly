"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Banknote, CreditCard, Loader2, Lock, MapPin, Pencil, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/features/addresses/components/address-card";
import type { AddressDto } from "@/features/addresses/types";
import type { DeliveryOption, PaymentMethod } from "@/lib/db/enums";
import { formatPrice } from "@/lib/money";
import { siteConfig } from "@/lib/site";
import { paymentFailedAction, placeOrderAction, verifyPaymentAction } from "../actions";
import { useRazorpay } from "../use-razorpay";

type Props = { address: AddressDto; delivery: DeliveryOption; payment: PaymentMethod; total: number };

type Phase = "idle" | "placing" | "paying" | "verifying";

export function ReviewStep({ address, delivery, payment, total }: Props) {
  const router = useRouter();
  const openRazorpay = useRazorpay();
  const [phase, setPhase] = useState<Phase>("idle");
  const settled = useRef(false);

  const placeOrder = async () => {
    setPhase("placing");
    settled.current = false;
    const result = await placeOrderAction({ addressId: address.id, delivery, payment });
    if (result.serverError || !result.data) {
      setPhase("idle");
      toast.error(result.serverError ?? "Could not place the order");
      if (result.serverError?.includes("bag")) router.push("/cart");
      return;
    }
    const data = result.data;
    if (data.kind === "cod") {
      router.push(`/order/${data.orderNumber}/success`);
      return;
    }

    setPhase("paying");
    try {
      await openRazorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: siteConfig.name,
        description: `Order ${data.orderNumber}`,
        prefill: data.prefill,
        theme: { color: "#e8703a" },
        onSuccess: async (res) => {
          settled.current = true;
          setPhase("verifying");
          const verified = await verifyPaymentAction({
            orderNumber: data.orderNumber,
            razorpayOrderId: res.razorpay_order_id,
            razorpayPaymentId: res.razorpay_payment_id,
            razorpaySignature: res.razorpay_signature,
          });
          if (verified.serverError || !verified.data) {
            setPhase("idle");
            toast.error(verified.serverError ?? "Payment verification failed");
            return;
          }
          router.push(`/order/${verified.data.orderNumber}/success`);
        },
        onFailure: async (reason) => {
          settled.current = true;
          await paymentFailedAction({ orderNumber: data.orderNumber, reason });
          setPhase("idle");
          toast.error(reason);
        },
        onDismiss: async () => {
          if (settled.current) return;
          await paymentFailedAction({ orderNumber: data.orderNumber, reason: "Payment cancelled" });
          setPhase("idle");
          toast("Payment cancelled. Your bag is still saved.");
        },
      });
    } catch {
      await paymentFailedAction({ orderNumber: data.orderNumber, reason: "Could not load payment gateway" });
      setPhase("idle");
      toast.error("Couldn't open the payment window. Check your connection and try again.");
    }
  };

  const busy = phase !== "idle";
  const label = phase === "placing" ? "Placing order…" : phase === "paying" ? "Waiting for payment…" : phase === "verifying" ? "Verifying payment…" : payment === "cod" ? "Place order" : `Pay ${formatPrice(total)}`;

  return (
    <div className="space-y-5">
      <ReviewRow icon={<MapPin className="size-4" />} title="Deliver to" href="/checkout/address">
        <AddressCard address={address} compact className="border-0 bg-muted/40 p-3" />
      </ReviewRow>
      <ReviewRow icon={delivery === "express" ? <Zap className="size-4" /> : <Truck className="size-4" />} title="Delivery" href="/checkout/delivery">
        <p className="text-sm">{delivery === "express" ? "Express delivery — arrives tomorrow" : "Standard delivery"}</p>
      </ReviewRow>
      <ReviewRow icon={payment === "cod" ? <Banknote className="size-4" /> : <CreditCard className="size-4" />} title="Payment" href="/checkout/payment">
        <p className="text-sm">{payment === "cod" ? `Cash on delivery (+${formatPrice(siteConfig.codFee)} fee)` : "Pay online via Razorpay"}</p>
      </ReviewRow>

      <Button size="xl" className="w-full rounded-xl sm:w-auto sm:min-w-64" disabled={busy} onClick={placeOrder}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
        {label}
      </Button>
      <p className="text-xs text-muted-foreground">
        By placing this order you agree to our <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </div>
  );
}

function ReviewRow({ icon, title, href, children }: { icon: React.ReactNode; title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-sm font-semibold">
          <span className="text-primary">{icon}</span> {title}
        </p>
        <Button asChild variant="ghost" size="sm" className="h-7 text-xs">
          <Link href={href}>
            <Pencil className="size-3" /> Change
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}
