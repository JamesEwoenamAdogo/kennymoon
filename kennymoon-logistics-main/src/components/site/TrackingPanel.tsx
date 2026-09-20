import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { OrbitVisual } from "@/components/site/OrbitVisual";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { STATUS_ORDER, STATUS_SHORT, type OrderStatus } from "@/lib/admin";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/site";
import { cn } from "@/lib/utils";

export type TrackingEvent = { stage: string; note: string | null; occurred_at: string };
export type TrackingResult = {
  waybill: string;
  description: string;
  mode: string;
  weight_kg: number | null;
  cbm: number | null;
  origin: string;
  pickup_city: string;
  status: string;
  eta: string | null;
  created_at: string;
  events: TrackingEvent[];
};

/** A customer-logged order shown through the same panel (customer portal tracking). */
export type OrderTrackResult = {
  kind: "order";
  tracking_number: string;
  description: string;
  mode: string;
  pickup: string;
  status: OrderStatus;
  created_at: string;
  loggedNow: boolean;
};

type AnyResult = ({ kind: "shipment" } & TrackingResult) | OrderTrackResult;

async function lookup(waybill: string): Promise<AnyResult | null> {
  const { data, error } = await supabase.rpc("track_shipment", { _waybill: waybill });
  if (error) throw error;
  if (data) return { kind: "shipment", ...(data as unknown as TrackingResult) };

  // Not a recorded shipment yet — check the signed-in customer's own logged goods.
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) return null;

  const { data: mine } = await supabase
    .from("orders")
    .select("id, tracking_number, description, shipping_mode, pickup_location, status, created_at")
    .eq("customer_id", userId)
    .ilike("tracking_number", waybill)
    .limit(1)
    .maybeSingle();

  // Has the warehouse already received this number?
  const { data: arrival } = await supabase
    .from("warehouse_arrivals")
    .select("id, tracking_number, warehouse_city, photo_url")
    .ilike("tracking_number", waybill.trim())
    .limit(1)
    .maybeSingle();

  if (mine) {
    // Already logged: if the warehouse has since received it, move it forward now.
    if (arrival && mine.status === "unavailable") {
      const { data: moved } = await supabase
        .from("orders")
        .update({
          status: "in_warehouse",
          ...(arrival.warehouse_city ? { warehouse_city: arrival.warehouse_city } : {}),
          ...(arrival.photo_url ? { photo_url: arrival.photo_url } : {}),
        })
        .eq("id", mine.id)
        .select("status")
        .maybeSingle();
      if (moved) {
        await supabase.from("status_events").insert({
          order_id: mine.id,
          old_status: "unavailable",
          new_status: "in_warehouse",
          triggered_by: "system_import",
          actor_id: userId,
        });
        mine.status = "in_warehouse";
      }
    }
    return {
      kind: "order",
      tracking_number: mine.tracking_number,
      description: mine.description,
      mode: mine.shipping_mode,
      pickup: mine.pickup_location,
      status: mine.status,
      created_at: mine.created_at,
      loggedNow: false,
    };
  }

  // Brand new code: accept it. If the warehouse already logged the same number it starts
  // at "In warehouse"; otherwise it waits at "Not Yet in Warehouse".
  const startStatus = arrival ? ("in_warehouse" as const) : ("unavailable" as const);
  const insert = {
    customer_id: userId,
    tracking_number: waybill,
    description: "Customer-logged waybill — details to be confirmed",
    goods_type: "normal" as const,
    shipping_mode: "sea" as const,
    pickup_location: "lagos_tradefair" as const,
    status: startStatus,
    ...(arrival?.warehouse_city ? { warehouse_city: arrival.warehouse_city } : {}),
    ...(arrival?.photo_url ? { photo_url: arrival.photo_url } : {}),
  };
  const { data: created, error: insertError } = await supabase
    .from("orders")
    .insert(insert)
    .select("id, tracking_number, description, shipping_mode, pickup_location, status, created_at")
    .single();
  if (insertError) throw insertError;

  await supabase.from("status_events").insert({
    order_id: created.id,
    new_status: startStatus,
    triggered_by: "customer",
    actor_id: userId,
  });

  if (arrival) {
    await supabase
      .from("warehouse_arrivals")
      .update({ claimed_by: userId, claimed_at: new Date().toISOString() })
      .eq("id", arrival.id);
  }

  return {
    kind: "order",
    tracking_number: created.tracking_number,
    description: created.description,
    mode: created.shipping_mode,
    pickup: created.pickup_location,
    status: created.status,
    created_at: created.created_at,
    loggedNow: true,
  };
}


const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });

export function TrackingPanel({ initialWaybill = "" }: { initialWaybill?: string }) {
  const [waybill, setWaybill] = useState(initialWaybill);
  const mutation = useMutation({ mutationFn: lookup });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (waybill.trim().length < 3) return;
    mutation.mutate(waybill.trim());
  };

  const result = mutation.data;

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row"
      >
        <label htmlFor="waybill" className="sr-only">
          Tracking number
        </label>
        <Input
          id="waybill"
          value={waybill}
          onChange={(e) => setWaybill(e.target.value)}
          placeholder="Enter your tracking number"
          className="h-12 flex-1 text-base"
          autoComplete="off"
        />
        <Button type="submit" size="lg" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <Search aria-hidden="true" />
          )}
          Track shipment
        </Button>
      </form>

      {mutation.isError && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          We couldn't reach the tracking service. Please try again, or send us the tracking number
          and a human will check it for you.
        </p>
      )}

      {mutation.isSuccess && !result && (
        <div className="mt-4 rounded-xl border border-border bg-muted px-4 py-4 text-sm">
          <p className="font-semibold">No shipment found for that tracking number.</p>
          <p className="mt-1 text-muted-foreground">
            Check for a typo — enter it exactly as your supplier gave it to you, in any format. If
            it's correct and brand new, it may not be logged yet.{" "}
            <Link
              to="/contact"
              className="font-semibold text-primary underline underline-offset-4"
            >
              Ask our team
            </Link>
            .
          </p>
        </div>
      )}

      {result?.kind === "shipment" && <ShipmentResult result={result} />}
      {result?.kind === "order" && <OrderResult result={result} />}
    </div>
  );
}

function ShipmentResult({ result }: { result: { kind: "shipment" } & TrackingResult }) {
  const reachedIndex = STAGE_ORDER.indexOf(result.status);
  const progress = reachedIndex >= 0 ? (reachedIndex + 1) / STAGE_ORDER.length : 0;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
      <div className="grid gap-6 bg-forest p-6 text-primary-foreground sm:grid-cols-[1fr_auto] sm:p-8">
        <div>
          <p className="eyebrow text-gold">Waybill {result.waybill}</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {STAGE_LABELS[result.status] ?? result.status}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">{result.description}</p>
          <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-primary-foreground/60">Mode</dt>
              <dd className="font-semibold capitalize">{result.mode} freight</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/60">Weight</dt>
              <dd className="font-semibold">{result.weight_kg ?? "—"} kg</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/60">From</dt>
              <dd className="font-semibold">{result.origin}</dd>
            </div>
            <div>
              <dt className="text-primary-foreground/60">Pickup</dt>
              <dd className="font-semibold">{result.pickup_city}</dd>
            </div>
          </dl>
          {result.eta && (
            <p className="mt-4 inline-flex rounded-full bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold text-gold">
              Estimated availability: {formatDate(result.eta)}
            </p>
          )}
        </div>
        <OrbitVisual progress={progress} className="mx-auto w-40 sm:w-44" animated={false} />
      </div>

      <div className="p-6 sm:p-8">
        <ol className="grid gap-1 sm:grid-cols-5">
          {STAGE_ORDER.map((stage, i) => {
            const done = i <= reachedIndex;
            const current = i === reachedIndex;
            return (
              <li key={stage} className="flex items-start gap-3 sm:block">
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full sm:mt-0",
                    done ? "bg-leaf" : "bg-border",
                    current && "animate-stage-pulse",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "block pb-4 text-xs font-semibold sm:mt-3 sm:pb-0",
                    done ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {STAGE_LABELS[stage]}
                </span>
              </li>
            );
          })}
        </ol>

        <h3 className="mt-8 text-sm font-extrabold">Tracking history</h3>
        <ul className="mt-3 space-y-3">
          {result.events
            .slice()
            .reverse()
            .map((event, i) => (
              <li
                key={`${event.stage}-${i}`}
                className="flex gap-3 rounded-xl border border-border bg-background p-3.5"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold">
                    {STAGE_LABELS[event.stage] ?? event.stage}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {formatDate(event.occurred_at)}
                    </span>
                  </p>
                  {event.note && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>
                  )}
                </div>
              </li>
            ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button asChild variant="leaf">
            <Link to="/contact">Ask about this shipment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/auth">Save it to a free dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function OrderResult({ result }: { result: OrderTrackResult }) {
  const reachedIndex = STATUS_ORDER.indexOf(result.status);
  const progress = reachedIndex >= 0 ? (reachedIndex + 1) / STATUS_ORDER.length : 0;

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
      <div className="grid gap-6 bg-forest p-6 text-primary-foreground sm:grid-cols-[1fr_auto] sm:p-8">
        <div>
          <p className="eyebrow text-gold">Waybill {result.tracking_number}</p>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            {STATUS_SHORT[result.status]}
          </h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            {result.loggedNow
              ? "We've logged this tracking number on your dashboard. It will move to “In warehouse” the moment our China warehouse record matches it."
              : result.description}
          </p>
          <p className="mt-3 text-xs text-primary-foreground/60">
            Logged {formatDate(result.created_at)}
          </p>
        </div>
        <OrbitVisual progress={progress} className="mx-auto w-40 sm:w-44" animated={false} />
      </div>

      <div className="p-6 sm:p-8">
        <ol className="grid gap-1 sm:grid-cols-4 lg:grid-cols-8">
          {STATUS_ORDER.map((stage, i) => {
            const done = i <= reachedIndex;
            const current = i === reachedIndex;
            return (
              <li key={stage} className="flex items-start gap-3 sm:block">
                <span
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full sm:mt-0",
                    done ? "bg-leaf" : "bg-border",
                    current && "animate-stage-pulse",
                  )}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "block pb-4 text-[11px] font-semibold leading-tight sm:mt-3 sm:pb-0",
                    done ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {STATUS_SHORT[stage]}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Button asChild variant="leaf">
            <Link to="/dashboard">Open my dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/orders">My goods &amp; payments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
