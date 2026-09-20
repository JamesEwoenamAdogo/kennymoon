import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import {
  ADMIN_ROLES,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  isSuperAdmin,
  shortDate,
  type AppRole,
} from "@/lib/admin";
import { grantStaffRole, listStaff, revokeStaffRole } from "@/lib/staff.functions";
import { setStaffPassword } from "@/lib/staff-auth.functions";
import { inviteStaffWithCode } from "@/lib/otp.functions";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  component: AdminStaff,
});

function AdminStaff() {
  const { roles } = useStaffRoles();
  const queryClient = useQueryClient();
  const fetchStaff = useServerFn(listStaff);
  const grant = useServerFn(grantStaffRole);
  const revoke = useServerFn(revokeStaffRole);
  const savePassword = useServerFn(setStaffPassword);
  const invite = useServerFn(inviteStaffWithCode);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("operations");
  const [pwEmail, setPwEmail] = useState("");
  const [pwValue, setPwValue] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("operations");

  const sendInvite = useMutation({
    mutationFn: () => invite({ data: { email: inviteEmail, role: inviteRole } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.message);
        setInviteEmail("");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });


  const staff = useQuery({
    queryKey: ["admin-staff"],
    queryFn: () => fetchStaff(),
    enabled: isSuperAdmin(roles),
  });

  const add = useMutation({
    mutationFn: () => grant({ data: { email, role } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.message);
        setEmail("");
        void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const setPassword = useMutation({
    mutationFn: () => savePassword({ data: { email: pwEmail, password: pwValue } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.message);
        setPwEmail("");
        setPwValue("");
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => revoke({ data: { id } }),
    onSuccess: (result) => {
      if (result.ok) {
        toast.success(result.message);
        void queryClient.invalidateQueries({ queryKey: ["admin-staff"] });
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!isSuperAdmin(roles)) {
    return <p className="text-sm text-muted-foreground">Only a Super Admin can manage staff.</p>;
  }

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-2xl font-extrabold">Staff &amp; roles</h2>
        <p className="text-sm text-muted-foreground">
          Roles are enforced in the database, so a Warehouse account cannot reach payment
          confirmation even by typing the URL.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Grant a role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            The person must already have a Kennymoon account (they can sign up with their work
            email), then you grant the role here.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@kennymoon.ng"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTION[role]}</p>
          <Button disabled={!email || add.isPending} onClick={() => add.mutate()}>
            {add.isPending ? "Granting…" : "Grant role"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invite staff with an email code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            We email them a 6-digit code. They enter it on the Activate admin access page
            (/verify-staff) and their account plus role are created automatically.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="invite-email">Work email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="newstaff@kennymoonintl.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as AppRole)}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button
            disabled={!inviteEmail || sendInvite.isPending}
            onClick={() => sendInvite.mutate()}
          >
            {sendInvite.isPending ? "Sending invite…" : "Send invite code"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Set or reset a staff password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Staff sign in at the Staff login page with their work email, this password, and a 6-digit
            code emailed to them each time.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Label htmlFor="pw-email">Work email</Label>
              <Input
                id="pw-email"
                type="email"
                value={pwEmail}
                onChange={(e) => setPwEmail(e.target.value)}
                placeholder="staff@kennymoonintl.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pw-value">New password</Label>
              <Input
                id="pw-value"
                type="text"
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                placeholder="min. 8 characters"
                className="mt-1"
              />
            </div>
          </div>
          <Button
            disabled={!pwEmail || pwValue.length < 8 || setPassword.isPending}
            onClick={() => setPassword.mutate()}
          >
            {setPassword.isPending ? "Saving…" : "Save password"}
          </Button>
        </CardContent>
      </Card>


      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Added</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(staff.data ?? []).length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No staff roles yet.
                </TableCell>
              </TableRow>
            )}
            {(staff.data ?? []).map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold">{row.email}</TableCell>
                <TableCell>{ROLE_LABEL[row.role as AppRole]}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {shortDate(row.createdAt)}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(row.id)}
                  >
                    <Trash2 className="mr-1.5 size-4" aria-hidden="true" /> Remove
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What each role can do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {ADMIN_ROLES.map((r) => (
            <p key={r}>
              <strong>{ROLE_LABEL[r]}</strong> — {ROLE_DESCRIPTION[r]}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
