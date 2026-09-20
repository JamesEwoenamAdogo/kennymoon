import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageSquareText, Phone, Send } from "lucide-react";

import { LeadForm } from "@/components/site/LeadForm";
import { PageHero, Section } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { BRAND, PICKUP_CITIES, whatsappLink } from "@/lib/site";


export const Route = createFileRoute("/contact")({
  head: () => ({
    links: [{ rel: "canonical", href: "/contact" }],
    meta: [
      { title: "Contact Kennymoon Int'l Ltd — WhatsApp, Phone, Offices" },
      {
        name: "description",
        content:
          "Reach Kennymoon on WhatsApp, Telegram, phone, email or Instagram, or visit our pickup offices in Lagos, Onitsha and Kano.",
      },
      { property: "og:title", content: "Contact Kennymoon Int'l Ltd" },
      { property: "og:url", content: "/contact" },
      {
        property: "og:description",
        content: "WhatsApp, Telegram, phone, email and our three Nigerian offices.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const channels = [
    { icon: MessageSquareText, label: "WhatsApp", value: BRAND.phone, href: whatsappLink() },
    { icon: Phone, label: "Phone", value: BRAND.phone, href: BRAND.phoneHref },
    { icon: Send, label: "Telegram", value: "@kennymoonlogistics", href: BRAND.telegram },
    { icon: Mail, label: "Email", value: BRAND.email, href: `mailto:${BRAND.email}` },
    { icon: Instagram, label: "Instagram", value: "@kennymoonintl", href: BRAND.instagram },
  ];


  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to a person, not a ticket number"
        intro="Our WhatsApp line is answered from 8am to 8pm Nigerian time, seven days a week. For anything written, email works too."
      />

      <Section>
        <div className="rounded-3xl border border-leaf/40 bg-card p-6 text-center shadow-soft sm:p-8">
          <h2 className="text-xl font-extrabold">Fastest way: WhatsApp</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Send us a message and a real member of our team replies — 8am to 8pm Nigerian time,
            seven days a week.
          </p>
          <Button asChild size="lg" variant="leaf" className="mt-5">
            <a href={whatsappLink()} target="_blank" rel="noreferrer">
              <MessageSquareText aria-hidden="true" />
              Chat with us on WhatsApp
            </a>
          </Button>
        </div>
      </Section>



      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-xl font-extrabold">Ways to reach us</h2>
            <ul className="mt-5 space-y-3">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <c.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{c.label}</span>
                      <span className="block text-sm text-muted-foreground">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-xl font-extrabold">Our offices</h2>
            <ul className="mt-4 space-y-4">
              {PICKUP_CITIES.map((city) => (
                <li key={city.id} className="rounded-2xl border border-border bg-cream p-4">
                  <p className="flex items-center gap-2 text-sm font-bold text-primary">
                    <MapPin className="size-4" aria-hidden="true" />
                    {city.city}
                  </p>
                  <p className="mt-1.5 text-sm text-muted-foreground">{city.address}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {city.hours} · Ask for {city.manager}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <LeadForm
            source="contact"
            heading="Send us a message"
            blurb="Give us the details and we'll come back with a firm answer — usually the same day."
          />
        </div>
      </Section>
    </>
  );
}
