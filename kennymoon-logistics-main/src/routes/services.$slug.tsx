import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { LeadForm } from "@/components/site/LeadForm";
import { PageHero, Section } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { RATES, RMB_RATE, SERVICES, naira, whatsappLink } from "@/lib/site";

const DETAIL: Record<string, { heading: string; body: string[]; facts: [string, string][] }> = {
  "china-nigeria-shipping": {
    heading: "Sea and air consolidation you can watch move",
    body: [
      "Your seller delivers to our Guangzhou or Yiwu warehouse. Our staff receive the carton, weigh it, measure it, photograph it and attach it to your waybill the same working day — so you know it arrived before you have to ask.",
      "Sea cargo is grouped into our containers and sails from Nansha or Shenzhen. Expect 40 to 60 days on the water, then 3 to 7 days for clearing and inland movement. Air cargo leaves Guangzhou or Shanghai and lands in 7 to 12 days door to pickup.",
      "We hold your goods free for 21 days while you wait for other sellers, so several small orders can travel as one shipment on one invoice.",
    ],
    facts: [
      ["Sea rate", `${naira(RATES.sea.perKg)}/kg or ${naira(RATES.sea.perCbm)}/CBM`],
      ["Air rate", `${naira(RATES.air.perKg)}/kg`],
      ["Free storage", "21 days in China"],
      ["Pickup cities", "Lagos, Onitsha, Kano"],
    ],
  },
  "nigeria-international-shipping": {
    heading: "Export from Nigeria with a team that stays reachable",
    body: [
      "Kennymoon ships suitable goods from Nigeria to the United Kingdom, United States, Canada and other European countries. We help you choose the practical sea or air option based on the destination, cargo type, size and urgency.",
      "Our team guides you on packaging and the documents required for the destination, receives the cargo, prepares it for dispatch and keeps you informed as it moves.",
      "Send us the destination country, a description of the goods, the approximate weight or dimensions, and your preferred delivery speed. We will confirm what can travel and give you the correct quote before you pay.",
    ],
    facts: [
      ["Main destinations", "United Kingdom, United States and Canada"],
      ["Other destinations", "European countries on request"],
      ["Shipping modes", "Sea or air, depending on cargo and destination"],
      ["Quote needs", "Destination, goods, weight or dimensions"],
    ],
  },
  "freight-forwarding": {
    heading: "Clearing and haulage handled by our own team",
    body: [
      "We are not a middleman who hands your container to a stranger at Apapa. Our clearing agents are on our payroll and work Apapa, Tin Can and Murtala Muhammed cargo every week.",
      "For registered businesses we guide you through Form M and PAAR so your paperwork does not stall your goods. Duty is quoted separately from freight — you always see exactly what goes to Customs and what comes to us.",
      "Once cleared, we move your cargo by our own trucks or vetted hauliers to any state in Nigeria, or you collect at Lagos, Onitsha or Kano.",
    ],
    facts: [
      ["Container options", "LCL groupage and FCL"],
      ["Ports worked", "Apapa, Tin Can, MMIA cargo"],
      ["Documentation", "Form M and PAAR guidance"],
      ["Inland delivery", "All 36 states"],
    ],
  },
  "warehouse-consolidation": {
    heading: "You buy it. We receive, consolidate and ship it.",
    body: [
      "Kennymoon does not buy goods or deal with suppliers for you. You search and pay on Pinduoduo, 1688, Taobao or any Chinese platform yourself. At checkout, where the seller asks for a delivery address, you paste our China warehouse address with your own name and code on it.",
      "The supplier ships straight to our Guangzhou or Yiwu warehouse. From the moment your carton arrives, it is ours: weighed, measured, photographed and logged against your Kennymoon code the same day.",
      "Cartons from different sellers are combined under one shipping mark, so you pay for one shipment instead of five — with free storage while you wait for the slower sellers.",
    ],
    facts: [
      ["Your job", "Buy the goods and paste our address"],
      ["Our job", "Receive, consolidate, ship, deliver"],
      ["Warehouses", "Guangzhou, Yiwu, plus Ajao Estate line (sea only)"],
      ["Code on every carton", "Your name + KM or GP code"],
    ],
  },

  "rmb-exchange": {
    heading: "Buy RMB for Alipay, WeChat Pay or a Chinese bank account",
    body: [
      `Our published rate is ₦${RMB_RATE} to ¥1. Settlement takes 24–48 hours after payment. Send the amount you need on WhatsApp and our team will confirm the total before you transfer anything.`,
      "Alipay and WeChat Pay are wallets. Each payment can be sent to the wallet details you provide, or directly to a Chinese bank account. We send you the payment screenshot and receipt for your records.",
      "Never pay into a personal account — ours or anyone else's. Every Kennymoon payment goes to our corporate account and comes with a receipt.",
    ],
    facts: [
      ["Today's rate", `₦${RMB_RATE} to ¥1`],
      ["Settlement", "24–48 hours after payment"],
      ["Channels", "Alipay, WeChat Pay, Chinese banks"],
      ["Proof", "Receipt plus payment screenshot"],
    ],
  },
};

export const Route = createFileRoute("/services/$slug")({
  beforeLoad: ({ params }) => {
    if (!SERVICES.some((s) => s.slug === params.slug) || !DETAIL[params.slug]) throw notFound();
  },
  head: ({ params }) => {
    const service = SERVICES.find((s) => s.slug === params.slug);
    if (!service) {
      return {
        meta: [{ title: "Service not found | Kennymoon" }, { name: "robots", content: "noindex" }],
      };
    }
    const title =
      service.slug === "nigeria-international-shipping"
        ? "Nigeria International Shipping | Kennymoon"
        : `${service.title} | Kennymoon Int'l Ltd`;
    const url = `/services/${params.slug}`;
    return {
      links: [{ rel: "canonical", href: url }],
      meta: [
        { title },
        { name: "description", content: service.blurb.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { property: "og:url", content: url },
        { property: "og:description", content: service.blurb.slice(0, 155) },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.blurb,
            serviceType: service.title,
            provider: {
              "@type": "LocalBusiness",
              name: "Kennymoon Int'l Ltd",
              telephone: "+2348074345865",
              url: "https://kennymoon-logistics.lovable.app/",
            },
            areaServed:
              service.slug === "nigeria-international-shipping"
                ? ["Nigeria", "United Kingdom", "United States", "Canada", "Europe"].map((name) => ({
                    "@type": "Country",
                    name,
                  }))
                : [
                    { "@type": "Country", name: "Nigeria" },
                    { "@type": "Country", name: "China" },
                  ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://kennymoon-logistics.lovable.app/",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Services",
                item: "https://kennymoon-logistics.lovable.app/services",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: service.title,
                item: `https://kennymoon-logistics.lovable.app${url}`,
              },
            ],
          }),
        },
      ],
    };
  },
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = SERVICES.find((s) => s.slug === slug);
  const detail = DETAIL[slug];
  if (!service || !detail) return null;
  const isRmb = slug === "rmb-exchange";


  return (
    <>
      <PageHero eyebrow="Service" title={service.title} intro={service.blurb}>
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="hero">
            {isRmb ? (
              <a href={whatsappLink("Hello Kennymoon, I want to buy RMB")} target="_blank" rel="noreferrer">BUY NOW</a>
            ) : (
              <Link to="/contact">Talk to our team</Link>
            )}
          </Button>
          <Button asChild variant="onDark">
            <Link to="/quote">See rates</Link>
          </Button>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            {isRmb && (
              <p className="mb-5 text-[clamp(2.5rem,8vw,5rem)] font-extrabold leading-none text-primary">
                ₦{RMB_RATE} <span className="text-[0.4em] text-muted-foreground">to ¥1</span>
              </p>
            )}
            <h2 className="text-2xl sm:text-3xl">{detail.heading}</h2>
            {slug === "nigeria-international-shipping" && (
              <div className="mt-5 flex flex-wrap gap-2" aria-label="International export destinations">
                {["🇺🇸 United States", "🇬🇧 United Kingdom", "🇨🇦 Canada", "+ Other European Countries"].map((country) => (
                  <span key={country} className="rounded-full bg-secondary px-3 py-1.5 text-sm font-bold text-secondary-foreground">
                    {country}
                  </span>
                ))}
              </div>
            )}
            {detail.body.map((paragraph) => (
              <p key={paragraph} className="mt-4 text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
            <h3 className="mt-8 text-lg font-extrabold">What you get</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {service.points.map((point) => (
                <li key={point} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-leaf" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
            {isRmb && (
              <div className="mt-10">
                <h3 className="text-lg font-extrabold">How to buy RMB</h3>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["Chat with Us", "Make Payment", "Send Payment Receipt", "Send Alipay / WeChat Account Details"].map((step, index) => (
                    <li key={step} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm font-bold">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-leaf-gradient text-leaf-foreground">{index + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Button asChild variant="leaf" size="lg" className="mt-6">
                  <a href="https://api.whatsapp.com/send/?phone=%2B2348074345865&text=Hello%20Kennymoon%2C%20I%20want%20to%20buy%20RMB&type=phone_number&app_absent=0" target="_blank" rel="noreferrer">BUY NOW</a>
                </Button>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-3xl border border-border bg-cream p-6">
            <p className="eyebrow text-leaf">At a glance</p>
            <dl className="mt-4 space-y-3.5 text-sm">
              {detail.facts.map(([label, value]) => (
                <div key={label} className="border-b border-border pb-3.5 last:border-0 last:pb-0">
                  <dt className="text-muted-foreground">{label}</dt>
                   <dd className={isRmb && label === "Today's rate" ? "mt-1 text-4xl font-extrabold text-primary" : "mt-0.5 font-bold text-primary"}>{value}</dd>
                </div>
              ))}
            </dl>
            <Button asChild variant="leaf" className="mt-6 w-full">
              {isRmb ? (
                <a href="https://api.whatsapp.com/send/?phone=%2B2348074345865&text=Hello%20Kennymoon%2C%20I%20want%20to%20buy%20RMB&type=phone_number&app_absent=0" target="_blank" rel="noreferrer">BUY NOW</a>
              ) : (
                <Link to="/auth">Open a free account</Link>
              )}
            </Button>
          </aside>
        </div>
      </Section>

      {!isRmb && (
        <Section tone="cream" eyebrow="Next step" title="Send us the details">
          <div className="mx-auto max-w-3xl">
            <LeadForm source={`service-${service.slug}`} />
          </div>
        </Section>
      )}
    </>
  );
}
