import { cn } from "./cn";

/**
 * The North Star logo mark: a modern 3D metallic ribbon 'N' logo mark.
 */
export function StarMark({
  className,
  size = 28,
  useImage = true,
}: {
  className?: string;
  size?: number;
  useImage?: boolean;
}) {
  if (useImage) {
    return (
      <img
        src="/logo.png"
        alt="North Star"
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn("inline-block object-contain shrink-0 rounded-sm", className)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ns-mark-orange-main" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#FFA726" />
          <stop offset="35%" stopColor="#FF7043" />
          <stop offset="70%" stopColor="#E65100" />
          <stop offset="100%" stopColor="#BF360C" />
        </linearGradient>
        <linearGradient id="ns-mark-orange-light" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="40%" stopColor="#FF9800" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
        <linearGradient id="ns-mark-wire" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="45%" stopColor="#FFE082" />
          <stop offset="100%" stopColor="#FFB300" stopOpacity="0.7" />
        </linearGradient>
        <radialGradient id="ns-mark-sparkle" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#FFE082" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FF8F00" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main 3D Ribbon Loop - Ribbon N Geometry */}
      <path
        d="M 21 57 L 22 10 L 44 38 L 76 92 L 78 16 L 70 20 L 70 80 L 30 24 Z"
        fill="url(#ns-mark-orange-main)"
      />
      <path
        d="M 22 10 L 76 92 L 78 16 L 70 20 L 30 24 Z"
        fill="url(#ns-mark-orange-light)"
        opacity="0.95"
      />

      {/* Metallic Edge Highlights */}
      <path
        d="M 22 10 L 76 92"
        stroke="#FFF8E1"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 78 16 L 76 92"
        stroke="#FFD54F"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Thin Arc Wire Crossing Highlight Line */}
      <path
        d="M 20 57 Q 45 42 78 16"
        stroke="url(#ns-mark-wire)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Sparkle Flare at Junction */}
      <circle cx="20.5" cy="56.5" r="7" fill="url(#ns-mark-sparkle)" />
      <path
        d="M 20.5 46 L 20.5 67 M 10 56.5 L 31 56.5 M 15 51 L 26 62 M 15 62 L 26 51"
        stroke="#FFFFFF"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.95"
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
          "grid size-9 place-items-center rounded-[0.9rem] shadow-soft overflow-hidden shrink-0 bg-clay-500/10 p-1 border border-clay-500/20 backdrop-blur-sm",
        )}
      >
        <StarMark size={26} useImage />
      </span>
      {showWordmark ? (
        <span
          className={cn(
            "font-display text-[1.35rem] leading-none font-semibold tracking-tight",
            tone === "ink" ? "text-olive-900" : "text-white",
          )}
        >
          North Star
        </span>
      ) : null}
    </span>
  );
}

