import { createFileRoute } from "@tanstack/react-router";

import { LeadForm } from "@/components/site/LeadForm";
import { RateCalculator } from "@/components/site/RateCalculator";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, Section } from "@/components/site/Sections";
import { CHINA_WAREHOUSES, PICKUP_LOCATIONS, RMB_RATE, naira } from "@/lib/site";

export const Route = createFileRoute("/quote")({
  head: () => ({
    links: [{ rel: "canonical", href: "/quote" }],
    meta: [
      { title: "Real-Time CBM Calculator & Instant Quote | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Calculate your China to Nigeria shipping cost instantly: sea freight per CBM by pickup location, air freight per kg with live FX conversion, and a built-in CBM helper.",
      },
      { property: "og:title", content: "Real-Time CBM Calculator & Instant Quote | Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/quote" },
      {
        property: "og:description",
        content:
          "A real-time CBM calculator with live rates — sea by location, air by kg with live FX, and no account required to see a price.",
      },
    ],
  }),
  component: QuotePage,
});

function QuotePage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing, in the open"
        title="Get your real-time CBM estimate"
        intro="No account needed to see a price. Enter your dimensions or CBM, pick your pickup location or air tier, and get an instant Naira estimate built from our live rate card."
      />

      <Section
        eyebrow="Instant calculator"
        title="Sea by CBM, air by kg — always live"
        intro="Sea freight is fixed in Naira per CBM and never moves with the FX rate. Air freight is priced in USD per kg and converted using the live rate below."
      >
        <RateCalculator />
      </Section>

      <Section
        tone="cream"
        eyebrow="Sea freight minimums"
        title="Know your location's minimum CBM"
        intro="Ajao Estate has a 0.1 CBM minimum; Trade Fair, Onitsha and Kano have no minimum."
      >
        <Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PICKUP_LOCATIONS.filter((loc) => loc.modes.includes("sea")).map((loc) => (
              <div key={loc.id} className="rounded-2xl border border-border bg-card p-5">
                <p className="eyebrow text-leaf">{loc.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {loc.minCbm > 0 ? `Minimum ${loc.minCbm} CBM` : "No minimum CBM"}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      <Section
        eyebrow="China warehouses"
        title="Where your supplier should deliver"
        intro="Paste the correct warehouse address plus your name and code at supplier checkout."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {CHINA_WAREHOUSES.map((wh) => (
            <div key={wh.id} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-bold">{wh.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{wh.serves}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="RMB exchange"
        title="Need to pay a Chinese supplier?"
        intro="We settle RMB payments the same day at a published rate."
      >
        <div className="max-w-md rounded-2xl border border-border bg-card p-6">
          <p className="eyebrow text-leaf">Today's published rate</p>
          <p className="mt-2 text-2xl font-extrabold text-primary">₦{RMB_RATE} to ¥1</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Settlement takes 24–48 hours after payment.
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Prefer a human"
        title="Send us the details and we'll price it firmly"
        intro="Useful when your cargo is unusual, oversized, sensitive, or you're comparing us against your current forwarder."
      >
        <div className="mx-auto max-w-3xl">
          <LeadForm source="quote-page" />
        </div>
      </Section>
    </>
  );
}
