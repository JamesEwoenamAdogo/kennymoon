import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  BULK_ALLOWED_TARGETS,
  GOODS_TYPE_LABEL,
  MODE_LABEL,
  PICKUP_LABEL,
  STATUS_ORDER,
  STATUS_SHORT,
  STATUS_TONE,
  canOperate,
  nextStatus,
  shortDate,
  type OrderStatus,
} from "@/lib/admin";
import { bulkSetStatus, fetchCustomerMap, fetchOrders } from "@/lib/orders-client";

type OrdersSearch = { status?: OrderStatus | "all" | undefined; customerId?: string | undefined };

export const Route = createFileRoute("/_authenticated/admin/orders")({
  validateSearch: (search: Record<string, unknown>): OrdersSearch => ({
    status:
      typeof search["status"] === "string" &&
      (search["status"] === "all" || STATUS_ORDER.includes(search["status"] as OrderStatus))
        ? (search["status"] as OrderStatus | "all")
        : undefined,
    customerId: typeof search["customerId"] === "string" ? search["customerId"] : undefined,
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { roles, userId } = useStaffRoles();
  const queryClient = useQueryClient();

  const [tracking, setTracking] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [eta, setEta] = useState("");

  const status = search.status ?? "all";

  const orders = useQuery({
    queryKey: ["admin-orders", { status, customerId: search.customerId, tracking, from, to }],
    queryFn: () =>
      fetchOrders({
        status,
        ...(search.customerId ? { customerId: search.customerId } : {}),
        ...(tracking ? { tracking } : {}),
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
      }),
    refetchInterval: 15000,
  });

  const customers = useQuery({ queryKey: ["admin-customer-map"], queryFn: fetchCustomerMap });

  const rows = orders.data ?? [];
  const selectedRows = rows.filter((r) => selected.has(r.id));

  const bulkTargets = useMemo(() => {
    if (selectedRows.length === 0) return [];
    const targets = new Set(selectedRows.map((r) => nextStatus(r.status)));
    if (targets.size !== 1) return [];
    const target = [...targets][0];
    if (!target || !BULK_ALLOWED_TARGETS.includes(target)) return [];
    return [target];
  }, [selectedRows]);

  const bulk = useMutation({
    mutationFn: async (target: OrderStatus) => {
      if (!userId) throw new Error("Not signed in");
      if (target === "in_transit" && !eta) {
        throw new Error("Enter an estimated delivery date for this batch first.");
      }
      return bulkSetStatus({
        orders: selectedRows.map((r) => ({ id: r.id, status: r.status })),
        newStatus: target,
        estimatedDeliveryDate: target === "in_transit" ? eta : null,
        actorId: userId,
      });
    },
    onSuccess: (result) => {
      toast.success(`${result.updated} order(s) updated.`);
      setSelected(new Set());
      setEta("");
      void queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Orders</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} order(s) shown. Partial tracking search is supported.
          </p>
        </div>
      </header>

      <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Label htmlFor="tracking">Tracking number (partial ok)</Label>
          <div className="relative mt-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. 4821"
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              void navigate({
                search: (prev) => ({ ...prev, status: e.target.value as OrderStatus | "all" }),
              })
            }
            className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All statuses</option>
            {STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {STATUS_SHORT[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1" />
        </div>
        {search.customerId && (
          <div className="sm:col-span-2 lg:col-span-5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => void navigate({ search: (prev) => ({ ...prev, customerId: undefined }) })}
            >
              Clear customer filter
            </Button>
          </div>
        )}
      </div>

      {selectedRows.length > 0 && (
        <div className="sticky top-2 z-10 flex flex-wrap items-center gap-3 rounded-2xl border border-forest/30 bg-forest px-4 py-3 text-primary-foreground shadow-lift">
          <span className="text-sm font-bold">{selectedRows.length} selected</span>
          {canOperate(roles) ? (
            bulkTargets.length > 0 ? (
              <>
                {bulkTargets[0] === "in_transit" && (
                  <Input
                    type="date"
                    value={eta}
                    onChange={(e) => setEta(e.target.value)}
                    aria-label="Estimated delivery date for this batch"
                    className="h-9 w-40 bg-background text-foreground"
                  />
                )}
                <Button
                  size="sm"
                  variant="leaf"
                  disabled={bulk.isPending}
                  onClick={() => bulk.mutate(bulkTargets[0] as OrderStatus)}
                >
                  Mark as {STATUS_SHORT[bulkTargets[0] as OrderStatus]}
                </Button>
              </>
            ) : (
              <span className="text-xs text-primary-foreground/80">
                Select orders that share the same current status to bulk-tag the next step.
              </span>
            )
          ) : (
            <span className="text-xs text-primary-foreground/80">
              Your role cannot change order status.
            </span>
          )}
          <Button size="sm" variant="onDark" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Mobile: stacked cards. A grid table is unreadable under 768px. */}
      <div className="space-y-3 md:hidden">
        {orders.isLoading && (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            Loading orders…
          </p>
        )}
        {!orders.isLoading && rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No orders match these filters.
          </p>
        )}
        {rows.map((row) => {
          const customer = customers.data?.get(row.customer_id);
          return (
            <article
              key={row.id}
              className="rounded-2xl border border-border bg-card p-4"
              data-state={selected.has(row.id) ? "selected" : undefined}
            >
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <Checkbox
                  checked={selected.has(row.id)}
                  onCheckedChange={() => toggle(row.id)}
                  aria-label={`Select ${row.tracking_number}`}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs font-bold">{row.tracking_number}</p>
                  {row.internal_code && (
                    <p className="truncate text-[10px] text-muted-foreground">{row.internal_code}</p>
                  )}
                </div>
                <Badge className={`${STATUS_TONE[row.status]} shrink-0 border-0`}>
                  {STATUS_SHORT[row.status]}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Customer</dt>
                  <dd className="truncate font-semibold">{customer?.full_name ?? "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Business</dt>
                  <dd className="truncate font-semibold">{customer?.business_name ?? "—"}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Goods</dt>
                  <dd className="font-semibold">{GOODS_TYPE_LABEL[row.goods_type]}</dd>
                  <dd className="text-muted-foreground">{row.description}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Mode / pickup</dt>
                  <dd className="font-semibold">{MODE_LABEL[row.shipping_mode]}</dd>
                  <dd className="text-muted-foreground">{PICKUP_LABEL[row.pickup_location]}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-muted-foreground">Logged</dt>
                  <dd className="font-semibold">{shortDate(row.created_at)}</dd>
                </div>
                {row.status === "in_transit" && row.estimated_delivery_date && (
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">ETA</dt>
                    <dd className="font-semibold">{shortDate(row.estimated_delivery_date)}</dd>
                  </div>
                )}
                {row.status === "in_warehouse" && row.warehouse_city && (
                  <div className="min-w-0">
                    <dt className="text-muted-foreground">Warehouse</dt>
                    <dd className="font-semibold">{row.warehouse_city}</dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allChecked}
                  aria-label="Select all"
                  onCheckedChange={(value) =>
                    setSelected(value ? new Set(rows.map((r) => r.id)) : new Set())
                  }
                />
              </TableHead>
              <TableHead>Tracking</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Goods</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Pickup</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logged</TableHead>
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
                  No orders match these filters.
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => {
              const customer = customers.data?.get(row.customer_id);
              return (
                <TableRow key={row.id} data-state={selected.has(row.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(row.id)}
                      onCheckedChange={() => toggle(row.id)}
                      aria-label={`Select ${row.tracking_number}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold">
                    {row.tracking_number}
                    {row.internal_code && (
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {row.internal_code}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{customer?.full_name ?? "—"}</TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {customer?.business_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {GOODS_TYPE_LABEL[row.goods_type]}
                    <span className="block text-muted-foreground">{row.description}</span>
                  </TableCell>
                  <TableCell>{MODE_LABEL[row.shipping_mode]}</TableCell>
                  <TableCell className="text-xs">{PICKUP_LABEL[row.pickup_location]}</TableCell>
                  <TableCell>
                    <Badge className={`${STATUS_TONE[row.status]} border-0`}>
                      {STATUS_SHORT[row.status]}
                    </Badge>
                    {row.status === "in_warehouse" && row.warehouse_city && (
                      <span className="block text-[10px] text-muted-foreground">
                        {row.warehouse_city}
                      </span>
                    )}
                    {row.status === "in_transit" && row.estimated_delivery_date && (
                      <span className="block text-[10px] text-muted-foreground">
                        ETA {shortDate(row.estimated_delivery_date)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {shortDate(row.created_at)}
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
