import { createFileRoute, Link } from "@tanstack/react-router";

import { Reveal } from "@/components/site/Reveal";
import { PageHero, Section } from "@/components/site/Sections";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    links: [{ rel: "canonical", href: "/about" }],
    meta: [
      { title: "About Kennymoon Int'l Ltd — Trust, Integrity and Service" },
      {
        name: "description",
        content:
          "Kennymoon Int'l Ltd has moved cargo between China and Nigeria since 2016. Our story, our people, and what Trust, Integrity and Service means in practice.",
      },
      { property: "og:title", content: "About Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/about" },
      {
        property: "og:description",
        content:
          "A Nigerian company with its own warehouses in China and its own clearing team at the ports.",
      },
    ],
  }),
  component: About,
});

const VALUES = [
  {
    title: "Trust",
    body: "We tell you 40 to 60 days for sea freight because that is the truth. Competitors promise two weeks and then go quiet. Our customers stay because nothing we say surprises them later.",
  },
  {
    title: "Integrity",
    body: "Duty is quoted separately from freight. Every payment goes to our corporate account with a receipt, never to an individual. If we make a mistake, we call you before you notice it.",
  },
  {
    title: "Service",
    body: "Our warehouse staff, clearing agents and pickup managers are on our own payroll. When you call Chidi in Lagos or Musa in Kano, you are speaking to Kennymoon — not to an agent of an agent.",
  },
];

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="We know our warehouse, our trucks, and our customers by name"
        intro="Kennymoon Int'l Ltd started in 2016 with one consolidation corner in Guangzhou and a handful of traders from Trade Fair who were tired of losing cartons. Ten years later we run two warehouses in China, three pickup offices in Nigeria, and our own clearing team at the ports."
      />

      <TrustStrip />

      <Section eyebrow="Our story" title="Built by importers, for importers">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              Kenny, our founder, spent four years buying footwear in Guangzhou for his own shop in
              Lagos. He knew what it felt like to send money to an agent and then wait weeks with no
              idea whether the goods had even been collected from the seller.
            </p>
            <p>
              So Kennymoon was built around the two things he always wanted and never got: a
              warehouse that tells you the moment your carton arrives, and a tracking page you can
              check yourself at 11pm without disturbing anybody.
            </p>
            <p>
              Today we handle sea and air consolidation, full freight forwarding and customs
              clearing, China warehouse consolidation for goods you buy yourself, and same-day RMB
              settlement. Everything is under one roof so that when something goes wrong, one company
              is accountable — us.
            </p>
            <p>
              We are registered in Nigeria as Kennymoon Int'l Ltd (RC 1428907), with offices in
              Lagos, Onitsha and Kano, and warehouses in Guangzhou and Yiwu.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border">
            <img
              src="/images/pickup-lagos.jpg"
              alt="Kennymoon staff releasing a customer's carton at our Lagos pickup office"
              width={1280}
              height={853}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </Section>

      <Section tone="cream" eyebrow="What we stand for" title="Trust, Integrity and Service — spelled out">
        <div className="grid gap-5 lg:grid-cols-3">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 90}>
              <div className="card-hover h-full rounded-3xl border border-border bg-card p-7">
                <h3 className="text-xl font-extrabold text-primary">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{value.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/testimonials">Hear it from our customers</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Come and see us</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
