import type { ReactNode } from "react";

import { Reveal } from "@/components/site/Reveal";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-forest text-primary-foreground">
      <div
        className="absolute -top-24 -right-24 size-72 rounded-full bg-gold/15 blur-3xl animate-drift"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <Reveal>
          <p className="eyebrow text-gold">{eyebrow}</p>
          <h1 className="mt-3 max-w-3xl text-3xl leading-tight sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base text-primary-foreground/80 sm:text-lg">{intro}</p>
          {children && <div className="mt-7">{children}</div>}
        </Reveal>
      </div>
    </section>
  );
}

export function Section({
  eyebrow,
  title,
  intro,
  children,
  tone = "default",
}: {
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: ReactNode;
  tone?: "default" | "cream";
}) {
  return (
    <section className={tone === "cream" ? "bg-cream py-16 sm:py-20" : "py-16 sm:py-20"}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {(eyebrow || title) && (
          <Reveal>
            <div className="max-w-2xl">
              {eyebrow && <p className="eyebrow text-leaf">{eyebrow}</p>}
              {title && <h2 className="mt-2.5 text-2xl sm:text-3xl lg:text-4xl">{title}</h2>}
              {intro && <p className="mt-3 text-base text-muted-foreground">{intro}</p>}
            </div>
          </Reveal>
        )}
        <div className={eyebrow || title ? "mt-10" : ""}>{children}</div>
      </div>
    </section>
  );
}
