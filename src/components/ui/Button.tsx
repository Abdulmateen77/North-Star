import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type Variant = "primary" | "soft" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-clay-500 text-white hover:bg-clay-600 shadow-soft",
  soft: "bg-clay-50 text-clay-700 hover:bg-clay-100 border border-clay-100",
  ghost: "text-ink-600 hover:bg-cream-200 hover:text-ink-900",
  outline: "border border-sand-300 bg-white text-ink-800 hover:border-sand-400 hover:bg-cream-50",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-6 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-pill font-medium " +
  "transition duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantStyles[variant], sizeStyles[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Same visual language as `Button`, but navigates. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(base, variantStyles[variant], sizeStyles[size], className)}
    >
      {children}
    </Link>
  );
}
