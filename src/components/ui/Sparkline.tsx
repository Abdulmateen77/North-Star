import { cn } from "./cn";

/**
 * A soft trend line for health metrics — smoothed, with a faded area fill.
 * Values are normalised 0–1 by the data layer so this never has to scale.
 */
export function Sparkline({
  series,
  className,
  width = 120,
  height = 36,
}: {
  series: number[];
  className?: string;
  width?: number;
  height?: number;
}) {
  if (series.length < 2) return null;

  const pad = 3;
  const stepX = (width - pad * 2) / (series.length - 1);
  const toY = (v: number) => pad + (1 - Math.min(1, Math.max(0, v))) * (height - pad * 2);

  const points = series.map((v, i) => [pad + i * stepX, toY(v)] as const);

  // Catmull-Rom style smoothing keeps the line organic rather than jagged.
  const line = points
    .map(([x, y], i) => {
      if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`;
      const [px, py] = points[i - 1];
      const cx = (px + x) / 2;
      return `C ${cx.toFixed(2)} ${py.toFixed(2)}, ${cx.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const area = `${line} L ${(width - pad).toFixed(2)} ${height - pad} L ${pad} ${height - pad} Z`;
  const gradientId = `spark-${series.slice(0, 3).join("-").replace(/\./g, "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("overflow-visible", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.22" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
