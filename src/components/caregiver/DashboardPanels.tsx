"use client";

import { Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";

import { useCare } from "./CareProvider";

/**
 * Priorities and the next appointment, read live from `CareProvider` so a task
 * added anywhere in the app appears here without a reload.
 */
export function DashboardPanels() {
  const { tasks, appointments, people } = useCare();

  const priorities = tasks.filter((task) => task.status !== "done").slice(0, 4);
  const nextAppointment = appointments[0] ?? null;

  return (
    <div className="stagger mt-5 grid gap-5 lg:grid-cols-3">
      <Card className="p-6 sm:p-7 lg:col-span-2">
        <CardHeader
          title="Today's priorities"
          subtitle={`${priorities.length} things need the family's attention`}
          action={
            <Link
              href="/care"
              className="text-sm font-medium text-clay-600 transition hover:text-clay-700"
            >
              View all
            </Link>
          }
        />

        <ul className="mt-5 space-y-2.5">
          {priorities.map((task) => {
            const assignee = people.find((person) => person.id === task.assigneeId) ?? null;

            return (
              <li
                key={task.id}
                className="flex items-start gap-3.5 rounded-card border border-bone-300/50 bg-bone-50/70 p-4 transition duration-300 hover:border-bone-400/70 hover:bg-bone-50"
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
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-olive-900">{task.title}</p>
                    {task.generatedByAi ? (
                      <Badge tone="gold">
                        <StarMark size={10} />
                        AI
                      </Badge>
                    ) : null}
                  </div>
                  {task.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-olive-600">{task.detail}</p>
                  ) : null}

                  <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                    <Badge tone={task.priority === "high" ? "rose" : "neutral"}>
                      <Clock size={11} />
                      {task.dueLabel}
                    </Badge>
                    {assignee ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-olive-600">
                        <Avatar
                          initials={assignee.initials}
                          accent={assignee.accent}
                          size="xs"
                        />
                        {assignee.fullName.split(" ")[0]}
                      </span>
                    ) : (
                      <span className="text-xs text-olive-400">Unassigned</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {priorities.length === 0 ? (
            <li className="rounded-card border border-dashed border-bone-300 px-4 py-10 text-center text-sm text-olive-400">
              Nothing outstanding. The family is all caught up.
            </li>
          ) : null}
        </ul>
      </Card>

      {nextAppointment !== null ? (
        <Card tone="bone" className="h-fit p-6">
          <p className="text-xs font-medium tracking-wide text-olive-400 uppercase">
            Next appointment
          </p>
          <h3 className="mt-2 text-lg text-olive-900">{nextAppointment.title}</h3>
          <p className="mt-1 text-sm text-olive-600">{nextAppointment.clinician}</p>

          <div className="mt-4 space-y-2 text-sm text-olive-600">
            <p className="flex items-center gap-2">
              <Clock size={14} className="text-olive-400" />
              {nextAppointment.dateLabel} · {nextAppointment.timeLabel}
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-olive-400" />
              {nextAppointment.location}
            </p>
          </div>

          {nextAppointment.transport !== null ? (
            <p className="mt-4 rounded-2xl bg-white/70 px-3.5 py-2.5 text-xs text-olive-600">
              {nextAppointment.transport}
            </p>
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
