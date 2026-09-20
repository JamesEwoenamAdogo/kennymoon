import { Package, Plane, Ship } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Ambient cargo-motion layer for the hero. Purely decorative: sits behind the
 * hero content, never intercepts pointer events, and is hidden from a11y tree.
 */
export function CargoMotion({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden select-none",
        className,
      )}
    >
      {/* Trade-route lines */}
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-[0.5]"
      >
        <defs>
          <linearGradient id="km-route" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--leaf)" stopOpacity="0" />
            <stop offset="45%" stopColor="var(--leaf)" stopOpacity="0.85" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="km-route-air" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0" />
            <stop offset="55%" stopColor="var(--gold)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="var(--leaf)" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Sea route */}
        <path
          id="km-sea-path"
          d="M-40 430 C 240 350, 420 500, 660 400 S 980 250, 1240 300"
          fill="none"
          stroke="url(#km-route)"
          strokeWidth="2"
          strokeDasharray="10 14"
          className="animate-cargo-dash"
        />
        {/* Air route */}
        <path
          id="km-air-path"
          d="M-40 190 C 260 90, 520 240, 780 140 S 1050 60, 1240 110"
          fill="none"
          stroke="url(#km-route-air)"
          strokeWidth="1.5"
          strokeDasharray="4 18"
          className="animate-cargo-dash"
          style={{ animationDuration: "9s" }}
        />

        {/* Node pulses along the route */}
        {[
          [200, 396],
          [660, 400],
          [980, 268],
        ].map(([cx, cy], i) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="4"
            fill="var(--gold)"
            className="animate-stage-pulse"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </svg>

      {/* Ship travelling the sea lane */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <g>
            <animateMotion
              dur="22s"
              repeatCount="indefinite"
              rotate="auto"
              path="M-40 430 C 240 350, 420 500, 660 400 S 980 250, 1240 300"
            />
            <g transform="translate(-14,-14)" opacity="0.85">
              <foreignObject width="28" height="28">
                <Ship className="size-7 text-leaf" strokeWidth={1.6} />
              </foreignObject>
            </g>
          </g>
          <g>
            <animateMotion
              dur="15s"
              repeatCount="indefinite"
              rotate="auto"
              path="M-40 190 C 260 90, 520 240, 780 140 S 1050 60, 1240 110"
            />
            <g transform="translate(-13,-13)" opacity="0.8">
              <foreignObject width="26" height="26">
                <Plane className="size-6 text-gold" strokeWidth={1.6} />
              </foreignObject>
            </g>
          </g>
        </svg>
      </div>

      {/* Floating containers */}
      {[
        { top: "18%", left: "6%", size: "size-8", delay: "0s", tone: "text-gold/70" },
        { top: "62%", left: "16%", size: "size-6", delay: "1.4s", tone: "text-leaf/70" },
        { top: "76%", left: "48%", size: "size-7", delay: "2.6s", tone: "text-gold/50" },
        { top: "26%", left: "78%", size: "size-6", delay: "0.8s", tone: "text-leaf/60" },
      ].map((c) => (
        <div
          key={`${c.top}-${c.left}`}
          className="absolute animate-cargo-bob"
          style={{ top: c.top, left: c.left, animationDelay: c.delay }}
        >
          <Package className={cn(c.size, c.tone)} strokeWidth={1.5} />
        </div>
      ))}

      {/* Rising cargo particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="absolute size-1 rounded-full bg-gold/50 animate-cargo-particle"
          style={{
            left: `${8 + i * 9}%`,
            top: `${70 + (i % 4) * 6}%`,
            animationDelay: `${i * 0.55}s`,
            animationDuration: `${5.5 + (i % 3)}s`,
          }}
        />
      ))}

      {/* Radar sweep over the HUD side */}
      <span className="absolute top-0 right-[8%] h-24 w-px bg-gradient-to-b from-transparent via-gold/60 to-transparent animate-cargo-scan" />
    </div>
  );
}
