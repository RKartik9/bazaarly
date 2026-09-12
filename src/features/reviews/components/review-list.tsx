import { BadgeCheck, MessageSquareDashed } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/ui/rating-stars";
import { initials } from "@/lib/utils";
import type { ReviewDto } from "../types";

export function ReviewList({ reviews }: { reviews: ReviewDto[] }) {
  if (!reviews.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed p-10 text-center">
        <MessageSquareDashed className="size-8 text-muted-foreground" />
        <p className="mt-3 font-heading text-lg font-bold">No reviews yet</p>
        <p className="text-sm text-muted-foreground">Be the first to share what you think.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="rounded-3xl bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-lavender text-xs font-bold">{initials(r.authorName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{r.authorName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </div>
            {r.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold text-teal">
                <BadgeCheck className="size-3" /> Verified purchase
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <RatingStars value={r.rating} showValue={false} />
            <h3 className="text-sm font-semibold">{r.title}</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground/80">{r.body}</p>
        </li>
      ))}
    </ul>
  );
}
