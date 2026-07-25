"use client";

import { Check } from "lucide-react";
import { useEffect } from "react";

import { useCare } from "./CareProvider";

/** Brief confirmation after something is set up. Auto-dismisses. */
export function CareToast() {
  const { toast, clearToast } = useCare();

  useEffect(() => {
    if (toast === null) return;
    const timer = window.setTimeout(clearToast, 3600);
    return () => window.clearTimeout(timer);
  }, [toast, clearToast]);

  if (toast === null) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-rise fixed inset-x-0 bottom-6 z-60 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-pill bg-olive-900 py-3 pr-5 pl-3 text-bone-50 shadow-deep"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold-400 text-olive-900">
        <Check size={15} strokeWidth={3} />
      </span>
      <p className="text-sm font-medium">{toast}</p>
    </div>
  );
}
