# Kennymoon Int'l Shipping Ltd.

Create a new project with Supabase enabled.

Kennymoon Int'l Ltd — Master Build Prompt for Lovable

Paste this whole prompt into Lovable to kick off the build. It covers brand identity, sitemap, page-by-page requirements, animation/interaction spec, integrations, and content rules.

0. Project Summary

Build a full multi-page, mobile-first, production-grade marketing + product website for Kennymoon Int'l Ltd, a China–Nigeria shipping, freight forwarding, procurement, and RMB exchange company.

Tagline: "Trust, Integrity and Service" Hero line: "Let's Help You Moon Your Goods Faster"

Kennymoon is entering a market with three direct competitors — FastForth, Palscargo, and SkyJet Logistics — none of which combine a responsive real-time tracking dashboard, a dedicated sign-up-linked customer dashboard, and a full multi-page product experience in one polished site. Kennymoon's site must beat all three on exactly those two pillars while keeping a warm, trust-driven Nigerian SME brand voice (not a cold enterprise SaaS voice).

The two non-negotiable differentiators the whole site is built around:

Responsive goods tracking — flawless on phone, tablet, desktop, with live status, progress stages, and waybill lookup available with or without login.

Dedicated sign-up dashboard — every account holder lands in a real personal dashboard (parcels, shipments, RMB transactions, procurement requests), not a generic profile page.

Build this as a fast, AI-assisted build — not a template-feeling site. Every page needs real content structure (no Lorem Ipsum, ever — see Section 7).

1. Brand Identity

Name: Kennymoon Int'l Ltd

Tagline: Trust, Integrity and Service

Hero tagline: "Let's Help You Moon Your Goods Faster"

Palette: Forest Green (deep, primary — e.g. #0F3D2E), Leaf Green (accent/secondary — e.g. #3FA34D / #2C7A3D), Gold (highlight/CTA accent), soft off-white/cream backgrounds, near-black body text (#1A2620). Pull exact values from the Kennymoon logo if provided; otherwise use the values above as defaults.

Typography: Clean, modern, highly legible sans-serif (e.g. Inter, Manrope, or similar) — confident headline weight, comfortable body weight. Avoid anything that reads as generic "corporate template."

Brand motif — the "orbit": Kennymoon's signature visual device is a parcel animating in orbit around a moon, tying the brand name directly to the hero visual and to the live tracking "progress" metaphor used throughout the product (a shipment "orbiting" toward delivery).

Voice: Warm, confident, trust-driven Nigerian SME voice — never cold enterprise SaaS copy. Speak like a company that personally knows its warehouse, its trucks, and its customers by name.

2. Design Direction — What To Adopt From Competitors, What To Avoid

Reference report: three competitors reviewed — FastForth (fastforth.co), Palscargo (palscargo.com), SkyJet Logistics (skyjet.ltd/mobile).

Adopt:

FastForth's dashboard-first hero — show a live-looking product preview (parcel counts, shipment status, "Ready for Pickup" style tags) directly on the homepage instead of a generic banner photo.

FastForth's visual route/journey diagram — China warehouse (Yiwu/Guangzhou) → consolidation → sea/air freight → customs → Lagos/Onitsha/Kano pickup — rendered as an ownable animated visual, not a bullet list.

Palscargo's seller-checkout walkthrough — a real step-by-step guide (with copy-to-clipboard warehouse address) showing exactly how to fill in the Chinese seller's checkout form (Name, Mobile, Post Code, Area, Comment) using Kennymoon's warehouse address. This is the single most common point of confusion for first-time importers — treat it as a first-class page section, not a footnote.

Palscargo's pre-alert + tracking split — separate "Add Package" (forecast/pre-alert) and "Track Package" entry points, mirroring how experienced buyers actually work.

Named testimonials with real photos, business names, and cities — never generic/reused stock photography, never omitted.

Hard trust numbers — total shipments handled, years in operation, sailings/week, average transit time (call out the realistic 40–60 day sea transit prominently and confidently, framed as reliability, not hidden).

WhatsApp as an always-visible channel — click-to-chat buttons wired throughout the site, not just the footer.

Avoid (competitor failure modes):

No placeholder/Lorem Ipsum content anywhere (Palscargo's biggest credibility failure).

No reused/generic stock testimonial photos.

No pricing hidden behind sign-up or an app (FastForth's gap) — Kennymoon's rate calculator must be public, on the homepage, no login required.

No chatbot-less external-only WhatsApp redirect (all three competitors lack an on-site conversational layer) — Kennymoon needs a real embedded chatbot.

No single long-scroll one-pager (SkyJet's weakest trait, and a mistake FastForth/Palscargo avoid too) — this must be a genuine multi-page site for both UX and SEO reasons (each page can target its own keyword: "China to Nigeria shipping," "RMB exchange Nigeria," "procurement services China," etc.).

No dated, dense, low-whitespace mobile-portal UI (SkyJet's weakest trait) — generous whitespace, clear visual hierarchy, clear CTA hierarchy throughout.

3. Sitemap — Build as 11 Distinct Pages

Page Purpose Home Brand story, orbit hero with live-style tracking HUD, service overview, trust signals, calculator teaser, route/journey visual teaser Track Shipment Public waybill lookup — responsive tracking with live status stages, no login required Sign Up / Dashboard Account creation flow (email/SMS OTP verification) leading into a dedicated customer dashboard: parcels, shipments, RMB transactions, procurement requests Get a Quote / Pricing Instant public cost calculator (air/sea, weight/volume → Naira estimate) + transparent rate table Services Overview page linking to four sub-pages: China–Nigeria Shipping, Freight Forwarding, Procurement, RMB/Yuan Exchange How It Works Step-by-step guide including the seller-checkout walkthrough (warehouse address entry, copy-to-clipboard) Warehouse & Pickup Locations Yiwu/Guangzhou warehouse details + Lagos, Onitsha, Kano pickup info, with interactive city map About Us Company story, trust and credibility content, "Trust, Integrity and Service" narrative Testimonials / Reviews Real customer stories — photos, cities, shipment stats FAQ Real, complete answers (this content also feeds the chatbot's knowledge base) Contact WhatsApp, Telegram, phone, Instagram, contact form

4. Core Product Features (build these as real, working UI — not static mockups)

4.1 Tracking & Dashboard

Public tracking by waybill number, with live status stages, accessible with or without login.

Dedicated dashboard for every signed-up user: parcels, shipments, RMB transactions, procurement requests — each as its own section/module, not a flat list.

Animated "orbit" progress visual — a parcel visually orbiting toward "delivered," used both as brand motif and functional progress indicator.

Parcel pre-alert tool — a distinct "Add Package" forecast flow, separate from "Track Package."

Authentication: sign-up and login secured via email/SMS OTP (one-time codes) — build the OTP entry UI as a clean, fast, low-friction flow (auto-advancing code inputs, resend timer, clear error states).

4.2 Lead Generation & Conversion

Quick quote-capture form (item type, weight/volume, pickup city) that can capture a lead before requiring full account sign-up.

On-site AI chatbot (floating widget, bottom-right) for FAQs and lead capture — with quick-reply buttons (e.g. "Warehouse address," "Shipping duration," "Today's RMB rate") and a clear hand-off path to a human WhatsApp agent.

One-tap WhatsApp click-to-chat buttons, prominent and repeated throughout the site (not just the footer).

Instant public Naira cost calculator — toggle Sea/Air, enter weight, select pickup city, live-recalculating estimate, no login required, prominently on both Home and Get a Quote.

4.3 Trust & Brand

Real testimonials with photos, names, business, and city.

Hard trust numbers displayed as a "trust strip" (shipments handled, years in operation, sailings/week, average transit time).

Interactive multi-city pickup map (Lagos, Onitsha, Kano) — positioned as both a trust signal and a lightweight lead-qualification step.

RMB Exchange and Procurement shown as their own branded product modules, not bullet points buried in a services list — give each a distinct visual identity within the shared palette.

4.4 Motion & Design

Signature animated "orbit" hero on the homepage — parcel animating around a moon, tied to the Kennymoon name, with a live-style tracking HUD overlay (waybill number, progress bar, stage labels).

Animated China–Nigeria journey timeline — a real five-step process reflecting Kennymoon's actual flow: buy → received → consolidated → shipped → pickup-ready.

Tasteful scroll-triggered reveals throughout (sections fade/slide into view on scroll — subtle, not gimmicky).

Hover micro-interactions on every interactive element:

Buttons: gentle scale/lift + color shift + shadow deepening on hover; visible active/pressed state.

Cards (services, testimonials, pricing tiers): subtle lift + border/shadow glow on hover, smooth transform-based (not layout-shifting) transitions.

Nav links: underline-draw or color-fade on hover.

Trust-number counters: animate count-up when scrolled into view.

Map pins / city selector: pulse or glow on hover, smooth marker transitions on selection.

Tracking progress dots/stages: subtle pulse animation on the "current" stage to draw the eye.

Chatbot bubble: gentle idle bounce/pulse to invite interaction, smooth open/close transition.

All animations should feel realistic and physics-based (ease-out/ease-in-out easing, no linear motion, no jarring snaps) — use CSS transitions/keyframes or a lightweight animation library; keep performance smooth on mobile.

5. Integrations (build the UI/flows now; wire real backend calls where feasible)

Integration Purpose Supabase (Auth + Database) Sign-up, login, dashboard data, tracking data Claude API On-site AI chatbot for FAQs and lead capture OTP Authentication (Email/SMS) Verifies sign-up & login via one-time codes WhatsApp (Click-to-Chat link) Direct link into Kennymoon's WhatsApp inbox — no business API needed Google Maps API Pickup-city selector & warehouse map Google Analytics Traffic & conversion tracking Paystack / Flutterwave (optional, phase 2) Online payment collection

6. Content Rules — No Exceptions

Never use placeholder/Lorem Ipsum text anywhere, including FAQ, testimonials, or service descriptions — every page ships with real, complete copy in Kennymoon's brand voice.

Never reuse the same stock photo across multiple testimonials.

Every page listed in Section 3 must exist as its own route — do not compress the site into a single scrolling page.

Pricing/calculator must always be publicly visible — never gated behind login.

7. Build Priority

Must-have at launch

Responsive live parcel tracking (public quick search + full detail post-login).

Dedicated sign-up-linked dashboard with OTP auth.

Full multi-page structure, including the seller-checkout walkthrough with copy-to-clipboard warehouse address.

WhatsApp/Telegram click-to-chat, prominent throughout.

Complete, real content on every page.

High-impact, build next

On-site chatbot for FAQs + lead capture.

Instant shipping cost calculator.

Animated route/journey visual on the homepage.

Real testimonials with photos, city, and shipment stats.

Phase 2 / nice-to-have

Branded RMB exchange rate widget.

Procurement request form as its own mini-product page.

City-based interactive pickup map.

Deeper dashboard parity (parcel counts, shipment history, notifications) matching FastForth's product-grade richness.

8. Reference Concept

A standalone homepage concept (Kennymoon-Homepage-Concept.html) already exists demonstrating the orbit hero, live cost calculator, chatbot widget, and journey timeline — treat it as the design-direction starting point and extend it into the full multi-page structure above, not as the final production build.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://moonbeam-logistics.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9bae03a8-2dcf-48b0-979a-408c6f43f061).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
