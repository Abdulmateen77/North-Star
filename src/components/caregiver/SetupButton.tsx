"use client";

import { Plus } from "lucide-react";

import { cn } from "@/components/ui/cn";

import { useCare } from "./CareProvider";

/**
 * The single way to add anything to Margaret's care.
 *
 * This deliberately lives in the app shell rather than on individual pages.
 * There used to be three routes to the same sheet — a four-card block on the
 * dashboard, a header button on the care plan, and a "New task" button on the
 * board — which turned a simple job into a decision about which door to use.
 * One button, one position, on every screen; the sheet itself picks the type.
 */
export function SetupButton({ className }: { className?: string }) {
  const { openSetup } = useCare();

  return (
    <button
      type="button"
      onClick={() => openSetup("task")}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-clay-500 px-5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:bg-clay-600 active:scale-[0.98]",
        className,
      )}
    >
      <Plus size={17} />
      Add
    </button>
  );
}
