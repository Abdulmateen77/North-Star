"use client";

import { AlarmClock, CalendarPlus, ListPlus, Pill, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { useCare, type SetupKind } from "./CareProvider";

/** Opens the quick-setup sheet. Pages are server components, so the click
 *  handler has to live in a small client component like this one. */
export function SetupButton({ kind, label }: { kind: SetupKind; label: string }) {
  const { openSetup } = useCare();

  return (
    <Button onClick={() => openSetup(kind)}>
      <Plus size={16} />
      {label}
    </Button>
  );
}

const actions: Array<{ kind: SetupKind; label: string; icon: typeof ListPlus }> = [
  { kind: "task", label: "Add a task", icon: ListPlus },
  { kind: "reminder", label: "Set a reminder", icon: AlarmClock },
  { kind: "medicine", label: "Add a medicine", icon: Pill },
  { kind: "appointment", label: "Add an appointment", icon: CalendarPlus },
];

/**
 * The caregiver's main setup surface. Four taps, four things — deliberately
 * flat rather than nested in a menu, because this is the job people open the
 * app to do.
 */
export function SetupActions() {
  const { openSetup } = useCare();

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {actions.map(({ kind, label, icon: Icon }) => (
        <button
          key={kind}
          type="button"
          onClick={() => openSetup(kind)}
          className="group flex items-center gap-3 rounded-card border border-bone-300/70 bg-white p-4 text-left shadow-soft transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-clay-300 hover:shadow-lift"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-clay-50 text-clay-500 transition duration-300 group-hover:bg-clay-100">
            <Icon size={19} />
          </span>
          <span className="min-w-0 text-sm font-medium text-olive-900">{label}</span>
        </button>
      ))}
    </div>
  );
}
