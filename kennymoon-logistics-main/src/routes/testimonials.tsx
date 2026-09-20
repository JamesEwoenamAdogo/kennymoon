import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";

import { Reveal } from "@/components/site/Reveal";
import { PageHero, Section } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { TESTIMONIALS } from "@/lib/site";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    links: [{ rel: "canonical", href: "/testimonials" }],
    meta: [
      { title: "Customer Reviews & Stories | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Named Nigerian traders in Lagos, Onitsha and Kano describe shipping with Kennymoon — with their business, city and shipment counts.",
      },
      { property: "og:title", content: "Customer Reviews | Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/testimonials" },
      {
        property: "og:description",
        content: "Real customers, real businesses, real shipment numbers.",
      },
    ],
  }),
  component: Testimonials,
});

function Testimonials() {
  return (
    <>
      <PageHero
        eyebrow="Customer stories"
        title="The people who trust us with their cargo"
        intro="Every review below is from a customer we can name, in a city we serve, with the number of shipments they have moved with us."
      />

      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 90}>
              <figure className="card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-7">
                <Quote className="size-7 text-gold" aria-hidden="true" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-4 border-t border-border pt-6">
                  <img
                    src={t.photo}
                    alt={`${t.name}, ${t.business} in ${t.city}`}
                    width={640}
                    height={640}
                    loading="lazy"
                    className="size-14 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-extrabold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.business}</p>
                    <p className="mt-0.5 text-xs font-semibold text-leaf">
                      {t.city} · {t.stat}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="cream">
        <div className="rounded-3xl bg-forest p-8 text-center text-primary-foreground sm:p-12">
          <h2 className="text-2xl sm:text-3xl">Your first shipment is the one that decides it</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Start with one carton if you like. Track it the whole way, collect it in your city, then
            decide whether we deserve the rest of your cargo.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/quote">Get a price</Link>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <Link to="/auth">Open a free account</Link>
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
