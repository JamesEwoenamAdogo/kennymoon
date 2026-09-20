import { createFileRoute, Link } from "@tanstack/react-router";

import { PageHero, Section } from "@/components/site/Sections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQS } from "@/lib/site";

export const Route = createFileRoute("/faq")({
  head: () => ({
    links: [{ rel: "canonical", href: "/faq" }],
    meta: [
      { title: "China to Nigeria Shipping FAQ | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Answers on shipping duration, warehouse address, costs, tracking without an account, RMB rates, prohibited goods, customs duty and how to pay Kennymoon.",
      },
      { property: "og:title", content: "Frequently Asked Questions | Kennymoon Int'l Ltd" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/faq" },
      {
        property: "og:description",
        content: "Straight answers on transit times, rates, warehouse addresses and payments.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="The questions our customers actually ask"
        intro="If your question isn't here, our assistant at the bottom-right knows the same answers — and can hand you to a human."
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-bold">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-10 rounded-3xl border border-border bg-cream p-6 text-center">
            <h2 className="text-lg font-extrabold">Still not sure?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Ask us anything about your specific goods, your seller, or your city.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button asChild variant="leaf">
                <Link to="/contact">Ask our team</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Other ways to reach us</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
