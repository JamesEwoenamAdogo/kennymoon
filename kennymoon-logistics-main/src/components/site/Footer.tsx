import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Music2, Phone, Send } from "lucide-react";

import { BRAND, PICKUP_CITIES, SERVICES } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/images/kennymoon-footer-logo.png" alt="Kennymoon Int'l Ltd mark" width={80} height={80} loading="lazy" className="h-14 w-14 object-contain" />
            <span className="text-base font-extrabold">Kennymoon Int'l Ltd</span>
          </div>
          <p className="mt-4 text-sm text-primary-foreground/75">
            {BRAND.tagline}. Shipping, freight forwarding, warehouse consolidation and RMB exchange between
            China and Nigeria since 2016.
          </p>
          <Link
            to="/contact"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-leaf-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
          >
            Talk to our team
          </Link>
        </div>

        <div>
          <h2 className="eyebrow text-gold">Services</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="text-primary-foreground/75 transition-colors hover:text-gold"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold">Company</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: "/auth", label: "Track a shipment" },
              { to: "/quote", label: "Shipping rates" },
              { to: "/how-it-works", label: "How it works" },
              { to: "/locations", label: "Warehouse & pickup" },
              { to: "/about", label: "About us" },
              { to: "/testimonials", label: "Customer reviews" },
              { to: "/faq", label: "FAQ" },
              { to: "/contact", label: "Contact" },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="text-primary-foreground/75 transition-colors hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="eyebrow text-gold">Reach us</h2>
          <ul className="mt-4 space-y-3 text-sm text-primary-foreground/75">
            <li>
              <a
                href={BRAND.phoneHref}
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Phone className="size-4" aria-hidden="true" />
                {BRAND.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Mail className="size-4" aria-hidden="true" />
                {BRAND.email}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${BRAND.altEmail}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Mail className="size-4" aria-hidden="true" />
                {BRAND.altEmail}
              </a>
            </li>
            <li>
              <a
                href={BRAND.facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Facebook className="size-4" aria-hidden="true" />
                Facebook
              </a>
            </li>
            <li>
              <a
                href={BRAND.tiktok}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Music2 className="size-4" aria-hidden="true" />
                TikTok
              </a>
            </li>
            <li>
              <a
                href={BRAND.telegram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Send className="size-4" aria-hidden="true" />
                Telegram
              </a>
            </li>
            <li>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Instagram className="size-4" aria-hidden="true" />
                @kennymoonintl
              </a>
            </li>

          </ul>
          <p className="mt-5 text-sm text-primary-foreground/60">
            Pickup in {PICKUP_CITIES.map((c) => c.city).join(", ")}.
          </p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 py-5">
        <p className="mx-auto max-w-7xl px-4 text-xs text-primary-foreground/55 sm:px-6">
          © {new Date().getFullYear()} Kennymoon Int'l Ltd. RC 1428907. Trust, Integrity and
          Service.
        </p>
      </div>
    </footer>
  );
}
