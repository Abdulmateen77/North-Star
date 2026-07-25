import type { ReactNode } from "react";

/** Consistent page masthead across every caregiver screen. */
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1.5 text-3xl leading-tight text-balance text-ink-900 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 max-w-2xl leading-relaxed text-pretty text-ink-600">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Standard page padding — keeps every screen breathing the same way. */
export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-12">{children}</div>
  );
}
