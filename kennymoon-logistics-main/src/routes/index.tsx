import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Clock3,
  MapPin,
  Package,
  PackageSearch,
  Plane,
  Globe2,
  ShieldCheck,
  ShoppingBag,
  Ship,
} from "lucide-react";

import { CargoMotion } from "@/components/site/CargoMotion";
import { JourneyTimeline } from "@/components/site/JourneyTimeline";

import { OrbitVisual } from "@/components/site/OrbitVisual";
import { RateCalculator } from "@/components/site/RateCalculator";
import { Reveal } from "@/components/site/Reveal";
import { Section } from "@/components/site/Sections";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Button } from "@/components/ui/button";
import { BRAND, FAQS, SERVICES, TESTIMONIALS } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    links: [{ rel: "canonical", href: "/" }],
    meta: [
      { title: "China to Nigeria Shipping & Cargo | Kennymoon Int'l Ltd" },
      {
        name: "description",
        content:
          "Kennymoon Int'l Ltd ships, forwards and exchanges RMB between China and Nigeria. Live tracking, public rates, pickup in Lagos, Onitsha and Kano.",
      },
      { property: "og:title", content: "China to Nigeria Shipping | Kennymoon Int'l Ltd" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "/" },
      {
        property: "og:description",
        content:
          "Let's help you moon your goods faster. Sea and air freight from Guangzhou and Yiwu with live tracking and a real customer dashboard.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://kennymoon-logistics.lovable.app/#business",
          name: "Kennymoon Int'l Ltd",
          description:
            "China to Nigeria sea and air freight, warehouse consolidation, freight forwarding and RMB exchange, with pickup in Lagos, Onitsha and Kano.",
          url: "https://kennymoon-logistics.lovable.app/",
          telephone: "+2348074345865",
          email: "support@kennymoonintl.com",
          priceRange: "₦₦",
          areaServed: [
            { "@type": "Country", name: "Nigeria" },
            { "@type": "Country", name: "China" },
          ],
          address: [
            {
              "@type": "PostalAddress",
              streetAddress:
                "Shop 14, Balogun Business Association Plaza, Trade Fair Complex",
              addressLocality: "Lagos",
              addressCountry: "NG",
            },
            {
              "@type": "PostalAddress",
              addressLocality: "Onitsha",
              addressRegion: "Anambra",
              addressCountry: "NG",
            },
            {
              "@type": "PostalAddress",
              addressLocality: "Kano",
              addressCountry: "NG",
            },
          ],
          openingHours: "Mo-Sa 08:30-18:00",
          sameAs: [
            "https://www.instagram.com/kennymoonintl/",
            "https://web.facebook.com/kennymoonintl",
            "https://www.tiktok.com/@kennymoonintltd",
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
          ],
        }),
      },
    ],
  }),
  component: Home,
});

const SERVICE_ICONS = [Ship, Globe2, Package, ShoppingBag, Banknote];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-forest text-primary-foreground">
        <div
          className="absolute -top-32 -left-24 size-96 rounded-full bg-leaf/20 blur-3xl animate-drift"
          aria-hidden="true"
        />
        <CargoMotion />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-12 lg:py-24">

          <div className="min-w-0 text-center lg:text-left">
            <p className="eyebrow inline-flex max-w-full rounded-full bg-primary-foreground/10 px-3 py-1.5 text-gold">
              {BRAND.tagline}
            </p>
            <h1 className="mt-5 text-[clamp(2rem,7vw,3.75rem)] leading-[1.08] break-words">
              Let's Help You <span className="text-gold">Moon</span> Your Goods Faster to Nigeria and
              Other Countries
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-[clamp(0.95rem,2.6vw,1.125rem)] text-primary-foreground/80 lg:mx-0">
              We move cargo from Guangzhou and Yiwu into Lagos, Onitsha and Kano, and export to
              other European countries as well — by sea and by air. You get one waybill, honest
              transit times, and a tracking page to view the process of your shipping.
            </p>

            <div className="mt-8 flex w-full max-w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
              <Button asChild variant="hero" size="lg" className="w-full text-sm sm:w-auto">
                <Link to="/auth">
                  <PackageSearch aria-hidden="true" />
                  Track my shipment
                </Link>
              </Button>
              <Button asChild variant="onDark" size="lg" className="w-full text-sm sm:w-auto">
                <Link to="/quote">Get a price now</Link>
              </Button>
              <Button
                asChild
                variant="hero"
                size="lg"
                className="h-auto min-h-12 w-full px-4 py-3 text-sm leading-snug whitespace-normal sm:w-auto"
              >
                <Link
                  to="/how-it-works"
                  hash="warehouse-addresses"
                  className="whitespace-normal text-center"
                >
                  <MapPin className="shrink-0" aria-hidden="true" />
                  Ordered? Copy Our China Warehouse Address
                </Link>
              </Button>
            </div>

            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left text-sm text-primary-foreground/75 sm:grid-cols-2 lg:mx-0">
              {[
                { icon: Clock3, text: "Sea 40–60 days · Air 7–12 days, stated upfront" },
                { icon: ShieldCheck, text: "Every carton weighed and photographed on arrival" },
                { icon: MapPin, text: "Pickup in Lagos, Onitsha and Kano" },
                { icon: Banknote, text: "Same-day RMB payments to your supplier" },
              ].map((item) => (
                <li key={item.text} className="flex min-w-0 items-start gap-2.5">
                  <item.icon className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 break-words">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Live-style tracking HUD over the orbit motif */}
          <Reveal delay={120}>
            <div className="relative mx-auto w-full max-w-md">
              <OrbitVisual className="w-full" />
              <div className="mt-[-2rem] rounded-3xl border border-primary-foreground/15 bg-primary-deep/85 p-5 backdrop-blur sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-bold tracking-[0.16em] text-primary-foreground/55 uppercase">
                      Shipment status
                    </p>
                    <p className="font-extrabold">Guangzhou → Onitsha</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/20 px-3 py-1.5 text-xs font-bold text-leaf">
                    <span className="size-2 rounded-full bg-leaf animate-stage-pulse" />
                    In Warehouse
                  </span>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
                  <div className="h-full w-[34%] rounded-full bg-gold-gradient" />
                </div>
                <div className="mt-3 flex justify-between text-[0.68rem] font-semibold text-primary-foreground/60">
                  <span className="text-gold">In Warehouse</span>
                  <span>Shipped</span>
                  <span>In Nigeria</span>
                  <span>Ready for Pickup</span>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 border-t border-primary-foreground/10 pt-4 text-center">
                  <div>
                    <p className="text-lg font-extrabold text-gold">4</p>
                    <p className="text-[0.65rem] text-primary-foreground/60">Cartons</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gold">46kg</p>
                    <p className="text-[0.65rem] text-primary-foreground/60">Weight</p>
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-gold">Onitsha</p>
                    <p className="text-[0.65rem] text-primary-foreground/60">Pickup point</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-primary-foreground/55">
                This is how your own shipment appears once you log in.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <TrustStrip />

      <Section
        eyebrow="What we do"
        title="Five services, one company that answers its phone"
        intro="Shipping, exports, freight forwarding, warehouse consolidation and RMB exchange — handled by one team you can reach when you need help."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICES.map((service, i) => {
            const Icon = SERVICE_ICONS[i] ?? Package;
            return (
              <Reveal key={service.slug} delay={i * 90}>
                <Link
                  to="/services/$slug"
                  params={{ slug: service.slug }}
                  className={service.slug === "rmb-exchange" ? "card-hover flex h-full flex-col rounded-3xl border border-leaf bg-leaf-gradient p-6 text-white" : "card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-6"}
                >
                  <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold">{service.title}</h3>
                  <p className={service.slug === "rmb-exchange" ? "mt-2 flex-1 text-sm leading-relaxed text-white/85" : "mt-2 flex-1 text-sm leading-relaxed text-muted-foreground"}>
                    {service.blurb}
                  </p>
                  {service.slug === "rmb-exchange" ? (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-white">
                      CLICK HERE TO BUY RMB <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-primary">
                      Read More <ArrowRight className="size-4" aria-hidden="true" />
                    </span>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="Public pricing"
        title="See the price before you talk to anybody"
        intro="No login, no app download, no 'contact us for pricing'. Change the numbers and watch the estimate move."
      >
        <RateCalculator compact />
      </Section>

      <Section
        eyebrow="The journey"
        title="From a seller's warehouse in China to your hand in Nigeria"
        intro="Five stages, and you can see which one your goods are on at any moment."
      >
        <JourneyTimeline />
        <div className="mt-10 grid gap-6 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
          <img
            src="/images/warehouse-china.jpg"
            alt="Kennymoon staff labelling cartons in our Guangzhou consolidation warehouse"
            width={1280}
            height={853}
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <div className="p-6 sm:p-8">
            <p className="eyebrow text-leaf">Our warehouse, not an agent's</p>
            <h3 className="mt-2.5 text-2xl">
              Guangzhou and Yiwu, staffed by people on our own payroll
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              When your seller delivers, our own team receives it — not a third-party consolidator
              who has never heard your name. That is why we can tell you the exact weight, send you
              a photo of the carton, and hold it free for 21 days while you wait for your other
              sellers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button asChild>
                <Link to="/how-it-works">See the seller checkout guide</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/locations">Warehouse addresses</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="Two things nobody else gives you"
        title="Live tracking, and a dashboard that is actually yours"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-leaf-gradient text-primary-foreground">
                <PackageSearch className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold">Track from your secure account</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                 Sign up or log in, enter any supplier tracking number, and see the shipment move from
                 Not Yet in Warehouse through receiving, shipping and pickup.
              </p>
              <Button asChild className="mt-5 self-start">
                <Link to="/auth">Track a shipment</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={110}>
            <div className="card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-7">
              <span className="grid size-11 place-items-center rounded-2xl bg-gold-gradient text-gold-foreground">
                <Plane className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold">Your own customer dashboard</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                Sign up with an email or phone code and you get real modules: parcels you've
                pre-alerted, shipments in motion, and your RMB transaction history. Not a profile page
                with your name on it.
              </p>
              <Button asChild variant="leaf" className="mt-5 self-start">
                <Link to="/auth">Create a free account</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section
        eyebrow="Customers"
        title="Traders who let us handle their cargo"
        intro="Real businesses, real cities, real shipment counts."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.slice(0, 2).map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="card-hover flex h-full flex-col rounded-3xl border border-border bg-card p-6">
                <blockquote className="flex-1 text-sm leading-relaxed">"{t.quote}"</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-5">
                  <img
                    src={t.photo}
                    alt={`${t.name}, ${t.business} in ${t.city}`}
                    width={640}
                    height={640}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-extrabold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.business} · {t.city} · {t.stat}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/testimonials">Read all customer stories</Link>
          </Button>
        </div>
      </Section>

      {/* Plain-text answers: crawlable by search engines and AI assistants. */}
      <Section
        eyebrow="Quick answers"
        title="China to Nigeria shipping, answered in plain text"
        intro="The facts most importers ask us for, written out so search engines and AI assistants can read them directly."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {FAQS.slice(0, 4).map((faq) => (
            <article key={faq.q} className="min-w-0 rounded-3xl border border-border bg-card p-6">
              <h3 className="text-base font-extrabold">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <Button asChild variant="outline">
            <Link to="/faq">Read every answer</Link>
          </Button>
        </div>
      </Section>

      <section className="bg-forest py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl">
              Ready to move your next order the easy way?
            </h2>
            <p className="mt-4 text-base text-primary-foreground/80">
              Send us a message with what you're buying and where you want to collect it. We'll tell
              you the price, the transit time, and exactly what to write on your seller's checkout
              form.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/contact">Send us a message</Link>
              </Button>
              <Button asChild variant="onDark" size="lg">
                <Link to="/quote">Use the calculator</Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
