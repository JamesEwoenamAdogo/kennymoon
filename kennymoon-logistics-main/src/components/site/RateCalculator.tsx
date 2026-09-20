import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, Calculator, Plane, Ruler, Ship } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { getUsdToNgn } from "@/lib/fx.functions";
import { AIR_RATES_USD, SEA_RATES_NGN, naira } from "@/lib/site";
import { cn } from "@/lib/utils";

type Mode = "sea" | "air";

type RateRow = {
  mode: Mode;
  tier: string;
  label: string;
  rate: number;
  currency: string;
  unit: string;
  min_cbm: number | null;
  sort_order: number;
};

export function RateCalculator({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<Mode>("sea");
  const [seaTier, setSeaTier] = useState("lagos_tradefair");
  const [airTier, setAirTier] = useState<string>(AIR_RATES_USD[0].tier);
  const [weight, setWeight] = useState("45");

  // CBM helper (length x width x height in cm)
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("40");
  const [height, setHeight] = useState("25");
  const [cbm, setCbm] = useState("0.4");
  const [cbmFromHelper, setCbmFromHelper] = useState(true);

  const live = useQuery({
    queryKey: ["public-rates"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [rates, fx] = await Promise.all([
        supabase
          .from("rate_card")
          .select("mode, tier, label, rate, currency, unit, min_cbm, sort_order")
          .order("sort_order"),
        getUsdToNgn(),
      ]);
      return {
        rates: (rates.data ?? []) as RateRow[],
        usdToNgn: fx.rate,
      };
    },
  });

  const seaRows = (live.data?.rates ?? []).filter((r) => r.mode === "sea");
  const airRows = (live.data?.rates ?? []).filter((r) => r.mode === "air");
  const usdToNgn = live.data?.usdToNgn ?? null;

  const helperCbm = useMemo(() => {
    const l = Number(length) || 0;
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    return (l * w * h) / 1_000_000;
  }, [length, width, height]);

  const effectiveCbm = cbmFromHelper ? helperCbm : Math.max(Number(cbm) || 0, 0);

  const seaOptions = seaRows.length > 0
    ? seaRows.map((r) => ({ tier: r.tier, label: r.label, perCbm: r.rate, minCbm: r.min_cbm ?? 0 }))
    : SEA_RATES_NGN.map((r) => ({ tier: r.tier, label: r.label, perCbm: r.perCbm, minCbm: r.minCbm }));

  const airOptions = airRows.length > 0
    ? airRows.map((r) => ({
        tier: r.tier,
        label: r.label,
        perKgNgn: r.currency === "USD" && usdToNgn ? r.rate * usdToNgn : r.rate,
        perKgUsd: r.currency === "USD" ? r.rate : null,
      }))
    : AIR_RATES_USD.map((r) => ({
        tier: r.tier,
        label: r.label,
        perKgNgn: usdToNgn ? r.perKg * usdToNgn : null,
        perKgUsd: r.perKg,
      }));

  const selectedSea = seaOptions.find((o) => o.tier === seaTier) ?? seaOptions[0];
  const selectedAir = airOptions.find((o) => o.tier === airTier) ?? airOptions[0];

  const belowMinimum = mode === "sea" && selectedSea && effectiveCbm > 0 && effectiveCbm < selectedSea.minCbm;

  const result = useMemo(() => {
    if (mode === "sea") {
      const perCbm = selectedSea?.perCbm ?? 0;
      const freight = effectiveCbm * perCbm;
      return { freight, perCbm };
    }
    const kg = Math.max(Number(weight) || 0, 0);
    const perKgNgn = selectedAir?.perKgNgn ?? 0;
    const freight = kg * perKgNgn;
    return { freight, perKgNgn, kg };
  }, [mode, effectiveCbm, selectedSea, weight, selectedAir]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-lift",
        compact ? "" : "lg:grid lg:grid-cols-5",
      )}
    >
      <div className={cn("min-w-0 p-5 sm:p-8", compact ? "" : "lg:col-span-3")}>
        <div className="flex items-center gap-2">
          <Calculator className="size-5 text-leaf" aria-hidden="true" />
          <h3 className="text-lg font-extrabold">Real-time CBM calculator</h3>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Live rates from our published rate card
          {usdToNgn ? ` · $1 = ${naira(usdToNgn)}` : ""}.
        </p>

        <div
          className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1.5"
          role="group"
          aria-label="Freight mode"
        >
          {(["sea", "air"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-300 ease-out",
                mode === m
                  ? "bg-card text-primary shadow-soft"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {m === "sea" ? (
                <Ship className="size-4" aria-hidden="true" />
              ) : (
                <Plane className="size-4" aria-hidden="true" />
              )}
              {m === "sea" ? "Sea freight" : "Air freight"}
            </button>
          ))}
        </div>

        {mode === "sea" ? (
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="calc-sea-tier">Pickup location</Label>
              <select
                id="calc-sea-tier"
                value={seaTier}
                onChange={(e) => setSeaTier(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {seaOptions.map((r) => (
                  <option key={r.tier} value={r.tier}>
                    {r.label} — {naira(r.perCbm)}/CBM
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Ruler className="size-4 text-leaf" aria-hidden="true" />
                CBM helper (dimensions in cm)
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5">
                <div>
                  <Label htmlFor="calc-l">Length</Label>
                  <Input
                    id="calc-l"
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      setCbmFromHelper(true);
                    }}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="calc-w">Width</Label>
                  <Input
                    id="calc-w"
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                      setCbmFromHelper(true);
                    }}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="calc-h">Height</Label>
                  <Input
                    id="calc-h"
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={height}
                    onChange={(e) => {
                      setHeight(e.target.value);
                      setCbmFromHelper(true);
                    }}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <p className="mt-2.5 text-xs text-muted-foreground">
                = {helperCbm.toFixed(3)} CBM. Or enter your CBM directly below.
              </p>
            </div>

            <div>
              <Label htmlFor="calc-cbm">Volume (CBM)</Label>
              <Input
                id="calc-cbm"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                value={cbmFromHelper ? helperCbm.toFixed(3) : cbm}
                onChange={(e) => {
                  setCbm(e.target.value);
                  setCbmFromHelper(false);
                }}
                className="mt-1.5"
              />
            </div>

            {belowMinimum && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>
                  {selectedSea?.label} requires a minimum of {selectedSea?.minCbm} CBM. Your entered
                  volume is below that minimum — we'll still quote at the {selectedSea?.minCbm} CBM
                  minimum rate.
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <Label htmlFor="calc-air-tier">Goods type</Label>
              <select
                id="calc-air-tier"
                value={airTier}
                onChange={(e) => setAirTier(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {airOptions.map((r) => (
                  <option key={r.tier} value={r.tier}>
                    {r.label} — ${r.perKgUsd}/kg
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="calc-weight">Total weight (kg)</Label>
              <Input
                id="calc-weight"
                type="number"
                min={0}
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="calc-city">Destination</Label>
              <Input id="calc-city" value="Lagos only" readOnly className="mt-1.5" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Air freight ships China → Lagos only. Onitsha and Kano are sea-only. A local Lagos
                delivery add-on is available on request.
              </p>
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          "min-w-0 bg-forest p-5 text-primary-foreground sm:p-8",
          compact ? "" : "lg:col-span-2",
        )}
      >
        <p className="eyebrow text-gold">Your estimate</p>
        <p className="mt-2 text-2xl font-extrabold break-words tabular-nums transition-all duration-500 sm:text-4xl">
          {naira(result.freight)}
        </p>
        <p className="mt-1 text-sm text-primary-foreground/70">
          {mode === "sea"
            ? `${effectiveCbm.toFixed(3)} CBM × ${naira(selectedSea?.perCbm ?? 0)}/CBM — fixed in Naira, does not move with FX`
            : `${Number(weight) || 0}kg × ${naira(selectedAir?.perKgNgn ?? 0)}/kg`}
        </p>

        <dl className="mt-6 space-y-2.5 text-sm">
          <div className="flex justify-between gap-4 border-b border-primary-foreground/15 pb-2.5">
            <dt className="text-primary-foreground/70">Freight</dt>
            <dd className="font-semibold tabular-nums">{naira(result.freight)}</dd>
          </div>
          {mode === "air" && (
            <div className="flex justify-between gap-4 border-b border-primary-foreground/15 pb-2.5">
              <dt className="text-primary-foreground/70">FX rate used</dt>
              <dd className="font-semibold tabular-nums">
                {usdToNgn ? `$1 = ${naira(usdToNgn)}` : "unavailable"}
              </dd>
            </div>
          )}
        </dl>

        <p className="mt-4 text-xs text-primary-foreground/60">
          Estimate excludes Customs duty, which we quote separately once we see your invoice.
          {mode === "air" && " A local Lagos delivery add-on is available for air shipments — ask our team."}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button asChild variant="hero" size="lg">
            <Link to="/auth">Create an account to proceed</Link>
          </Button>
          <Button asChild variant="onDark">
            <Link to="/auth">Already have an account? Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
