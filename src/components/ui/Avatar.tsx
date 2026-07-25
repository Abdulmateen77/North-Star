import type { PersonAccent } from "@/data/types";

import { cn } from "./cn";

/**
 * A person keeps the same accent colour everywhere they appear, so the family
 * becomes recognisable at a glance across tasks, timeline and updates.
 */
const accentStyles: Record<PersonAccent, string> = {
  clay: "bg-clay-100 text-clay-700",
  olive: "bg-olive-100 text-olive-700",
  gold: "bg-gold-200 text-gold-600",
  peach: "bg-peach-200 text-peach-500",
};

const sizeStyles = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

export function Avatar({
  initials,
  accent = "clay",
  size = "md",
  className,
}: {
  initials: string;
  accent?: PersonAccent;
  size?: keyof typeof sizeStyles;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide select-none",
        accentStyles[accent],
        sizeStyles[size],
        className,
      )}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Overlapping avatar row used for "who's involved" summaries. */
export function AvatarStack({
  people,
  size = "sm",
}: {
  people: Array<{ id: string; initials: string; accent: PersonAccent }>;
  size?: keyof typeof sizeStyles;
}) {
  return (
    <div className="flex -space-x-2">
      {people.map((person) => (
        <Avatar
          key={person.id}
          initials={person.initials}
          accent={person.accent}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
    </div>
  );
}
