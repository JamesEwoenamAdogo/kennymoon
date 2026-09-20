import { Reveal } from "@/components/site/Reveal";
import { JOURNEY } from "@/lib/site";

export function JourneyTimeline() {
  return (
    <div className="relative">
      <div
        className="absolute top-6 left-0 hidden h-0.5 w-full bg-gradient-to-r from-leaf/20 via-leaf to-gold lg:block"
        aria-hidden="true"
      />
      <ol className="grid gap-8 lg:grid-cols-5 lg:gap-5">
        {JOURNEY.map((step, index) => (
          <Reveal key={step.stage} delay={index * 110}>
            <li className="group relative flex min-w-0 gap-4 lg:block">
              <div className="relative flex shrink-0 flex-col items-center lg:block">
                <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-full bg-forest text-base font-extrabold text-gold ring-4 ring-background transition-transform duration-500 ease-out group-hover:scale-110">
                  {index + 1}
                </span>
                <span
                  className="mt-2 w-0.5 flex-1 bg-border lg:hidden"
                  aria-hidden="true"
                />
              </div>
              <div className="min-w-0 pb-6 lg:pt-5 lg:pb-0">
                <p className="eyebrow text-leaf">{step.days}</p>
                <h3 className="mt-1.5 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
