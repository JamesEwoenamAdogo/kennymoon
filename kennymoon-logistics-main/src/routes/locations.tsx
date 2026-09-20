import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { PageHero, Section } from "@/components/site/Sections";
import { ShippingRequestForm } from "@/components/site/ShippingRequestForm";

import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

import { PICKUP_CITIES, WAREHOUSE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/locations")({
  head: () => ({
    links: [{ rel: "canonical", href: "/locations" }],
    meta: [
      { title: "Warehouse & Pickup Locations: Lagos, Onitsha, Kano | Kennymoon" },
      {
        name: "description",
        content:
          "Kennymoon's Guangzhou and Yiwu warehouses plus pickup offices in Lagos, Onitsha and Kano — addresses, opening hours and the manager to ask for.",
      },
      { property: "og:title", content: "Warehouse & Pickup Locations | Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/locations" },
      {
        property: "og:description",
        content:
          "Where to send your cargo in China, and where to collect it in Nigeria.",
      },
    ],
  }),
  component: Locations,
});

function Locations() {
  const [active, setActive] = useState(PICKUP_CITIES[0]!.id);
  const city = PICKUP_CITIES.find((c) => c.id === active) ?? PICKUP_CITIES[0]!;
  const mapQuery = encodeURIComponent(`${city.address}, Nigeria`);

  return (
    <>
      <PageHero
        eyebrow="Warehouse & pickup"
        title="Two warehouses in China. Three pickup cities in Nigeria."
        intro="Send your goods to us in Guangzhou or Yiwu, then collect in Lagos, Onitsha or Kano — or let us truck it to your door."
      />

      <Section eyebrow="In China" title="Where your seller delivers">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-border bg-card">
            <img
              src="/images/warehouse-china.jpg"
              alt="Cartons being labelled inside Kennymoon's Guangzhou consolidation warehouse"
              width={1280}
              height={853}
              loading="lazy"
              className="h-56 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-lg font-extrabold">Guangzhou (main hub)</h3>
              <p className="mt-2 text-sm text-muted-foreground">{WAREHOUSE.street}</p>
              <p className="text-sm text-muted-foreground">
                {WAREHOUSE.area} · {WAREHOUSE.postCode}
              </p>
              <p className="mt-3 text-sm font-semibold">Warehouse line: {WAREHOUSE.mobile}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                Open Monday to Saturday, 9am–7pm China time. Receives from all Guangzhou, Foshan and
                Shenzhen markets.
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-cream p-6">
            <h3 className="text-lg font-extrabold">Yiwu (small goods)</h3>
            <p className="mt-2 text-sm text-muted-foreground">{WAREHOUSE.yiwu.street}</p>
            <p className="text-sm text-muted-foreground">
              {WAREHOUSE.yiwu.area} · {WAREHOUSE.yiwu.postCode}
            </p>
            <p className="mt-3 text-sm font-semibold">Warehouse line: {WAREHOUSE.yiwu.mobile}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Best for accessories, jewellery, stationery, small electronics and anything bought in
              the Yiwu International Trade City.
            </p>
            <div className="mt-5 rounded-2xl border border-leaf/30 bg-card p-4">
              <p className="text-sm font-bold text-primary">Always add your KM code</p>
              <p className="mt-1 text-sm text-muted-foreground">{WAREHOUSE.comment}</p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        tone="cream"
        eyebrow="In Nigeria"
        title="Pick your city and see exactly where to collect"
      >
        <div className="flex flex-wrap gap-2.5">
          {PICKUP_CITIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActive(c.id)}
              aria-pressed={active === c.id}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold transition-all duration-300 ease-out hover:-translate-y-0.5",
                active === c.id
                  ? "border-transparent bg-forest text-primary-foreground shadow-lift"
                  : "border-border bg-card text-primary hover:border-leaf",
              )}
            >
              <MapPin
                className={cn("size-4", active === c.id && "animate-stage-pulse rounded-full")}
                aria-hidden="true"
              />
              {c.city}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-2">
          <iframe
            title={`Map of Kennymoon ${city.city} pickup office`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full border-0 lg:h-full"
          />
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-extrabold">{city.city} pickup office</h3>
            <p className="mt-3 flex gap-2.5 text-sm">
              <MapPin className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
              {city.address}
            </p>
            <p className="mt-2.5 flex gap-2.5 text-sm">
              <Clock className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
              {city.hours}
            </p>
            <p className="mt-2.5 flex gap-2.5 text-sm">
              <Phone className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
              Ask for {city.manager} · {city.phone}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">{city.note}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Bring your waybill number and a valid ID. If someone is collecting on your behalf,
              send us their name beforehand.
            </p>
            <Button asChild variant="leaf" className="mt-6">
              <Link to="/contact">Arrange pickup in {city.city}</Link>
            </Button>
          </div>
        </div>

        {city.id === "onitsha" && (
          <div className="mt-8">
            <ShippingRequestForm pickupCity={city.city} />
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-3xl border border-border">
          <img
            src="/images/pickup-lagos.jpg"
            alt="A Kennymoon staff member handing a sealed carton to a customer at our Lagos pickup office"
            width={1280}
            height={853}
            loading="lazy"
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>

      </Section>
    </>
  );
}
