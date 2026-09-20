import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Check, Copy, Plane, Ship } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { JourneyTimeline } from "@/components/site/JourneyTimeline";
import { PageHero, Section } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHINA_WAREHOUSES } from "@/lib/site";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    links: [{ rel: "canonical", href: "/how-it-works" }],
    meta: [
      { title: "How It Works: Our China Warehouse Addresses | Kennymoon" },
      {
        name: "description",
        content:
          "You buy your goods yourself on Pinduoduo, 1688 or Taobao. Paste Kennymoon's China warehouse address into your supplier's checkout — our job starts when your carton reaches the warehouse.",
      },
      { property: "og:title", content: "How It Works | Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/how-it-works" },
      {
        property: "og:description",
        content:
          "Our China warehouse addresses, ready-to-copy shipping marks, and the five stages your cargo passes through after it lands with us.",
      },
    ],
  }),
  component: HowItWorks,
});

function copyToClipboard(value: string, label: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success(`${label} copied`))
    .catch(() => toast.error("Couldn't copy — please copy it manually."));
}

function CopyableBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</p>
        <Button type="button" size="sm" variant="outline" onClick={() => copyToClipboard(value, label)}>
          <Copy aria-hidden="true" />
          Copy
        </Button>
      </div>
      <p className="mt-2 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap">{value}</p>
    </div>
  );
}

function EditNoteCallout({ note }: { note: string }) {
  return (
    <div className="mt-4 flex items-start gap-3 rounded-2xl border-2 border-gold bg-gold/10 p-4">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
      <p className="text-sm font-semibold text-foreground">{note}</p>
    </div>
  );
}

function GuangzhouMarkGenerator({ prefix, cities }: { prefix: string; cities: string[] }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState(cities[0] ?? "");
  const mark = `${prefix} / ${name || "[your name]"} GP / ${city || "[city]"}`;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background p-4">
      <p className="text-sm font-bold">Generate your shipping mark (唛头)</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="gz-name">Your name</Label>
          <Input
            id="gz-name"
            className="mt-1.5"
            placeholder="e.g. Amaka"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gz-city">Pickup city</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger id="gz-city" className="mt-1.5 w-full">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
        <p className="font-mono text-sm font-bold">{mark}</p>
        <Button
          type="button"
          size="sm"
          onClick={() => copyToClipboard(mark, "Shipping mark")}
          disabled={!name}
        >
          <Copy aria-hidden="true" />
          Copy
        </Button>
      </div>
    </div>
  );
}

function AjaoMarkGenerator() {
  const [code, setCode] = useState("");
  const mark = `Kennymoon / ${code || "[name and code]"}`;

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background p-4">
      <p className="text-sm font-bold">Generate your shipping mark</p>
      <div className="mt-3">
        <Label htmlFor="ajao-code">Your name and Kennymoon code</Label>
        <Input
          id="ajao-code"
          className="mt-1.5"
          placeholder="e.g. Amaka KM-4821"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-secondary p-3">
        <p className="font-mono text-sm font-bold">{mark}</p>
        <Button
          type="button"
          size="sm"
          onClick={() => copyToClipboard(mark, "Shipping mark")}
          disabled={!code}
        >
          <Copy aria-hidden="true" />
          Copy
        </Button>
      </div>
    </div>
  );
}

function WarehouseCard({ warehouse }: { warehouse: (typeof CHINA_WAREHOUSES)[number] }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
      <h3 className="text-xl font-extrabold">{warehouse.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{warehouse.serves}</p>

      <div className="mt-5 space-y-3">
        <CopyableBlock label="Address (地址)" value={warehouse.address} />
        <div className="grid gap-3 sm:grid-cols-3">
          <CopyableBlock label="Phone" value={warehouse.phone} />
          {"zip" in warehouse && warehouse.zip && <CopyableBlock label="Post code" value={warehouse.zip} />}
          {"manager" in warehouse && warehouse.manager && (
            <CopyableBlock label="Manager" value={warehouse.manager} />
          )}
        </div>
      </div>

      <EditNoteCallout note={warehouse.editNote} />

      {warehouse.mark && <GuangzhouMarkGenerator prefix={warehouse.mark.prefix} cities={warehouse.mark.cities} />}
      {warehouse.id === "ajao" && <AjaoMarkGenerator />}
    </div>
  );
}

function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="You buy the goods. We handle everything from the warehouse door."
        intro="Kennymoon does not source or buy goods for you. You shop yourself on Pinduoduo, 1688 or Taobao, then paste our China warehouse address into the supplier's checkout as the delivery address. Our job — consolidation, shipping, customs and pickup — starts the moment your carton lands with us."
      />

      <Section
        eyebrow="Step 1"
        title="Buy it yourself, and ship it to us"
        intro="Search for and pay for your goods directly with the Chinese seller. At checkout, use one of our warehouse addresses below as the shipping/delivery address, with your own name and code added exactly as instructed."
      >
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          <ol className="grid gap-4 sm:grid-cols-3">
            <li>
              <p className="text-sm font-bold text-primary">1. You buy</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Order and pay the seller yourself on Pinduoduo, 1688 or Taobao — Kennymoon is not involved
                in the purchase.
              </p>
            </li>
            <li>
              <p className="text-sm font-bold text-primary">2. You paste our address</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy the correct warehouse address below into the seller's checkout, with your name and
                GP/Kennymoon code inserted where shown.
              </p>
            </li>
            <li>
              <p className="text-sm font-bold text-primary">3. We take it from there</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Once your carton reaches our warehouse we weigh it, photograph it, consolidate it and ship
                it — that is where Kennymoon's work begins.
              </p>
            </li>
          </ol>
        </div>
      </Section>

      <div id="warehouse-addresses" className="scroll-mt-24">
        <Section
          tone="cream"
          eyebrow="Step 2"
          title="Our China warehouse addresses"
          intro="Pick the warehouse that matches your route, copy each field into the supplier's checkout form, and never forget to insert your own name and code."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            {CHINA_WAREHOUSES.map((w) => (
              <WarehouseCard key={w.id} warehouse={w} />
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-border bg-card p-6 sm:grid-cols-2 sm:p-8">
            <div className="flex items-start gap-3">
              <Ship className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                 <span className="font-bold text-foreground">Ajao Estate supports sea and air.</span> Use
                 the Ajao Estate route for either shipping mode when that is your selected Lagos location.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Plane className="mt-0.5 size-5 shrink-0 text-leaf" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                 <span className="font-bold text-foreground">Trade Fair is sea only.</span> Onitsha and
                 Kano are also served by sea freight, while Ajao Estate supports sea and air.
              </p>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">Codes matter.</span> Trade Fair (Onitsha and
                Kano) orders use a <span className="font-mono font-bold">GP</span> code prefix, while Ajao
                Estate orders use a <span className="font-mono font-bold">KM</span> prefix. Using the wrong
                code delays your carton being matched to your order.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <Section
        eyebrow="Step 3"
        title="Then your goods move through five stages"
        intro="You can see which stage you're on at any moment, on the tracking page or in your dashboard."
      >
        <JourneyTimeline />
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/auth">Track a shipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/quote">Work out my cost</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
