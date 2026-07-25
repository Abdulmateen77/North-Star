import { cn } from "./cn";

/**
 * The mark: a soft four-point star with rounded, slightly concave arms — a
 * guiding star that reads as warm rather than sharp.
 */
export function StarMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M16 1.8c.5 0 .9.33 1.03.81l2.06 7.5a6.6 6.6 0 0 0 4.6 4.6l7.5 2.06a1.07 1.07 0 0 1 0 2.06l-7.5 2.06a6.6 6.6 0 0 0-4.6 4.6l-2.06 7.5a1.07 1.07 0 0 1-2.06 0l-2.06-7.5a6.6 6.6 0 0 0-4.6-4.6l-7.5-2.06a1.07 1.07 0 0 1 0-2.06l7.5-2.06a6.6 6.6 0 0 0 4.6-4.6l2.06-7.5A1.07 1.07 0 0 1 16 1.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  tone = "ink",
}: {
  className?: string;
  showWordmark?: boolean;
  tone?: "ink" | "light";
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "grid size-9 place-items-center rounded-[0.9rem] shadow-soft",
          tone === "ink" ? "bg-clay-500 text-gold-100" : "bg-white/15 text-gold-100",
        )}
      >
        <StarMark size={20} />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-[1.35rem] leading-none font-semibold tracking-tight",
            tone === "ink" ? "text-ink-900" : "text-white",
          )}
        >
          North Star
        </span>
      ) : null}
    </span>
  );
}
