import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Menu, Shield, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { NAV } from "@/lib/site";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; children?: readonly { to: string; label: string }[] };

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSignedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const items = NAV as readonly NavItem[];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out",
        scrolled
          ? "border-b border-primary-foreground/10 bg-primary-deep/95 backdrop-blur"
          : "bg-primary-deep",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        <Link to="/" className="flex min-w-0 shrink items-center gap-2">
          <img
            src="/images/kennymoon-header-logo.png"
            alt="Kennymoon Int'l Ltd logo"
            width={360}
            height={118}
            className="h-11 w-auto max-w-[11rem] shrink-0 object-contain sm:h-12 sm:max-w-[14rem]"
          />
        </Link>

        <nav className="ml-auto hidden items-center gap-6 xl:flex">
          {items.map((item) =>
            item.children ? (
              <div key={item.label} className="group relative">
                <Link
                  to={item.to}
                  className={cn(
                    "flex items-center gap-1 text-sm font-semibold text-primary-foreground/80 transition-colors hover:text-primary-foreground",
                    item.children.some((c) => c.to === pathname) && "text-gold",
                  )}
                >
                  {item.label}
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Link>
                <div className="invisible absolute top-full left-0 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="min-w-44 overflow-hidden rounded-2xl border border-border bg-card py-2 shadow-lift">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={cn(
                          "block px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary hover:text-primary",
                          pathname === child.to && "text-primary",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "nav-link text-sm font-semibold text-primary-foreground/80 hover:text-primary-foreground",
                  pathname === item.to && "text-gold",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 xl:ml-6">
          <Button asChild variant="onDark" size="sm" className="hidden sm:inline-flex">
            <Link to="/auth">Track</Link>
          </Button>
          <Button asChild variant="hero" size="sm" className="px-3 text-xs sm:px-4 sm:text-xs">
            <Link to={signedIn ? "/dashboard" : "/auth"}>
              {signedIn ? "My dashboard" : "Sign Up"}
            </Link>
          </Button>
          <Button asChild variant="leaf" size="sm" className="hidden sm:inline-flex">
            <Link to="/staff-login">
              <Shield className="size-3.5" aria-hidden="true" />
              Admin Portal
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary-foreground transition-colors hover:bg-primary-foreground/10 xl:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {(
        <div
          className={cn(
            "overflow-hidden border-t border-primary-foreground/10 bg-primary-deep transition-all duration-300 ease-out xl:hidden",
            open
              ? "max-h-[80vh] translate-y-0 overflow-y-auto opacity-100"
              : "pointer-events-none max-h-0 -translate-y-2 border-t-0 opacity-0",
          )}
          aria-hidden={!open}
        >
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 sm:px-6">
            {items.map((item) => (
              <div key={item.label}>
                <Link
                  to={item.to}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-semibold text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10",
                    pathname === item.to && "text-gold",
                  )}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-3 border-l border-primary-foreground/15 pl-3">
                    {item.children
                      .filter((c) => c.to !== item.to)
                      .map((child) => (
                        <Link
                          key={child.to}
                          to={child.to}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10",
                            pathname === child.to && "text-gold",
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/auth"
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gold sm:hidden"
            >
              Track a shipment
            </Link>
            <Link
              to="/staff-login"
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-gold"
            >
              Admin Portal
            </Link>

          </nav>
        </div>
      )}
    </header>
  );
}
