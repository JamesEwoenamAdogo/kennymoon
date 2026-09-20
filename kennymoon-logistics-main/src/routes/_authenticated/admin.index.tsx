import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, CreditCard, Upload } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  STATUS_LABEL,
  STATUS_ORDER,
  STATUS_TONE,
  shortDateTime,
  type OrderStatus,
} from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const summary = useQuery({
    queryKey: ["admin-summary"],
    queryFn: async () => {
      const [orders, imports, events, payments] = await Promise.all([
        supabase.from("orders").select("status"),
        supabase
          .from("warehouse_imports")
          .select("id, file_name, row_count, matched_count, unmatched_count, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("status_events")
          .select("id, new_status, triggered_by, batch_id, created_at")
          .order("created_at", { ascending: false })
          .limit(12),
        supabase
          .from("payments")
          .select("id, status, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(6),
      ]);

      if (orders.error) throw orders.error;

      const counts = new Map<OrderStatus, number>();
      for (const row of orders.data ?? []) {
        counts.set(row.status, (counts.get(row.status) ?? 0) + 1);
      }

      return {
        total: orders.data?.length ?? 0,
        counts,
        imports: imports.data ?? [],
        events: events.data ?? [],
        payments: payments.data ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-extrabold">Overview</h2>
        <p className="text-sm text-muted-foreground">
          {summary.data ? `${summary.data.total} orders logged in total.` : "Loading pipeline…"}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATUS_ORDER.map((status) => (
          <Link
            key={status}
            to="/admin/orders"
            search={{ status }}
            className="rounded-2xl border border-border bg-card p-4 transition hover:shadow-lift"
          >
            <p className="text-3xl font-extrabold">{summary.data?.counts.get(status) ?? 0}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[status]}`}
            >
              {STATUS_LABEL[status]}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center gap-2">
            <Activity className="size-4 text-leaf" aria-hidden="true" />
            <CardTitle className="text-base">Recent status activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(summary.data?.events ?? []).length === 0 && (
              <p className="text-muted-foreground">No status changes yet.</p>
            )}
            {(summary.data?.events ?? []).map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 last:border-0">
                <span>
                  <span className="font-semibold">{STATUS_LABEL[event.new_status]}</span>{" "}
                  <span className="text-muted-foreground">via {event.triggered_by}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {shortDateTime(event.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <Upload className="size-4 text-leaf" aria-hidden="true" />
              <CardTitle className="text-base">Recent imports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(summary.data?.imports ?? []).length === 0 && (
                <p className="text-muted-foreground">No imports yet.</p>
              )}
              {(summary.data?.imports ?? []).map((imp) => (
                <div key={imp.id} className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold">{imp.file_name}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {imp.matched_count}/{imp.row_count} matched · {shortDateTime(imp.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <CreditCard className="size-4 text-leaf" aria-hidden="true" />
              <CardTitle className="text-base">Recent payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {(summary.data?.payments ?? []).length === 0 && (
                <p className="text-muted-foreground">No payments submitted yet.</p>
              )}
              {(summary.data?.payments ?? []).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <span className="font-semibold capitalize">{p.status}</span>
                  <span className="text-xs text-muted-foreground">{shortDateTime(p.created_at)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
