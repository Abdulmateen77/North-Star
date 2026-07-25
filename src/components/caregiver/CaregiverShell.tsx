"use client";

import {
  Activity,
  FileText,
  Home,
  ListChecks,
  Menu,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import type { CarePerson, CareReceiver } from "@/data/types";
import { Avatar } from "@/components/ui/Avatar";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";

import { SetupButton } from "./SetupButton";

const navItems = [
  { href: "/dashboard", label: "Today", icon: Home },
  { href: "/care", label: "Care plan", icon: ListChecks },
  { href: "/timeline", label: "Timeline", icon: Activity },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/circle", label: "Family", icon: Users },
  { href: "/insights", label: "Insights", icon: TrendingUp },
] as const;

export function CaregiverShell({
  user,
  receiver,
  children,
}: {
  user: CarePerson;
  receiver: CareReceiver;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Navigating on mobile should always dismiss the drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Don't let the page scroll behind an open drawer.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh lg:flex">
      {/* --- Desktop sidebar ------------------------------------------------ */}
      <aside className="sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r border-bone-300/50 bg-bone-50/80 px-5 py-7 backdrop-blur lg:flex">
        <Link href="/" className="px-2">
          <Logo />
        </Link>

        <CareReceiverCard receiver={receiver} className="mt-7" />

        {/* The one and only entry point for adding anything. */}
        <SetupButton className="mt-5 w-full" />

        <nav className="mt-6 flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(pathname, item.href)} />
          ))}
        </nav>

        <div className="mt-6 flex items-center gap-3 rounded-card border border-bone-300/50 bg-white/70 p-3">
          <Avatar initials={user.initials} accent={user.accent} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-olive-900">{user.fullName}</p>
            <p className="truncate text-xs text-olive-400">
              {user.relationship} · Primary caregiver
            </p>
          </div>
        </div>
      </aside>

      {/* --- Mobile top bar ------------------------------------------------- */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-bone-300/50 bg-bone-100/90 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <SetupButton />
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid size-10 place-items-center rounded-full text-olive-600 transition hover:bg-bone-200"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* --- Mobile drawer -------------------------------------------------- */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setDrawerOpen(false)}
            className="animate-fade-in absolute inset-0 bg-olive-900/25 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-[19rem] max-w-[85vw] flex-col bg-bone-50 px-5 py-6 shadow-lift">
            <div className="flex items-center justify-between">
              <Logo showWordmark={false} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid size-10 place-items-center rounded-full text-olive-600 transition hover:bg-bone-200"
                aria-label="Close navigation"
              >
                <X size={19} />
              </button>
            </div>

            <CareReceiverCard receiver={receiver} className="mt-5" />

            <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.href} {...item} active={isActive(pathname, item.href)} />
              ))}
            </nav>

            <div className="flex items-center gap-3 border-t border-bone-300/60 pt-4">
              <Avatar initials={user.initials} accent={user.accent} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-olive-900">{user.fullName}</p>
                <p className="truncate text-xs text-olive-400">{user.relationship}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <main className="min-w-0 flex-1 pb-16">{children}</main>
    </div>
  );
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-pill px-3.5 py-2.5 text-sm font-medium transition duration-200",
        active
          ? "bg-clay-500 text-white shadow-soft"
          : "text-olive-600 hover:bg-bone-200 hover:text-olive-900",
      )}
    >
      <Icon size={18} className={active ? "text-gold-100" : "text-olive-400"} />
      {label}
    </Link>
  );
}

/** The person all of this is about, pinned above the navigation. */
function CareReceiverCard({
  receiver,
  className,
}: {
  receiver: CareReceiver;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-gold-100 bg-gold-50/70 p-3.5",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <Avatar initials={receiver.initials} accent={receiver.accent} size="md" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-olive-900">{receiver.fullName}</p>
          <p className="truncate text-xs text-olive-600">
            {receiver.relationship} · {receiver.age}
          </p>
        </div>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-olive-600">{receiver.situation}</p>
    </div>
  );
}
