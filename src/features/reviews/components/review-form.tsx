"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { Loader2, Star } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { createReviewAction } from "../actions";
import type { ReviewEligibility } from "../queries";

type Props = { productId: string; eligibility: ReviewEligibility };

export function ReviewForm({ productId, eligibility }: Props) {
  const clerk = useClerk();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);

  const { execute, isPending, result } = useAction(createReviewAction, {
    onSuccess: () => {
      setDone(true);
      toast.success("Thanks for your review!");
    },
    onError: ({ error }) => {
      if (error.serverError) toast.error(error.serverError);
    },
  });
  const fieldErrors = result.validationErrors?.fieldErrors;

  if (eligibility.state === "signed-out") {
    return (
      <div className="rounded-3xl border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">Sign in to write a review.</p>
        <Button variant="outline" className="mt-3 rounded-full" onClick={() => clerk.openSignIn({ fallbackRedirectUrl: window.location.href })}>
          Sign in
        </Button>
      </div>
    );
  }
  if (eligibility.state === "reviewed" || done) {
    return <p className="rounded-3xl bg-mint/60 p-5 text-sm font-medium text-teal">You&apos;ve reviewed this product. Thank you!</p>;
  }

  return (
    <form
      className="space-y-4 rounded-3xl bg-card p-6 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        execute({ productId, rating, title: String(form.get("title") ?? ""), body: String(form.get("body") ?? "") });
      }}
    >
      <h3 className="font-heading text-lg font-bold">Write a review</h3>
      <div>
        <Label className="mb-2 block">Your rating</Label>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} star`}>
              <Star className={cn("size-7 transition", (hover || rating) >= n ? "fill-saffron text-saffron" : "text-muted-foreground/40")} />
            </button>
          ))}
        </div>
        {fieldErrors?.rating && <p className="mt-1 text-xs text-destructive">Pick a star rating</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input id="review-title" name="title" maxLength={120} placeholder="Sum it up in a line" aria-invalid={!!fieldErrors?.title} />
        {fieldErrors?.title && <p className="text-xs text-destructive">{fieldErrors.title[0]}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-body">Review</Label>
        <Textarea id="review-body" name="body" rows={4} maxLength={2000} placeholder="What did you like or dislike?" aria-invalid={!!fieldErrors?.body} />
        {fieldErrors?.body && <p className="text-xs text-destructive">{fieldErrors.body[0]}</p>}
      </div>
      <Button type="submit" disabled={isPending || rating === 0} className="rounded-full">
        {isPending && <Loader2 className="size-4 animate-spin" />}
        Submit review
      </Button>
    </form>
  );
}
