import type { ReactNode } from "react";

import { cn } from "./cn";

export type BadgeTone = "neutral" | "clay" | "sage" | "gold" | "plum" | "rose";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-cream-200 text-ink-600 border-sand-300/70",
  clay: "bg-clay-50 text-clay-700 border-clay-100",
  sage: "bg-sage-50 text-sage-600 border-sage-100",
  gold: "bg-gold-50 text-gold-500 border-gold-100",
  plum: "bg-plum-50 text-plum-500 border-plum-100",
  rose: "bg-rose-50 text-rose-500 border-rose-100",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
