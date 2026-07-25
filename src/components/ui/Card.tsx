import type { ElementType, HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type CardTone = "plain" | "bone" | "clay" | "olive" | "gold" | "ai";

const toneStyles: Record<CardTone, string> = {
  plain: "bg-white border-bone-300/60",
  bone: "bg-bone-200 border-bone-300/70",
  clay: "bg-clay-50 border-clay-100",
  olive: "bg-olive-50 border-olive-100",
  gold: "bg-gold-50 border-gold-100",
  /** The assistant's surface — the brand's gradient mesh rather than a flat fill. */
  ai: "mesh-rise border-gold-200/70",
};

interface CardProps extends HTMLAttributes<HTMLElement> {
  tone?: CardTone;
  /** Adds a gentle lift on hover — only for cards that are actually clickable. */
  interactive?: boolean;
  as?: ElementType;
  children: ReactNode;
}

export function Card({
  tone = "plain",
  interactive = false,
  as: Tag = "section",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border shadow-soft transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        toneStyles[tone],
        interactive && "hover:-translate-y-0.5 hover:shadow-lift cursor-pointer",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Standard card header: a title, optional supporting line, optional action. */
export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="text-lg text-olive-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-sm text-olive-600">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
