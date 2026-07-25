import type { ReactNode } from "react";

import { cn } from "./cn";

/**
 * The brand's headline device: one word lifted out of a bold sans headline
 * and set in the serif, with a hand-drawn stroke swept underneath it.
 *
 *   <h1>Healthcare can feel <Emphasis>overwhelming</Emphasis></h1>
 *
 * Use it once per headline. Two emphasised words in the same sentence cancel
 * each other out and the line stops reading as deliberate.
 */
export function Emphasis({
  children,
  tone = "gold",
  className,
}: {
  children: ReactNode;
  tone?: "gold" | "clay" | "cream";
  className?: string;
}) {
  const strokeClass = {
    gold: "text-gold-500",
    clay: "text-clay-500",
    cream: "text-gold-300",
  }[tone];

  return (
    <span className={cn("relative inline-block font-display font-normal italic", className)}>
      <span className="relative z-10">{children}</span>

      {/* Two overlapping strokes with slightly different curves — a single
          clean arc reads as a border, not as something drawn by hand. */}
      <svg
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 -bottom-1 h-[0.38em] w-full overflow-visible",
          strokeClass,
        )}
      >
        <path
          d="M2 9.5C34 5.2 78 3.4 118 4.6c26 .8 52 2.6 80 4.2"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="animate-underline"
          style={{ strokeDasharray: 240 }}
        />
        <path
          d="M8 12.4C42 9.1 86 7.9 128 8.8c22 .5 44 1.6 64 2.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.5"
          className="animate-underline"
          style={{ strokeDasharray: 240, animationDelay: "0.45s" }}
        />
      </svg>
    </span>
  );
}
