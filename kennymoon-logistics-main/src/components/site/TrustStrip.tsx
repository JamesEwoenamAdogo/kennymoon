import { CountUp } from "@/components/site/CountUp";
import { Reveal } from "@/components/site/Reveal";
import { TRUST_STATS } from "@/lib/site";

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-cream py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {TRUST_STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90}>
              <div>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-extrabold tabular-nums text-primary sm:text-4xl">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </span>
                  <span className="mt-1.5 block text-sm text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
