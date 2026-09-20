import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { isSuperAdmin, ngn, shortDateTime, usd } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/rates")({
  component: AdminRates,
});

function AdminRates() {
  const { roles, userId } = useStaffRoles();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [fxDraft, setFxDraft] = useState("");

  const rates = useQuery({
    queryKey: ["rate-card"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rate_card")
        .select("id, mode, tier, label, rate, currency, unit, min_cbm, sort_order, updated_at")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const fx = useQuery({
    queryKey: ["fx-rate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fx_rate")
        .select("id, usd_to_ngn, updated_at")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const saveRate = useMutation({
    mutationFn: async (params: { id: string; rate: number }) => {
      const { error } = await supabase.from("rate_card").update({ rate: params.rate }).eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rate updated.");
      void queryClient.invalidateQueries({ queryKey: ["rate-card"] });
      void queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveFx = useMutation({
    mutationFn: async (value: number) => {
      const payload = { usd_to_ngn: value, updated_by: userId, updated_at: new Date().toISOString() };
      if (fx.data?.id) {
        const { error } = await supabase.from("fx_rate").update(payload).eq("id", fx.data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("fx_rate").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Exchange rate updated.");
      setFxDraft("");
      void queryClient.invalidateQueries({ queryKey: ["fx-rate"] });
      void queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isSuperAdmin(roles)) {
    return <p className="text-sm text-muted-foreground">Only a Super Admin can edit rates and FX.</p>;
  }

  const air = (rates.data ?? []).filter((r) => r.mode === "air");
  const sea = (rates.data ?? []).filter((r) => r.mode === "sea");
  const fxValue = Number(fx.data?.usd_to_ngn ?? 0);

  const RateRows = ({ rows }: { rows: NonNullable<typeof rates.data> }) => (
    <div className="space-y-3">
      {rows.map((row) => {
        const draft = drafts[row.id];
        const value = draft ?? String(row.rate);
        return (
          <div key={row.id} className="flex flex-wrap items-end justify-between gap-3 border-b border-border/60 pb-3 last:border-0">
            <div className="min-w-[180px]">
              <p className="text-sm font-semibold">{row.label}</p>
              <p className="text-xs text-muted-foreground">
                per {row.unit.toUpperCase()} · {row.currency}
                {row.min_cbm ? ` · min ${row.min_cbm} CBM` : ""}
                {row.currency === "USD" && fxValue > 0
                  ? ` · ≈ ${ngn(Number(row.rate) * fxValue)}`
                  : ""}
              </p>
            </div>
            <div className="flex items-end gap-2">
              <Input
                value={value}
                inputMode="decimal"
                onChange={(e) => setDrafts((prev) => ({ ...prev, [row.id]: e.target.value }))}
                className="w-36"
                aria-label={`${row.label} rate`}
              />
              <Button
                size="sm"
                disabled={saveRate.isPending || Number(value) === Number(row.rate) || !Number(value)}
                onClick={() => saveRate.mutate({ id: row.id, rate: Number(value) })}
              >
                Save
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Rates &amp; FX</h2>
        <p className="text-sm text-muted-foreground">
          Air rates are priced in USD and converted to Naira with the exchange rate below. Sea rates
          are fixed Naira per CBM.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">USD → NGN exchange rate</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="fx">Rate</Label>
            <Input
              id="fx"
              className="mt-1 w-40"
              inputMode="decimal"
              value={fxDraft || String(fxValue || "")}
              onChange={(e) => setFxDraft(e.target.value)}
            />
          </div>
          <Button
            disabled={saveFx.isPending || !Number(fxDraft || fxValue)}
            onClick={() => saveFx.mutate(Number(fxDraft || fxValue))}
          >
            Update rate
          </Button>
          <p className="text-xs text-muted-foreground">
            Last updated {shortDateTime(fx.data?.updated_at)} · {usd(1)} = {ngn(fxValue)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Air freight — China to Lagos (USD per kg)</CardTitle>
        </CardHeader>
        <CardContent>
          <RateRows rows={air} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sea freight — Naira per CBM</CardTitle>
        </CardHeader>
        <CardContent>
          <RateRows rows={sea} />
        </CardContent>
      </Card>
    </div>
  );
}
