import { Package } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The Kennymoon "orbit" motif: a parcel orbiting the moon.
 * Used as the hero visual and as a functional progress indicator when
 * `progress` (0-1) is supplied.
 */
export function OrbitVisual({
  progress,
  className,
  animated = true,
}: {
  progress?: number;
  className?: string;
  animated?: boolean;
}) {
  const angle = progress === undefined ? 0 : -90 + progress * 360;

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      <div
        className="absolute inset-[12%] rounded-full bg-leaf-gradient opacity-40 blur-2xl animate-glow"
        aria-hidden="true"
      />
      <div className="absolute inset-[6%] rounded-full border border-gold/25" aria-hidden="true" />
      <div className="absolute inset-[18%] rounded-full border border-gold/15" aria-hidden="true" />

      <img
        src="/images/moon.png"
        alt="Kennymoon crescent moon"
        width={512}
        height={512}
        className="absolute inset-[22%] h-[56%] w-[56%] drop-shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      />

      <div
        className={cn(
          "absolute inset-0",
          animated && progress === undefined && "animate-orbit",
          progress !== undefined && "transition-transform duration-[1200ms] ease-out",
        )}
        style={progress !== undefined ? { transform: `rotate(${angle}deg)` } : undefined}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <div
            className={cn(
              "grid size-11 place-items-center rounded-xl bg-gold-gradient text-gold-foreground shadow-lift sm:size-14",
              animated && progress === undefined && "animate-orbit-counter",
            )}
          >
            <Package className="size-5 sm:size-6" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
