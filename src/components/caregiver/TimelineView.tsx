"use client";

import {
  Building2,
  CalendarDays,
  FileText,
  Flag,
  Pill,
  StickyNote,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CarePerson, TimelineEvent, TimelineKind } from "@/data/types";

const kindConfig: Record<
  TimelineKind,
  { icon: typeof Flag; label: string; dot: string; chip: string }
> = {
  milestone: {
    icon: Flag,
    label: "Milestone",
    dot: "bg-gold-400 text-white",
    chip: "bg-gold-50 text-gold-500 border-gold-100",
  },
  hospital: {
    icon: Building2,
    label: "Hospital",
    dot: "bg-clay-500 text-white",
    chip: "bg-clay-50 text-clay-700 border-clay-100",
  },
  appointment: {
    icon: CalendarDays,
    label: "Appointment",
    dot: "bg-olive-500 text-white",
    chip: "bg-olive-50 text-olive-700 border-olive-100",
  },
  "medication-change": {
    icon: Pill,
    label: "Medication",
    dot: "bg-gold-500 text-white",
    chip: "bg-gold-50 text-gold-500 border-gold-100",
  },
  document: {
    icon: FileText,
    label: "Document",
    dot: "bg-gold-500 text-white",
    chip: "bg-gold-50 text-gold-500 border-gold-100",
  },
  note: {
    icon: StickyNote,
    label: "Note",
    dot: "bg-bone-400 text-white",
    chip: "bg-bone-200 text-olive-600 border-bone-300",
  },
};

type Filter = "all" | "significant" | TimelineKind;

const filters: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "Everything" },
  { id: "significant", label: "Key moments" },
  { id: "appointment", label: "Appointments" },
  { id: "medication-change", label: "Medication changes" },
  { id: "document", label: "Documents" },
];

export function TimelineView({
  events,
  people,
}: {
  events: TimelineEvent[];
  people: CarePerson[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return events;
    if (filter === "significant") return events.filter((e) => e.significant);
    return events.filter((e) => e.kind === filter);
  }, [events, filter]);

  return (
    <>
      <div className="no-scrollbar animate-fade-up mt-7 flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={cn(
              "shrink-0 rounded-pill border px-4 py-2 text-sm font-medium transition duration-200",
              filter === item.id
                ? "border-clay-500 bg-clay-500 text-white"
                : "border-bone-300/70 bg-white text-olive-600 hover:border-bone-400",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ol className="stagger relative mt-8">
        {/* The spine. Sits behind the markers, inset to align with their centres. */}
        <span
          className="absolute top-2 bottom-2 left-[19px] w-px bg-gradient-to-b from-bone-300 via-bone-300 to-transparent"
          aria-hidden="true"
        />

        {visible.map((event) => {
          const config = kindConfig[event.kind];
          const Icon = config.icon;
          const actor = people.find((p) => p.id === event.actorId) ?? null;

          return (
            <li key={event.id} className="relative flex gap-5 pb-7 last:pb-0">
              <span
                className={cn(
                  "relative z-10 grid size-10 shrink-0 place-items-center rounded-full shadow-soft ring-4 ring-bone-100",
                  config.dot,
                )}
              >
                <Icon size={17} />
              </span>

              <div className="min-w-0 flex-1 rounded-card border border-bone-300/60 bg-white p-5 shadow-soft transition duration-300 hover:shadow-lift">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-pill border px-2.5 py-1 text-xs font-medium",
                      config.chip,
                    )}
                  >
                    {config.label}
                  </span>
                  <span className="text-xs text-olive-400">{event.dateLabel}</span>
                  {event.significant ? <Badge tone="gold">Key moment</Badge> : null}
                </div>

                <h3 className="mt-2.5 text-lg text-olive-900">{event.title}</h3>
                <p className="mt-1.5 leading-relaxed text-pretty text-olive-600">{event.summary}</p>

                <div className="mt-4 flex items-center gap-2 border-t border-bone-300/50 pt-3.5">
                  {actor ? (
                    <>
                      <Avatar initials={actor.initials} accent={actor.accent} size="xs" />
                      <span className="text-xs text-olive-400">
                        Logged by {actor.fullName.split(" ")[0]}
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs text-gold-500">
                      <StarMark size={11} />
                      Added from a document by North Star
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-sm text-olive-400">
          Nothing recorded under this filter yet.
        </p>
      ) : null}
    </>
  );
}
