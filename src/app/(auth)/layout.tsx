import Image from "next/image";
import { Logo } from "@/components/layout/logo";
import { Marquee } from "@/components/motion/marquee";

const perks = ["Free delivery over ₹999", "7-day easy returns", "Secure Razorpay payments", "Cash on delivery"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink text-background lg:block">
        <Image
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo light />
          <div>
            <h1 className="max-w-md font-heading text-5xl font-extrabold leading-[0.95]">
              Your bag is <span className="text-saffron">waiting</span> for you.
            </h1>
            <p className="mt-4 max-w-sm text-background/70">
              Sign in to sync your cart, track orders and save the addresses you ship to most.
            </p>
            <Marquee className="mt-8 max-w-md" speed={25}>
              {perks.map((p) => (
                <span key={p} className="rounded-full border border-background/20 px-3 py-1 text-xs font-medium text-background/80">
                  {p}
                </span>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center p-6">{children}</div>
      </div>
    </div>
  );
}
