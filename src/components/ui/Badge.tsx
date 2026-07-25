import type { ReactNode } from "react";

import { cn } from "./cn";

export type BadgeTone = "neutral" | "clay" | "olive" | "gold" | "peach" | "rose";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-bone-200 text-olive-600 border-bone-300/70",
  clay: "bg-clay-50 text-clay-700 border-clay-100",
  /** Positive — things going well. */
  olive: "bg-olive-50 text-olive-700 border-olive-100",
  /** The AI voice, and anything the assistant produced. */
  gold: "bg-gold-100 text-gold-600 border-gold-200",
  peach: "bg-peach-50 text-peach-500 border-peach-100",
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
