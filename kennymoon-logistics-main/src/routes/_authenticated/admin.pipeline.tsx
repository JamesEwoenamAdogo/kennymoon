import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Tags, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import {
  MODE_LABEL,
  PICKUP_LABEL,
  STATUS_LABEL,
  STATUS_SHORT,
  STATUS_TONE,
  canWarehouse,
  nextStatus,
  shortDate,
  type OrderStatus,
} from "@/lib/admin";
import {
  bulkSetStatus,
  fetchCustomerMap,
  fetchOrders,
  moveOrdersDetailed,
  type MoveResult,
} from "@/lib/orders-client";

/** The pipeline the admin portal tracks: warehouse through to handover. */
const PIPELINE: OrderStatus[] = [
  "in_warehouse",
  "in_transit",
  "arrived",
  "payment_pending",
  "payment_submitted",
  "payment_confirmed",
  "completed",
];

export const Route = createFileRoute("/_authenticated/admin/pipeline")({
  component: AdminPipeline,
});

function AdminPipeline() {
  const { roles, userId } = useStaffRoles();
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<OrderStatus>("in_warehouse");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [target, setTarget] = useState<OrderStatus>("in_transit");
  const [tagList, setTagList] = useState("");
  const [tagStage, setTagStage] = useState<OrderStatus>("in_transit");
  const [confirmBatch, setConfirmBatch] = useState(false);
  const [results, setResults] = useState<MoveResult[] | null>(null);
  const [resultStage, setResultStage] = useState<OrderStatus>("in_transit");

  const orders = useQuery({ queryKey: ["admin-orders", "pipeline"], queryFn: () => fetchOrders() });
  const customers = useQuery({ queryKey: ["admin-customer-map"], queryFn: fetchCustomerMap });

  const all = orders.data ?? [];
  const countFor = (s: OrderStatus) => all.filter((o) => o.status === s).length;
  const rows = all.filter((o) => o.status === stage);

  const refresh = () => {
    setSelected(new Set());
    void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
  };

  const move = useMutation({
    mutationFn: async (input: { ids: string[]; newStatus: OrderStatus }) => {
      if (!userId) throw new Error("Not signed in");
      const picked = all.filter((o) => input.ids.includes(o.id));
      if (picked.length === 0) throw new Error("Select at least one order.");
      return moveOrdersDetailed({
        orders: picked.map((o) => ({
          id: o.id,
          status: o.status,
          tracking_number: o.tracking_number,
        })),
        newStatus: input.newStatus,
        actorId: userId,
      });
    },
    onSuccess: (result, input) => {
      const moved = result.results.filter((r) => r.ok).length;
      const failed = result.results.length - moved;
      setResults(result.results);
      setResultStage(input.newStatus);
      if (failed === 0) {
        toast.success(`${moved} order(s) moved to ${STATUS_SHORT[input.newStatus]}.`);
      } else {
        toast.error(`${moved} moved, ${failed} could not be moved. See the report below.`);
      }
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const applyTag = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not signed in");
      const numbers = tagList
        .split(/[\s,;]+/)
        .map((v) => v.trim().toLowerCase())
        .filter(Boolean);
      if (numbers.length === 0) throw new Error("Paste at least one tracking number.");
      const picked = all.filter((o) => numbers.includes(o.tracking_number.toLowerCase()));
      if (picked.length === 0) throw new Error("No orders matched those tracking numbers.");
      const result = await bulkSetStatus({
        orders: picked.map((o) => ({ id: o.id, status: o.status })),
        newStatus: tagStage,
        actorId: userId,
        triggeredBy: "admin_tag",
      });
      return { ...result, unmatched: numbers.length - picked.length };
    },
    onSuccess: (result) => {
      toast.success(
        `Tag applied — ${result.updated} moved to ${STATUS_SHORT[tagStage]}${
          result.unmatched > 0 ? `, ${result.unmatched} not found` : ""
        }.`,
      );
      setTagList("");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!canWarehouse(roles)) {
    return (
      <p className="text-sm text-muted-foreground">
        Your role can view orders but cannot move them along the pipeline.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Pipeline</h2>
        <p className="text-sm text-muted-foreground">
          Every stage from <strong>In warehouse</strong> to <strong>Completed</strong>. Open a stage
          to see the orders sitting there, then move them one by one or in a batch.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-7">
        {PIPELINE.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setStage(s);
              setSelected(new Set());
              setTarget(nextStatus(s) ?? s);
            }}
            className={
              "rounded-2xl border p-3 text-left transition " +
              (stage === s
                ? "border-forest bg-forest text-primary-foreground"
                : "border-border bg-card hover:bg-muted")
            }
          >
            <p className="text-2xl font-extrabold">{countFor(s)}</p>
            <p className="text-xs font-semibold">{STATUS_SHORT[s]}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Tags className="size-4 text-leaf" aria-hidden="true" />
          <CardTitle className="text-base">Move by tag</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div>
            <Label htmlFor="tag-list">Tracking numbers (comma, space or new line)</Label>
            <Input
              id="tag-list"
              value={tagList}
              onChange={(e) => setTagList(e.target.value)}
              placeholder="SF1029384756CN, 7825930012885"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="tag-stage">Move to</Label>
            <select
              id="tag-stage"
              value={tagStage}
              onChange={(e) => setTagStage(e.target.value as OrderStatus)}
              className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {PIPELINE.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <Button disabled={applyTag.isPending} onClick={() => applyTag.mutate()}>
            Apply tag
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-3">
        <div>
          <Label htmlFor="batch-target">Batch move selected ({selected.size})</Label>
          <select
            id="batch-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as OrderStatus)}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-64"
          >
            {PIPELINE.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={selected.size === 0 || move.isPending}
          onClick={() => setConfirmBatch(true)}
        >
          Move {selected.size || ""} order(s)
        </Button>
        {selected.size > 0 && (
          <Button variant="ghost" onClick={() => setSelected(new Set())}>
            Clear selection
          </Button>
        )}
      </div>

      <AlertDialog open={confirmBatch} onOpenChange={setConfirmBatch}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Move {selected.size} order(s) to {STATUS_LABEL[target]}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Each selected order moves from {STATUS_SHORT[stage]} to {STATUS_LABEL[target]}, and the
              change appears on the customer's dashboard straight away. You'll get a line-by-line
              report of what worked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-border bg-muted/40 p-2 text-xs font-mono">
            {all
              .filter((o) => selected.has(o.id))
              .map((o) => (
                <p key={o.id}>{o.tracking_number}</p>
              ))}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setResults(null);
                move.mutate({ ids: [...selected], newStatus: target });
              }}
            >
              Yes, move them
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {results && results.length > 0 && (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-2">
            <CardTitle className="text-base">
              Move report — {results.filter((r) => r.ok).length} of {results.length} moved to{" "}
              {STATUS_SHORT[resultStage]}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setResults(null)}>
              Dismiss
            </Button>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {results.map((r) => (
              <div key={r.id} className="flex items-start gap-2 text-sm">
                {r.ok ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                )}
                <span className="font-mono text-xs">{r.tracking_number}</span>
                <span className={r.ok ? "text-muted-foreground" : "text-destructive"}>
                  {r.ok
                    ? (r.error ?? `Moved to ${STATUS_SHORT[resultStage]}`)
                    : (r.error ?? "Could not be moved")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Tracking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Logged</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.isLoading && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  Loading orders…
                </TableCell>
              </TableRow>
            )}
            {!orders.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                  No orders at the {STATUS_SHORT[stage]} stage.
                </TableCell>
              </TableRow>
            )}
            {rows.map((order) => {
              const customer = customers.data?.get(order.customer_id);
              const step = nextStatus(order.status);
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(order.id)}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          if (checked) next.add(order.id);
                          else next.delete(order.id);
                          return next;
                        })
                      }
                      aria-label={`Select ${order.tracking_number}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{order.tracking_number}</TableCell>
                  <TableCell className="text-sm">
                    <span className="font-semibold">{customer?.full_name ?? "—"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {customer?.business_name ?? ""} {customer?.km_code ? `· ${customer.km_code}` : ""}
                    </span>
                    <span className="block text-xs text-muted-foreground">{customer?.phone ?? ""}</span>
                  </TableCell>
                  <TableCell className="max-w-56 truncate text-sm">{order.description}</TableCell>
                  <TableCell className="text-xs">{MODE_LABEL[order.shipping_mode]}</TableCell>
                  <TableCell className="text-xs">{PICKUP_LABEL[order.pickup_location]}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {shortDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_TONE[order.status]}>{STATUS_SHORT[order.status]}</Badge>
                  </TableCell>
                  <TableCell>
                    {step && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={move.isPending}
                        onClick={() => move.mutate({ ids: [order.id], newStatus: step })}
                      >
                        {STATUS_SHORT[step]}
                        <ArrowRight className="ml-1 size-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
