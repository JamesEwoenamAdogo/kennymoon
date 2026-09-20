import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { canOperate, ngn, shortDateTime, type OrderStatus, type PaymentStatus } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin/payments")({
  component: AdminPayments,
});

const sel = (s: string): string => s;

interface PaymentRow {
  id: string;
  order_id: string;
  method: "manual_transfer" | "card_online";
  amount: number | null;
  receipt_url: string | null;
  reference: string | null;
  status: PaymentStatus;
  admin_note: string | null;
  created_at: string;
  orders: {
    id: string;
    tracking_number: string;
    description: string;
    status: OrderStatus;
    customer_id: string;
  } | null;
}

function ReceiptPreview({ path }: { path: string }) {
  const signed = useQuery({
    queryKey: ["receipt", path],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    },
  });

  if (!signed.data) return <p className="text-xs text-muted-foreground">Loading receipt…</p>;

  return (
    <a href={signed.data} target="_blank" rel="noreferrer" className="block">
      <img
        src={signed.data}
        alt="Payment receipt uploaded by the customer"
        className="max-h-56 w-full rounded-xl border border-border object-contain"
      />
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
        Open full size <ExternalLink className="size-3" aria-hidden="true" />
      </span>
    </a>
  );
}

function AdminPayments() {
  const { roles, userId } = useStaffRoles();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const payments = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(sel("*, orders(id, tracking_number, description, status, customer_id)"))
        .order("created_at", { ascending: false })
        .returns<PaymentRow[]>();
      if (error) throw error;
      return data ?? [];
    },
  });

  const review = useMutation({
    mutationFn: async (params: { payment: PaymentRow; action: "confirm" | "reject" }) => {
      if (!userId) throw new Error("Not signed in");
      const note = notes[params.payment.id] ?? null;

      const { error } = await supabase
        .from("payments")
        .update({
          status: params.action === "confirm" ? "confirmed" : "rejected",
          confirmed_by: userId,
          admin_note: note,
        })
        .eq("id", params.payment.id);
      if (error) throw error;

      const order = params.payment.orders;
      if (order) {
        const newStatus: OrderStatus = params.action === "confirm" ? "payment_confirmed" : "payment_pending";
        const { error: orderError } = await supabase
          .from("orders")
          .update({ status: newStatus })
          .eq("id", order.id);
        if (orderError) throw orderError;

        await supabase.from("status_events").insert({
          order_id: order.id,
          old_status: order.status,
          new_status: newStatus,
          triggered_by: "admin",
          actor_id: userId,
          note,
        });
      }
    },
    onSuccess: () => {
      toast.success("Payment reviewed.");
      void queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canOperate(roles)) {
    return <p className="text-sm text-muted-foreground">Your role cannot review payments.</p>;
  }

  const pending = (payments.data ?? []).filter((p) => p.status === "pending");
  const done = (payments.data ?? []).filter((p) => p.status !== "pending");

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Payments review</h2>
        <p className="text-sm text-muted-foreground">
          {pending.length} payment(s) awaiting confirmation.
        </p>
      </header>

      {pending.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nothing waiting. Submitted receipts will appear here.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {pending.map((payment) => (
          <Card key={payment.id}>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
                <span className="font-mono">{payment.orders?.tracking_number ?? "order removed"}</span>
                <Badge variant="secondary">
                  {payment.method === "manual_transfer" ? "Manual transfer" : "Card / online"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">{payment.orders?.description}</p>
              <p>
                <strong>{payment.amount ? ngn(Number(payment.amount)) : "Amount not stated"}</strong>
                {payment.reference && (
                  <span className="text-muted-foreground"> · ref {payment.reference}</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted {shortDateTime(payment.created_at)}
              </p>

              {payment.receipt_url ? (
                <ReceiptPreview path={payment.receipt_url} />
              ) : (
                <p className="rounded-xl bg-muted p-3 text-xs">
                  No receipt uploaded — the customer said they would send proof on WhatsApp.
                </p>
              )}

              <Input
                placeholder="Optional note (shown in the audit trail)"
                value={notes[payment.id] ?? ""}
                onChange={(e) => setNotes((prev) => ({ ...prev, [payment.id]: e.target.value }))}
              />

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="leaf"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ payment, action: "confirm" })}
                >
                  <CheckCircle2 className="mr-1.5 size-4" aria-hidden="true" /> Confirm payment
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={review.isPending}
                  onClick={() => review.mutate({ payment, action: "reject" })}
                >
                  <XCircle className="mr-1.5 size-4" aria-hidden="true" /> Reject / request reupload
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {done.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reviewed history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {done.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 last:border-0"
              >
                <span className="font-mono text-xs">{payment.orders?.tracking_number}</span>
                <span className="capitalize">{payment.status}</span>
                <span className="text-xs text-muted-foreground">
                  {shortDateTime(payment.created_at)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
