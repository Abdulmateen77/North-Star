"use client";

import { HeartPulse, Home, LifeBuoy, MessageCircleHeart, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CareReceiver } from "@/data/types";

/**
 * Four destinations, and that's the whole app.
 *
 * Reminders used to sit here too, but her reminders *are* the checklist on
 * Today — a separate tab meant the same information in two places and one
 * more decision every time she opened the app. The full schedule is still
 * reachable from a quiet link at the bottom of Today.
 */
const navItems = [
  { href: "/patient", label: "Today", icon: Home },
  { href: "/patient/health", label: "Health", icon: HeartPulse },
  { href: "/patient/assistant", label: "Ask", icon: Sparkles },
  { href: "/patient/family", label: "Family", icon: MessageCircleHeart },
] as const;

/**
 * The care receiver's shell. Everything here is deliberately larger and
 * calmer than the caregiver app: bigger type, fewer choices, one clear
 * action per screen, and help never more than one tap away.
 *
 * On wide screens it stays a single centred column rather than expanding —
 * this is a phone experience that happens to also open on a laptop.
 */
export function PatientShell({
  receiver,
  children,
}: {
  receiver: CareReceiver;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-bone-100">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-bone-300/50 bg-bone-100/90 px-5 py-4 backdrop-blur">
        <Link href="/patient" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-clay-500 text-gold-100">
            <StarMark size={18} />
          </span>
          <span className="font-display text-lg leading-none font-semibold text-olive-900">
            Hello, {receiver.fullName.split(" ")[0]}
          </span>
        </Link>

        <Link
          href="/patient/emergency"
          className="inline-flex items-center gap-1.5 rounded-pill border border-rose-100 bg-rose-50 px-3.5 py-2 text-sm font-medium text-rose-500 transition hover:bg-rose-100"
        >
          <LifeBuoy size={16} />
          Help
        </Link>
      </header>

      {/* Bottom padding clears the fixed nav plus the home indicator. */}
      <main className="flex-1 px-5 pt-6 pb-[calc(7.5rem+env(safe-area-inset-bottom))]">
        {children}
      </main>

      {/* --- Bottom navigation ------------------------------------------------ */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-lg border-t border-bone-300/60 bg-bone-50/95 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
        <ul className="flex items-stretch justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 transition duration-200",
                    active ? "text-clay-600" : "text-olive-400 hover:text-olive-600",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition duration-200",
                      active ? "bg-clay-100" : "bg-transparent",
                    )}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="text-xs font-medium">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
