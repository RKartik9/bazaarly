import { SectionHeading } from "@/components/section-heading";
import { getProductReviews, getReviewEligibility, getReviewSummary } from "../queries";
import { ReviewForm } from "./review-form";
import { ReviewList } from "./review-list";
import { ReviewSummary } from "./review-summary";

export async function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, summary, eligibility] = await Promise.all([
    getProductReviews(productId),
    getReviewSummary(productId),
    getReviewEligibility(productId),
  ]);

  return (
    <section id="reviews" className="scroll-mt-28">
      <SectionHeading eyebrow="Reviews" title="What shoppers are saying" />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <ReviewSummary summary={summary} />
          <ReviewForm productId={productId} eligibility={eligibility} />
        </div>
        <ReviewList reviews={reviews} />
      </div>
    </section>
  );
}
