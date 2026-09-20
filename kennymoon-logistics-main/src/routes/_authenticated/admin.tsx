import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  CreditCard,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Package,
  ShieldCheck,
  Tags,
  Upload,
  Users,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useStaffRoles } from "@/hooks/useStaffRoles";
import { ROLE_LABEL, canOperate, canWarehouse, isSuperAdmin, type AppRole } from "@/lib/admin";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

type NavItem = {
  to: string;
  label: string;
  icon: typeof Package;
  visible: (roles: AppRole[]) => boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, visible: () => true },
  { to: "/admin/orders", label: "Orders", icon: Package, visible: () => true },
  { to: "/admin/pipeline", label: "Pipeline", icon: GitBranch, visible: () => true },
  { to: "/admin/imports", label: "Warehouse import", icon: Upload, visible: canWarehouse },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, visible: canOperate },
  { to: "/admin/customers", label: "Customers", icon: Users, visible: () => true },
  { to: "/admin/rates", label: "Rates & FX", icon: Tags, visible: isSuperAdmin },
  { to: "/admin/staff", label: "Staff & roles", icon: ShieldCheck, visible: isSuperAdmin },
  { to: "/admin/training", label: "Training", icon: BookOpen, visible: () => true },
];


function AdminLayout() {
  const { roles, isLoading } = useStaffRoles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/staff-login", replace: true });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 text-center text-sm text-muted-foreground">
        Checking your access…
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldCheck className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold">Staff access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is for Kennymoon staff. If you should have access, ask a Super Admin to add your
          account under Staff &amp; roles.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Back to my dashboard</Link>
        </Button>
      </div>
    );
  }

  const items = NAV.filter((item) => item.visible(roles));

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="border-b border-border bg-forest text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-leaf">Kennymoon</p>
            <h1 className="text-xl font-extrabold">Admin portal</h1>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
              {roles.map((r) => ROLE_LABEL[r]).join(" · ")}
            </span>
            <Button asChild size="sm" variant="onDark">
              <Link to="/dashboard">Customer view</Link>
            </Button>
            <Button size="sm" variant="onDark" onClick={() => void signOut()}>
              <LogOut className="size-3.5" aria-hidden="true" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <nav className="lg:w-60 lg:shrink-0">
          <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
            {items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/admin" }}
                  activeProps={{ className: "bg-forest text-primary-foreground" }}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-background"
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
