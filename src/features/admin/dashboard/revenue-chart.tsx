"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/money";
import type { RevenuePoint } from "./queries";

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const empty = data.every((d) => d.revenue === 0);

  return (
    <div className="h-72 w-full">
      {empty ? (
        <div className="grid h-full place-items-center rounded-2xl border border-dashed text-sm text-muted-foreground">
          Revenue will chart here once orders come in.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={shortDate} tickLine={false} axisLine={false} interval={6} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <YAxis tickFormatter={(v: number) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`)} tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
            <Tooltip
              cursor={{ stroke: "var(--color-primary)", strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0]!.payload as RevenuePoint;
                return (
                  <div className="rounded-xl border bg-card px-3 py-2 text-xs shadow-lift">
                    <p className="font-semibold">{shortDate(p.date)}</p>
                    <p className="mt-0.5 tabular-nums">{formatPrice(p.revenue)}</p>
                    <p className="text-muted-foreground">{p.orders} orders</p>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#revenueFill)" animationDuration={900} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
