import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, PackagePlus, Smartphone } from "lucide-react";

import { PageHero, Section } from "@/components/site/Sections";
import { TrackingPanel } from "@/components/site/TrackingPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/track")({
  head: () => ({
    links: [{ rel: "canonical", href: "/track" }],
    meta: [
      { title: "Track Your Shipment | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Enter your supplier's tracking number to see live shipment status, every tracking stage and your estimated pickup date. No login required.",
      },
      { property: "og:title", content: "Track Your Shipment | Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/track" },
      {
        property: "og:description",
        content:
          "Live China to Nigeria cargo tracking by tracking number, on any phone, with or without an account.",
      },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  return (
    <>
      <PageHero
        eyebrow="Live tracking"
        title="Where are my goods right now?"
        intro="Type the tracking number your supplier gave you — any format, any length. Signed in? Every code you enter is logged on your dashboard as “Not Yet in Warehouse” and moves the moment our warehouse record matches it."
      />

      <Section>
        <div className="mx-auto max-w-3xl">
          <TrackingPanel />
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="Two ways to work"
        title="Forecast a package, or follow one already moving"
        intro="Experienced importers tell us what's coming before it arrives. That's a pre-alert, and it means your carton is matched to you the minute it lands in our warehouse."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              icon: PackagePlus,
              title: "Add a package (pre-alert)",
              body: "Give us the seller's tracking number and what's inside. When it arrives we match it instantly instead of hunting for an owner.",
              cta: "Pre-alert in my dashboard",
              to: "/auth" as const,
            },
            {
              icon: Bell,
              title: "Get notified at every stage",
              body: "Account holders get an alert when a carton is received, when it's consolidated, when it sails or flies, and when it's ready for pickup.",
              cta: "Create a free account",
              to: "/auth" as const,
            },
            {
              icon: Smartphone,
              title: "Built for the phone in your hand",
              body: "Tracking works on any browser, on slow data, in one thumb. Share the waybill with your own customers and let them check for themselves.",
              cta: "See how it works",
              to: "/how-it-works" as const,
            },
          ].map((card) => (
            <div key={card.title} className="card-hover rounded-3xl border border-border bg-card p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                <card.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-lg font-extrabold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link to={card.to}>{card.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
