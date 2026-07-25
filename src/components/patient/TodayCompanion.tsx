"use client";

import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Footprints,
  MapPin,
  Pill,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Emphasis } from "@/components/ui/Emphasis";
import { cn } from "@/components/ui/cn";
import type { Appointment, CareTask, MedicationDose } from "@/data/types";

type Item = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  kind: "medicine" | "movement";
  done: boolean;
};

const kindIcons = {
  medicine: Pill,
  movement: Footprints,
} as const;

/**
 * Margaret's whole day on one screen.
 *
 * The design rule here is one decision at a time: a single large card for the
 * next thing she needs to do, and everything else demoted to a quiet list
 * below it. Doses and her own tasks are merged into one stream so she never
 * has to work out which section a thing lives in.
 */
export function TodayCompanion({
  doses,
  tasks,
  appointment,
  firstName,
}: {
  doses: MedicationDose[];
  tasks: CareTask[];
  appointment: Appointment | null;
  firstName: string;
}) {
  const [items, setItems] = useState<Item[]>(() => [
    ...doses.map((dose) => ({
      id: dose.id,
      title: `${dose.medicationName} ${dose.dosage}`,
      detail:
        dose.timing === "as-needed"
          ? "Only if you need it"
          : `With ${dose.timing === "morning" ? "breakfast" : dose.timing === "evening" ? "dinner" : "a glass of water"}`,
      timeLabel: dose.scheduledFor,
      kind: "medicine" as const,
      done: dose.status === "taken",
    })),
    ...tasks.map((task) => ({
      id: task.id,
      title: task.title,
      detail: task.detail ?? "",
      timeLabel: task.dueLabel,
      kind: "movement" as const,
      done: task.status === "done",
    })),
  ]);

  const [showDone, setShowDone] = useState(false);

  const doneCount = items.filter((item) => item.done).length;
  const remaining = items.length - doneCount;

  const { next, laterItems, doneItems } = useMemo(() => {
    const pending = items.filter((item) => !item.done);
    const nextItem = pending[0] ?? null;

    return {
      next: nextItem,
      laterItems: pending.filter((item) => item.id !== nextItem?.id),
      doneItems: items.filter((item) => item.done),
    };
  }, [items]);

  function toggle(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  return (
    <>
      {/* --- Where she's up to. A sentence, not a dashboard. ------------------ */}
      <section className="animate-fade-up">
        <h1 className="text-[2rem] leading-[1.15] font-bold tracking-tight text-olive-900">
          {remaining === 0 ? (
            <>
              You&apos;re <Emphasis>all done</Emphasis> for today.
            </>
          ) : (
            <>
              {remaining} {remaining === 1 ? "thing" : "things"} left today.
            </>
          )}
        </h1>
        <p className="mt-2.5 text-lg leading-relaxed text-olive-600">
          {remaining === 0
            ? "Everything's ticked off. Have a lovely rest of your day."
            : "Take your time. There's no rush."}
        </p>

        {/* A row of dots reads at a glance; a percentage does not. */}
        <div className="mt-5 flex items-center gap-2">
          {items.map((item) => (
            <span
              key={item.id}
              className={cn(
                "h-2.5 flex-1 rounded-pill transition duration-500",
                item.done ? "bg-olive-500" : "bg-bone-300",
              )}
            />
          ))}
        </div>
      </section>

      {/* --- The one thing to do next ----------------------------------------- */}
      {next !== null ? (
        <section className="animate-fade-up mt-8" style={{ animationDelay: "0.08s" }}>
          <NextCard item={next} onDone={() => toggle(next.id)} />
        </section>
      ) : null}

      {/* --- Today's appointment, so she never has to go looking --------------- */}
      {appointment !== null ? (
        <section
          className="animate-fade-up mt-6 rounded-panel border border-bone-300/60 bg-white p-5"
          style={{ animationDelay: "0.12s" }}
        >
          <p className="text-sm font-medium tracking-wide text-olive-400 uppercase">
            Coming up
          </p>
          <p className="mt-2 text-lg leading-snug font-semibold text-olive-900">
            {appointment.title}
          </p>
          <p className="mt-2 flex items-center gap-2 text-olive-600">
            <Clock size={16} className="shrink-0 text-olive-400" />
            {appointment.dateLabel} at {appointment.timeLabel}
          </p>
          <p className="mt-1.5 flex items-start gap-2 text-olive-600">
            <MapPin size={16} className="mt-0.5 shrink-0 text-olive-400" />
            {appointment.location}
          </p>
          {appointment.transport !== null ? (
            <p className="mt-3.5 rounded-2xl bg-olive-50 px-4 py-3 text-olive-700">
              {appointment.transport}
            </p>
          ) : null}
        </section>
      ) : null}

      {/* --- Still to come ---------------------------------------------------- */}
      {laterItems.length > 0 ? (
        <section className="animate-fade-up mt-8" style={{ animationDelay: "0.16s" }}>
          <h2 className="px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
            Later today
          </h2>
          <ul className="mt-3 space-y-2.5">
            {laterItems.map((item) => (
              <QuietRow key={item.id} item={item} onToggle={() => toggle(item.id)} />
            ))}
          </ul>
        </section>
      ) : null}

      {/* Finished items are folded away — they're reassurance, not something
          she needs to scroll past to reach what's left. */}
      {doneItems.length > 0 ? (
        <section className="animate-fade-up mt-6" style={{ animationDelay: "0.2s" }}>
          <button
            type="button"
            onClick={() => setShowDone((open) => !open)}
            aria-expanded={showDone}
            className="flex min-h-12 w-full items-center justify-between rounded-panel px-1 text-olive-600 transition hover:text-olive-900"
          >
            <span className="flex items-center gap-2">
              <Check size={17} strokeWidth={3} className="text-olive-500" />
              {doneItems.length} done today
            </span>
            <ChevronDown
              size={18}
              className={cn("transition-transform duration-300", showDone && "rotate-180")}
            />
          </button>

          {showDone ? (
            <ul className="mt-2 space-y-2.5">
              {doneItems.map((item) => (
                <QuietRow key={item.id} item={item} onToggle={() => toggle(item.id)} />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <Link
        href="/patient/reminders"
        className="mt-8 flex items-center justify-between rounded-panel px-1 py-3 text-olive-600 transition hover:text-olive-900"
      >
        <span>See all your reminders</span>
        <ChevronRight size={18} />
      </Link>
    </>
  );
}

/**
 * The hero card. One tap, one outcome — no secondary controls, and the tap
 * target is the whole card rather than a small checkbox.
 */
function NextCard({ item, onDone }: { item: Item; onDone: () => void }) {
  const Icon = kindIcons[item.kind];

  return (
    <button
      type="button"
      onClick={onDone}
      className="mesh-bloom w-full overflow-hidden rounded-blob border border-peach-200/70 p-7 text-left shadow-lift transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]"
    >
      <span className="flex items-center gap-2 text-sm font-semibold tracking-wide text-clay-700 uppercase">
        <Clock size={15} />
        {item.timeLabel}
      </span>

      <span className="mt-4 flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-olive-900/85 text-gold-200">
          <Icon size={26} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xl leading-tight font-bold tracking-tight text-olive-900">
            {item.title}
          </span>
          {item.detail !== "" ? (
            <span className="mt-1 block text-lg leading-relaxed text-olive-700">
              {item.detail}
            </span>
          ) : null}
        </span>
      </span>

      <span className="mt-6 flex min-h-14 items-center justify-center gap-2.5 rounded-pill bg-olive-900 px-6 text-lg font-semibold text-bone-50">
        <Check size={20} strokeWidth={3} />
        I&apos;ve done this
      </span>
    </button>
  );
}

/** A completed or later item. Deliberately low-contrast so it doesn't compete. */
function QuietRow({ item, onToggle }: { item: Item; onToggle: () => void }) {
  const Icon = kindIcons[item.kind];

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.done}
        className={cn(
          "flex min-h-16 w-full items-center gap-4 rounded-panel border px-5 py-4 text-left transition duration-300 active:scale-[0.99]",
          item.done
            ? "border-transparent bg-bone-200/50"
            : "border-bone-300/60 bg-white shadow-soft",
        )}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-2xl transition duration-300",
            item.done ? "bg-olive-500 text-white" : "bg-bone-200 text-olive-600",
          )}
        >
          {item.done ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-lg leading-snug font-medium",
              item.done ? "text-olive-400 line-through decoration-bone-400" : "text-olive-900",
            )}
          >
            {item.title}
          </span>
          <span className="mt-0.5 block text-olive-500">{item.timeLabel}</span>
        </span>
      </button>
    </li>
  );
}
