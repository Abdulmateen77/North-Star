"use client";

import { CalendarDays, Clock } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";

import { useCare } from "./CareProvider";

/**
 * Today's priorities, read live from `CareProvider` so anything added from the
 * shell's Add button appears here without a reload.
 *
 * Capped at three: this is a "what now" panel, not the full list — the care
 * plan is one click away and holds everything.
 */
export function DashboardPanels() {
  const { tasks, appointments, people } = useCare();

  const open = tasks.filter((task) => task.status !== "done");
  const priorities = open.slice(0, 3);
  const nextAppointment = appointments[0] ?? null;

  return (
    <Card className="flex flex-col p-6">
      <CardHeader
        title="Today's priorities"
        action={
          <Link
            href="/care"
            className="text-sm font-medium text-clay-600 transition hover:text-clay-700"
          >
            All {open.length}
          </Link>
        }
      />

      <ul className="mt-4 flex-1 space-y-2">
        {priorities.map((task) => {
          const assignee = people.find((person) => person.id === task.assigneeId) ?? null;

          return (
            <li
              key={task.id}
              className="flex items-start gap-3 rounded-2xl border border-bone-300/50 bg-bone-50/70 p-3.5"
            >
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                  task.status === "in-progress"
                    ? "border-clay-500 bg-clay-100"
                    : "border-bone-400",
                )}
              >
                {task.status === "in-progress" ? (
                  <span className="size-1.5 rounded-full bg-clay-500" />
                ) : null}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug font-medium text-olive-900">{task.title}</p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={task.priority === "high" ? "rose" : "neutral"}>
                    <Clock size={11} />
                    {task.dueLabel}
                  </Badge>
                  {task.generatedByAi ? (
                    <Badge tone="gold">
                      <StarMark size={10} />
                      AI
                    </Badge>
                  ) : null}
                  {assignee !== null ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-olive-600">
                      <Avatar initials={assignee.initials} accent={assignee.accent} size="xs" />
                      {assignee.fullName.split(" ")[0]}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}

        {priorities.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-bone-300 px-4 py-8 text-center text-sm text-olive-400">
            Nothing outstanding. The family is all caught up.
          </li>
        ) : null}
      </ul>

      {/* Next appointment sits inside this card rather than claiming its own
          full-width band further down the page. */}
      {nextAppointment !== null ? (
        <div className="mt-4 flex items-start gap-3 border-t border-bone-300/60 pt-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-bone-200 text-olive-600">
            <CalendarDays size={17} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-olive-900">{nextAppointment.title}</p>
            <p className="mt-0.5 text-xs text-olive-600">
              {nextAppointment.dateLabel} · {nextAppointment.timeLabel} ·{" "}
              {nextAppointment.location}
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
