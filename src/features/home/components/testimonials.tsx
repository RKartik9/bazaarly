import { Quote } from "lucide-react";
import { Marquee } from "@/components/motion/marquee";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeading } from "@/components/section-heading";
import { initials } from "@/lib/utils";

const testimonials = [
  { name: "Ananya S.", city: "Bengaluru", text: "Ordered the ANC headphones on a Tuesday night, they were at my door Thursday morning. Packaging was thoughtful, no plastic.", rating: 5 },
  { name: "Rahul V.", city: "Pune", text: "The saree came exactly like the photos. My mother has already asked for two more in other colours.", rating: 5 },
  { name: "Priya N.", city: "Kochi", text: "Returned a pair of sneakers that ran small. Pickup was next day and the refund landed before the weekend.", rating: 5 },
  { name: "Arjun M.", city: "Delhi", text: "Finally a store where the filters actually work. Found a 14-inch OLED laptop under a lakh in two clicks.", rating: 4 },
  { name: "Sneha I.", city: "Hyderabad", text: "The chikankari kurta set is beautiful in person. Stitching is neat and the cotton is soft.", rating: 5 },
  { name: "Vikram S.", city: "Jaipur", text: "COD on a 25k bicycle without any fuss. Assembly instructions were clear too.", rating: 5 },
];

export function Testimonials() {
  return (
    <section className="py-16">
      <div className="container-x">
        <SectionHeading eyebrow="Loved across India" title="Don't take our word for it" align="center" />
      </div>
      <Marquee speed={60} className="py-2">
        {testimonials.map((t) => (
          <figure key={t.name} className="w-80 shrink-0 rounded-3xl border bg-card p-6 shadow-soft">
            <Quote className="mb-3 size-5 text-primary" />
            <blockquote className="text-sm leading-relaxed">{t.text}</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-teal text-sm font-bold text-teal-foreground">{initials(t.name)}</span>
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.city}</p>
              </div>
              <RatingStars value={t.rating} size="xs" showValue={false} className="ml-auto" />
            </figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}
