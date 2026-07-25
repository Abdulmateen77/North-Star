"use client";

import { Check, Clock, Footprints, Pill, Sun } from "lucide-react";
import { useMemo, useState } from "react";

import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/components/ui/cn";
import type { CareTask, MedicationDose } from "@/data/types";

type Item = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
  kind: "medicine" | "movement" | "routine";
  done: boolean;
};

const kindIcons = {
  medicine: Pill,
  movement: Footprints,
  routine: Sun,
} as const;

/**
 * Margaret's whole day on one screen. Doses and the tasks assigned to her are
 * merged into a single list so she never has to work out which section a thing
 * lives in — it's just "what's left today".
 */
export function TodayCompanion({
  doses,
  tasks,
}: {
  doses: MedicationDose[];
  tasks: CareTask[];
}) {
  const [items, setItems] = useState<Item[]>(() => [
    ...doses.map((dose) => ({
      id: dose.id,
      title: `${dose.medicationName} ${dose.dosage}`,
      detail:
        dose.timing === "as-needed"
          ? "Only if you need it"
          : `Take with ${dose.timing === "morning" ? "breakfast" : dose.timing === "evening" ? "dinner" : "a glass of water"}`,
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

  const doneCount = items.filter((item) => item.done).length;
  const remaining = items.length - doneCount;

  // The single next action is lifted out; everything else follows with the
  // outstanding items first so finished ones settle to the bottom.
  const { next, rest } = useMemo(() => {
    const pending = items.filter((item) => !item.done);
    const nextItem = pending[0] ?? null;
    const remainder = items.filter((item) => item.id !== nextItem?.id);

    return {
      next: nextItem,
      rest: [...remainder].sort((a, b) => Number(a.done) - Number(b.done)),
    };
  }, [items]);

  function toggle(id: string) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  }

  return (
    <>
      {/* --- Progress --------------------------------------------------------- */}
      <section className="animate-fade-up rounded-panel border border-gold-100 bg-gold-50/70 p-6">
        <div className="flex items-center gap-5">
          <ProgressRing
            value={items.length === 0 ? 1 : doneCount / items.length}
            size={104}
            stroke={9}
            barClassName="text-clay-500"
            trackClassName="text-gold-100"
          >
            <p className="font-display text-2xl leading-none font-semibold text-ink-900">
              {doneCount}
              <span className="text-ink-400">/{items.length}</span>
            </p>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl leading-tight text-ink-900">
              {remaining === 0 ? "All done for today" : `${remaining} things left today`}
            </h1>
            <p className="mt-1.5 leading-relaxed text-ink-600">
              {remaining === 0
                ? "That's everything. Have a lovely rest of your day."
                : "Take your time. Tick each one off when you've done it."}
            </p>
          </div>
        </div>
      </section>

      {/* --- The next thing --------------------------------------------------- */}
      {next !== null ? (
        <section className="animate-fade-up mt-6" style={{ animationDelay: "0.08s" }}>
          <h2 className="px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
            Next up
          </h2>
          <ItemRow item={next} onToggle={() => toggle(next.id)} emphasised />
        </section>
      ) : null}

      {/* --- Everything else -------------------------------------------------- */}
      <section className="animate-fade-up mt-7" style={{ animationDelay: "0.14s" }}>
        <h2 className="px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
          The rest of today
        </h2>
        <ul className="mt-3 space-y-3">
          {rest.map((item) => (
            <ItemRow key={item.id} item={item} onToggle={() => toggle(item.id)} />
          ))}
        </ul>
      </section>
    </>
  );
}

function ItemRow({
  item,
  onToggle,
  emphasised = false,
}: {
  item: Item;
  onToggle: () => void;
  emphasised?: boolean;
}) {
  const Icon = kindIcons[item.kind];

  return (
    <li className={cn("list-none", emphasised && "mt-3")}>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={item.done}
        className={cn(
          "flex w-full items-center gap-4 rounded-panel border p-5 text-left transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.99]",
          item.done
            ? "border-sand-300/60 bg-cream-200/60"
            : emphasised
              ? "border-clay-100 bg-white shadow-lift"
              : "border-sand-300/60 bg-white shadow-soft hover:border-sand-400",
        )}
      >
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl transition duration-300",
            item.done
              ? "bg-sage-500 text-white"
              : emphasised
                ? "bg-clay-100 text-clay-600"
                : "bg-cream-200 text-ink-600",
          )}
        >
          {item.done ? <Check size={22} strokeWidth={3} /> : <Icon size={22} />}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-lg leading-snug font-medium",
              item.done ? "text-ink-400 line-through decoration-sand-400" : "text-ink-900",
            )}
          >
            {item.title}
          </span>
          {item.detail !== "" ? (
            <span className="mt-0.5 block text-sm leading-relaxed text-ink-600">
              {item.detail}
            </span>
          ) : null}
          <span className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-ink-400">
            <Clock size={13} />
            {item.timeLabel}
          </span>
        </span>

        <span
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full border-2 transition duration-300",
            item.done ? "border-sage-500 bg-sage-500 text-white" : "border-sand-400",
          )}
          aria-hidden="true"
        >
          {item.done ? <Check size={16} strokeWidth={3} /> : null}
        </span>
      </button>
    </li>
  );
}
