import { useRef } from "react";

import { cn } from "@/lib/utils";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

/** Six separate boxes: auto-advance, backspace-back, and full paste support. */
export function OtpInput({
  value,
  onChange,
  length = 6,
  disabled,
  className,
  ...rest
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  const setDigit = (index: number, digit: string) => {
    const next = value.padEnd(length, " ").slice(0, length).split("");
    next[index] = digit || " ";
    onChange(next.join("").replace(/ +$/, ""));
  };

  return (
    <div
      className={cn("flex w-full max-w-full items-center gap-1.5 sm:gap-2.5", className)}
      role="group"
      aria-label={rest["aria-label"] ?? "6-digit verification code"}
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            refs.current[index] = el;
          }}
          value={digit.trim()}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            if (!raw) {
              setDigit(index, " ");
              return;
            }
            if (raw.length > 1) {
              onChange(raw.slice(0, length));
              refs.current[Math.min(raw.length, length - 1)]?.focus();
              return;
            }
            setDigit(index, raw);
            if (index < length - 1) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit.trim() && index > 0) {
              refs.current[index - 1]?.focus();
            }
            if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
            if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
            if (!pasted) return;
            onChange(pasted);
            refs.current[Math.min(pasted.length, length - 1)]?.focus();
          }}
          className="h-12 min-w-0 flex-1 rounded-xl border border-input bg-background text-center text-lg font-extrabold tabular-nums shadow-soft focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:h-14 sm:text-xl"
        />
      ))}
    </div>
  );
}
