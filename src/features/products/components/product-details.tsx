import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductDetailDto } from "@/features/catalog/types";

export function ProductDetails({ product }: { product: ProductDetailDto }) {
  const specs = Object.entries(product.specs);

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="h-auto w-full justify-start gap-1 rounded-full bg-muted/70 p-1 sm:w-auto">
        <TabsTrigger value="overview" className="rounded-full px-4 py-2 text-sm">
          Overview
        </TabsTrigger>
        {specs.length > 0 && (
          <TabsTrigger value="specs" className="rounded-full px-4 py-2 text-sm">
            Specifications
          </TabsTrigger>
        )}
        <TabsTrigger value="shipping" className="rounded-full px-4 py-2 text-sm">
          Shipping &amp; returns
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="prose prose-sm max-w-none text-foreground/80">
          <p className="whitespace-pre-line text-base leading-relaxed">{product.description}</p>
        </div>
        {product.highlights.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {product.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 rounded-2xl bg-card p-3 shadow-soft">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint text-teal">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm">{h}</span>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      {specs.length > 0 && (
        <TabsContent value="specs" className="mt-6">
          <dl className="grid overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-2">
            {specs.map(([k, v], i) => (
              <div key={k} className={i % 2 === 0 ? "bg-card" : "bg-muted/40"}>
                <div className="grid grid-cols-[40%_1fr] gap-3 px-4 py-3 text-sm">
                  <dt className="font-medium capitalize text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                  <dd>{v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </TabsContent>
      )}

      <TabsContent value="shipping" className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        {[
          ["Delivery", "Standard delivery in 2–7 days depending on your pincode. Express delivery available in metro cities."],
          ["Returns", "Return unused items within 7 days of delivery for a full refund. Pickup is free."],
          ["Payments", "Pay securely with UPI, cards, net banking and wallets via Razorpay, or choose cash on delivery."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl bg-card p-5 shadow-soft">
            <h3 className="font-heading text-base font-bold">{title}</h3>
            <p className="mt-2 text-muted-foreground">{body}</p>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}
