import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { LeadForm } from "@/components/site/LeadForm";
import { Reveal } from "@/components/site/Reveal";
import { PageHero, Section } from "@/components/site/Sections";
import { SERVICES } from "@/lib/site";

export const Route = createFileRoute("/services/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/services" }],
    meta: [
      { title: "Shipping & RMB Services | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "China–Nigeria cargo, exports to the UK, US, Canada and Europe, freight forwarding, warehouse consolidation and RMB exchange.",
      },
      { property: "og:title", content: "Our Services | Kennymoon Int'l Ltd" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/services" },
      {
        property: "og:description",
        content:
          "Five services from one team: imports, international exports, freight forwarding, warehouse consolidation and RMB exchange.",
      },
    ],
  }),
  component: ServicesIndex,
});

function ServicesIndex() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything between your supplier and your shop floor"
        intro="Move cargo into Nigeria, export to major international destinations, consolidate in China, clear freight and pay suppliers in RMB with one reachable team."
      />

      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {SERVICES.map((service, i) => {
            const isRmb = service.slug === "rmb-exchange";
            const cardClass = isRmb
              ? "card-hover flex h-full flex-col rounded-3xl border border-leaf bg-leaf-gradient p-7 text-white"
              : "card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-7";

            const content = (
              <>
                <h2 className="text-xl font-extrabold">{service.title}</h2>
                <p className={isRmb ? "mt-2.5 text-sm leading-relaxed text-white/85" : "mt-2.5 text-sm leading-relaxed text-muted-foreground"}>
                  {service.blurb}
                </p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {service.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span className={isRmb ? "mt-1.5 size-1.5 shrink-0 rounded-full bg-white" : "mt-1.5 size-1.5 shrink-0 rounded-full bg-leaf"} aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                {isRmb ? (
                  <Link to="/services/$slug" params={{ slug: service.slug }} className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-white">
                    CLICK HERE TO BUY RMB <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
                    Full details <ArrowRight className="size-4" aria-hidden="true" />
                  </span>
                )}
              </>
            );

            return (
              <Reveal key={service.slug} delay={i * 90}>
                {isRmb ? (
                  <div className={cardClass}>{content}</div>
                ) : (
                  <Link to="/services/$slug" params={{ slug: service.slug }} className={cardClass}>
                    {content}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section tone="cream" eyebrow="Tell us what you need" title="Start with a quick enquiry">
        <div className="mx-auto max-w-3xl">
          <LeadForm source="services" />
        </div>
      </Section>
    </>
  );
}
