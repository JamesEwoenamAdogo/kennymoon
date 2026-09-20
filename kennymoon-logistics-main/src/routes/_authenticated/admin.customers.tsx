import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { STATUS_SHORT, isSuperAdmin, shortDate, type OrderStatus } from "@/lib/admin";
import {
  createCustomer,
  customerOrders,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from "@/lib/staff.functions";
import { PICKUP_CITIES } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/customers")({
  component: AdminCustomers,
});

type Draft = {
  id: string;
  fullName: string;
  businessName: string;
  phone: string;
  city: string;
};

function AdminCustomers() {
  const { roles } = useStaffRoles();
  const queryClient = useQueryClient();
  const fetchCustomers = useServerFn(listCustomers);
  const fetchOrdersFor = useServerFn(customerOrders);
  const saveCustomer = useServerFn(updateCustomer);
  const addCustomer = useServerFn(createCustomer);
  const removeCustomer = useServerFn(deleteCustomer);

  const [term, setTerm] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    email: "",
    fullName: "",
    businessName: "",
    phone: "",
    city: "Lagos",
  });

  const customers = useQuery({
    queryKey: ["admin-customers"],
    queryFn: () => fetchCustomers(),
  });

  const orders = useQuery({
    queryKey: ["admin-customer-orders", openId],
    queryFn: () => fetchOrdersFor({ data: { id: openId! } }),
    enabled: Boolean(openId),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-customer-map"] });
  };

  const save = useMutation({
    mutationFn: (input: Draft) => saveCustomer({ data: input }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setDraft(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const create = useMutation({
    mutationFn: () => addCustomer({ data: newCustomer }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      setShowNew(false);
      setNewCustomer({ email: "", fullName: "", businessName: "", phone: "", city: "Lagos" });
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeCustomer({ data: { id } }),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = (customers.data ?? []).filter((c) => {
    if (!term.trim()) return true;
    const haystack = [c.fullName, c.businessName, c.kmCode, c.email, c.phone]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term.trim().toLowerCase());
  });

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold">Customer directory</h2>
          <p className="text-sm text-muted-foreground">
            {rows.length} registered customer(s). Every website sign-up appears here automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search name, business, KM code, email"
            className="sm:w-72"
          />
          <Button onClick={() => setShowNew((v) => !v)}>
            <Plus className="mr-1 size-4" aria-hidden="true" />
            Add
          </Button>
        </div>
      </header>

      {showNew && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add a customer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ["email", "Email"],
                ["fullName", "Full name"],
                ["businessName", "Business name"],
                ["phone", "Phone / WhatsApp"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <Label htmlFor={`new-${key}`}>{label}</Label>
                <Input
                  id={`new-${key}`}
                  required
                  value={newCustomer[key]}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, [key]: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            ))}
            <div>
              <Label htmlFor="new-city">Pickup city</Label>
              <select
                id="new-city"
                value={newCustomer.city}
                onChange={(e) => setNewCustomer((p) => ({ ...p, city: e.target.value }))}
                className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {PICKUP_CITIES.map((c) => (
                  <option key={c.id} value={c.city}>
                    {c.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button disabled={create.isPending} onClick={() => create.mutate()}>
                Create account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Business name</TableHead>
              <TableHead>KM code</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.isLoading && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  Loading customers…
                </TableCell>
              </TableRow>
            )}
            {!customers.isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
            {rows.map((customer) => {
              const editing = draft?.id === customer.id;
              return (
                <Fragment key={customer.id}>
                  <TableRow>
                    <TableCell className="font-semibold">
                      {editing ? (
                        <Input
                          value={draft.fullName}
                          onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                        />
                      ) : (
                        (customer.fullName ?? "—")
                      )}
                    </TableCell>
                    <TableCell>
                      {editing ? (
                        <Input
                          value={draft.businessName}
                          onChange={(e) => setDraft({ ...draft, businessName: e.target.value })}
                        />
                      ) : (
                        (customer.businessName ?? "—")
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{customer.kmCode ?? "—"}</TableCell>
                    <TableCell className="text-xs">
                      {customer.email}
                      <span className="block text-muted-foreground">
                        {editing ? (
                          <Input
                            value={draft.phone}
                            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          />
                        ) : (
                          (customer.phone ?? "")
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      {editing ? (
                        <Input
                          value={draft.city}
                          onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                        />
                      ) : (
                        (customer.city ?? "—")
                      )}
                    </TableCell>
                    <TableCell>{customer.orders}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {shortDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {editing ? (
                          <>
                            <Button
                              size="sm"
                              disabled={save.isPending}
                              onClick={() => save.mutate(draft)}
                            >
                              Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setDraft({
                                  id: customer.id,
                                  fullName: customer.fullName ?? "",
                                  businessName: customer.businessName ?? "",
                                  phone: customer.phone ?? "",
                                  city: customer.city ?? "",
                                })
                              }
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setOpenId((prev) => (prev === customer.id ? null : customer.id))
                              }
                            >
                              {openId === customer.id ? "Hide" : "Orders"}
                            </Button>
                            <Button asChild size="sm" variant="outline">
                              <Link to="/admin/orders" search={{ customerId: customer.id }}>
                                All orders
                              </Link>
                            </Button>
                            {isSuperAdmin(roles) && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={remove.isPending}
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete ${customer.email}? This removes their account and records.`,
                                    )
                                  ) {
                                    remove.mutate(customer.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {openId === customer.id && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/40 text-sm">
                        {orders.isLoading && <p className="text-muted-foreground">Loading orders…</p>}
                        {!orders.isLoading && (orders.data ?? []).length === 0 && (
                          <p className="text-muted-foreground">No orders logged yet.</p>
                        )}
                        <div className="space-y-1.5">
                          {(orders.data ?? []).map((order) => (
                            <div key={order.id} className="flex flex-wrap gap-x-3 gap-y-1">
                              <span className="font-mono text-xs">{order.tracking_number}</span>
                              <span>{order.description}</span>
                              <span className="text-xs text-muted-foreground">
                                {STATUS_SHORT[order.status as OrderStatus]} ·{" "}
                                {shortDate(order.created_at)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
