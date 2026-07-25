"use client";

import {
  AlarmClock,
  CalendarDays,
  Check,
  Clock,
  ListChecks,
  MapPin,
  Pill,
  Plus,
  RotateCcw,
  User,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { medicationColor } from "@/components/ui/medicationColor";
import type {
  Appointment,
  CarePerson,
  CareTask,
  Medication,
  Reminder,
  TaskPriority,
  TaskStatus,
} from "@/data/types";

import { useCare } from "./CareProvider";

type Tab = "tasks" | "medicines" | "schedule";

const tabs: Array<{ id: Tab; label: string; icon: typeof ListChecks }> = [
  { id: "tasks", label: "Tasks", icon: ListChecks },
  { id: "medicines", label: "Medicines", icon: Pill },
  { id: "schedule", label: "Appointments & reminders", icon: CalendarDays },
];

export function CarePlanView() {
  const { medications, appointments, reminders, people } = useCare();
  const [tab, setTab] = useState<Tab>("tasks");

  return (
    <>
      <div className="no-scrollbar animate-fade-up mt-7 flex gap-2 overflow-x-auto border-b border-bone-300/60 pb-px">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-current={tab === id ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition duration-200",
              tab === id
                ? "border-clay-500 text-olive-900"
                : "border-transparent text-olive-400 hover:text-olive-600",
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === "tasks" ? <TaskBoard /> : null}
        {tab === "medicines" ? <MedicationList medications={medications} /> : null}
        {tab === "schedule" ? (
          <ScheduleView
            appointments={appointments}
            reminders={reminders}
            people={people}
          />
        ) : null}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Tasks                                                                       */
/* -------------------------------------------------------------------------- */

const columns: Array<{ status: TaskStatus; label: string; hint: string }> = [
  { status: "todo", label: "To do", hint: "Nobody has started these yet" },
  { status: "in-progress", label: "In progress", hint: "Someone's on it" },
  { status: "done", label: "Done", hint: "Completed recently" },
];

const priorityTone: Record<TaskPriority, BadgeTone> = {
  high: "rose",
  medium: "gold",
  low: "neutral",
};

function TaskBoard() {
  const { tasks, people, setTaskStatus, crossOutTask, convertTaskToReminder } = useCare();
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      assigneeFilter === null
        ? tasks
        : tasks.filter((task) => task.assigneeId === assigneeFilter),
    [tasks, assigneeFilter],
  );

  /** Click advances a task through the workflow; done cycles back to to-do. */
  function advance(task: CareTask) {
    const next: TaskStatus =
      task.status === "todo" ? "in-progress" : task.status === "in-progress" ? "done" : "todo";
    setTaskStatus(task.id, next);
  }

  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <>
      {/* Filters only — adding is the shell's "Add" button, not a second
          button competing with it here. */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <FilterChip
          active={assigneeFilter === null}
          onClick={() => setAssigneeFilter(null)}
          label={`Everyone (${openCount} open)`}
        />
        {people.map((person) => (
          <FilterChip
            key={person.id}
            active={assigneeFilter === person.id}
            onClick={() => setAssigneeFilter(person.id)}
            label={person.fullName.split(" ")[0]}
            avatar={<Avatar initials={person.initials} accent={person.accent} size="xs" />}
          />
        ))}
      </div>

      <div className="stagger mt-6 grid gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const columnTasks = visible.filter((task) => task.status === column.status);
          return (
            <div key={column.status}>
              <div className="flex items-baseline justify-between px-1">
                <h2 className="text-base text-olive-900">{column.label}</h2>
                <span className="text-xs text-olive-400">{columnTasks.length}</span>
              </div>
              <p className="mt-0.5 px-1 text-xs text-olive-400">{column.hint}</p>

              <ul className="mt-3.5 space-y-3">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    person={people.find((p) => p.id === task.assigneeId) ?? null}
                    onAdvance={() => advance(task)}
                    onCrossOut={() => crossOutTask(task.id)}
                    onConvertToReminder={() => convertTaskToReminder(task.id)}
                  />
                ))}

                {columnTasks.length === 0 ? (
                  <li className="rounded-card border border-dashed border-bone-300 px-4 py-8 text-center text-sm text-olive-400">
                    Nothing here
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

/** How far (px) a leftward drag has to travel before releasing crosses the task out. */
const SWIPE_COMPLETE_THRESHOLD = -88;
/** Below this much movement, a gesture reads as a tap rather than a swipe. */
const TAP_MAX_DRIFT = 8;
const TAP_MAX_DURATION = 400;

function TaskCard({
  task,
  person,
  onAdvance,
  onCrossOut,
  onConvertToReminder,
}: {
  task: CareTask;
  person: CarePerson | null;
  onAdvance: () => void;
  onCrossOut: () => void;
  onConvertToReminder: () => void;
}) {
  const done = task.status === "done";

  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const pointerActive = useRef(false);
  const abandoned = useRef(false);
  const start = useRef({ x: 0, y: 0, time: 0 });

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (done) return;
    if ((event.target as HTMLElement).closest("[data-no-swipe]") !== null) return;

    pointerActive.current = true;
    abandoned.current = false;
    start.current = { x: event.clientX, y: event.clientY, time: Date.now() };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerActive.current || abandoned.current) return;

    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;

    // A gesture that's mostly vertical is the user scrolling the column, not
    // swiping the card — back off entirely rather than fight the scroll.
    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx) * 1.4) {
      abandoned.current = true;
      setDragX(0);
      return;
    }

    setDragX(Math.max(Math.min(dx, 0), SWIPE_COMPLETE_THRESHOLD * 1.6));
  }

  function handlePointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerActive.current) return;
    pointerActive.current = false;
    setIsDragging(false);

    if (abandoned.current) {
      setDragX(0);
      return;
    }

    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    const elapsed = Date.now() - start.current.time;
    const wasTap =
      Math.abs(dx) <= TAP_MAX_DRIFT && Math.abs(dy) <= TAP_MAX_DRIFT && elapsed < TAP_MAX_DURATION;

    if (wasTap) {
      setDragX(0);
      onConvertToReminder();
      return;
    }

    // Recomputed from this event's own coordinates rather than read off the
    // `dragX` state — that state can still reflect an earlier render at the
    // instant pointerup fires, and trusting a stale closure here would let a
    // full swipe silently fail to register as complete.
    const clampedDx = Math.max(Math.min(dx, 0), SWIPE_COMPLETE_THRESHOLD * 1.6);
    if (clampedDx <= SWIPE_COMPLETE_THRESHOLD) {
      onCrossOut();
    }
    setDragX(0);
  }

  const revealProgress = Math.min(1, dragX / SWIPE_COMPLETE_THRESHOLD);

  return (
    <li className="relative">
      {!done ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-end gap-2 rounded-card bg-olive-500 pr-6 text-white"
          style={{ opacity: revealProgress }}
        >
          <Check size={18} strokeWidth={3} />
          <span className="text-sm font-semibold">Done</span>
        </div>
      ) : null}

      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        className="relative touch-pan-y"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: isDragging ? "none" : "transform 260ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <Card as="div" className={cn("p-4", done && "opacity-70")}>
          <div className="flex items-start gap-3">
            <button
              type="button"
              data-no-swipe
              onClick={onAdvance}
              aria-label={done ? `Reopen ${task.title}` : `Advance ${task.title}`}
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2 transition duration-200",
                done
                  ? "border-olive-500 bg-olive-500 text-white"
                  : task.status === "in-progress"
                    ? "border-clay-500 bg-clay-100 hover:bg-clay-300"
                    : "border-bone-400 hover:border-clay-500",
              )}
            >
              {done ? <Check size={12} strokeWidth={3} /> : null}
              {task.status === "in-progress" ? (
                <span className="size-1.5 rounded-full bg-clay-500" />
              ) : null}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "font-medium text-olive-900",
                  done && "text-olive-400 line-through decoration-bone-400",
                )}
              >
                {task.title}
              </p>
              {task.detail ? (
                <p className="mt-1 text-sm leading-relaxed text-olive-600">{task.detail}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!done ? (
                  <Badge tone={priorityTone[task.priority]}>
                    <Clock size={11} />
                    {task.dueLabel}
                  </Badge>
                ) : (
                  <Badge tone="olive">
                    <Check size={11} />
                    {task.completedAt}
                  </Badge>
                )}
                {task.generatedByAi ? (
                  <Badge tone="gold">
                    <StarMark size={10} />
                    AI
                  </Badge>
                ) : null}
              </div>

              <div className="mt-3 flex items-center gap-2 border-t border-bone-300/50 pt-3">
                {person ? (
                  <>
                    <Avatar initials={person.initials} accent={person.accent} size="xs" />
                    <span className="text-xs text-olive-600">{person.fullName}</span>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-olive-400">
                    <User size={12} />
                    Unassigned
                  </span>
                )}
                {done ? (
                  <button
                    type="button"
                    data-no-swipe
                    onClick={onAdvance}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-olive-400 transition hover:text-olive-600"
                  >
                    <RotateCcw size={11} />
                    Reopen
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {!done ? (
        <p className="mt-1.5 px-1 text-[11px] tracking-wide text-olive-300">
          Swipe to cross off · Tap to turn into a reminder
        </p>
      ) : null}
    </li>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  avatar,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  avatar?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-pill border px-3.5 py-2 text-sm font-medium transition duration-200",
        active
          ? "border-clay-500 bg-clay-500 text-white"
          : "border-bone-300/70 bg-white text-olive-600 hover:border-bone-400",
      )}
    >
      {avatar}
      {label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Medicines                                                                   */
/* -------------------------------------------------------------------------- */

function MedicationList({ medications }: { medications: Medication[] }) {
  return (
    <div className="stagger grid gap-4 md:grid-cols-2">
      {medications.map((med) => {
        const low = med.daysSupplyLeft <= 10;
        const color = medicationColor(med.id);
        return (
          <Card key={med.id} className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl",
                    color.bg,
                    color.text,
                  )}
                >
                  <Pill size={19} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg text-olive-900">
                    {med.name}{" "}
                    <span className="font-sans text-sm font-normal text-olive-400">
                      {med.dosage}
                    </span>
                  </h3>
                  <p className="mt-0.5 text-sm text-olive-600">{med.purpose}</p>
                </div>
              </div>
              {low ? <Badge tone="rose">{med.daysSupplyLeft} days left</Badge> : null}
            </div>

            <p className="mt-4 rounded-2xl bg-bone-100 px-3.5 py-2.5 text-sm text-olive-600">
              {med.instruction}
            </p>

            {med.changedNote ? (
              <p className="mt-2.5 flex items-start gap-2 text-xs text-clay-600">
                <StarMark size={11} className="mt-0.5 shrink-0" />
                {med.changedNote}
              </p>
            ) : null}

            <div className="mt-4 flex items-center justify-between border-t border-bone-300/50 pt-3.5">
              <span className="text-xs text-olive-400">Prescribed by {med.prescribedBy}</span>
              <span className="text-xs text-olive-400">{med.refillsRemaining} refills</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Appointments & reminders                                                    */
/* -------------------------------------------------------------------------- */

function ScheduleView({
  appointments,
  reminders,
  people,
}: {
  appointments: Appointment[];
  reminders: Reminder[];
  people: CarePerson[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section>
        <h2 className="text-xl text-olive-900">Upcoming appointments</h2>
        <div className="stagger mt-4 space-y-3.5">
          {appointments.map((appt) => {
            const escort = people.find((p) => p.id === appt.escortId) ?? null;
            return (
              <Card key={appt.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg text-olive-900">{appt.title}</h3>
                    <p className="mt-0.5 text-sm text-olive-600">{appt.clinician}</p>
                  </div>
                  <Badge tone="clay">{appt.dateLabel}</Badge>
                </div>

                <div className="mt-4 space-y-2 text-sm text-olive-600">
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-olive-400" />
                    {appt.timeLabel}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-olive-400" />
                    {appt.location}
                  </p>
                </div>

                {appt.notes ? (
                  <p className="mt-3.5 rounded-2xl bg-bone-100 px-3.5 py-2.5 text-sm text-olive-600">
                    {appt.notes}
                  </p>
                ) : null}

                <div className="mt-4 flex items-center gap-2 border-t border-bone-300/50 pt-3.5">
                  {escort ? (
                    <>
                      <Avatar initials={escort.initials} accent={escort.accent} size="xs" />
                      <span className="text-xs text-olive-600">
                        {escort.fullName.split(" ")[0]} is taking her
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-clay-600">Nobody assigned yet</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-xl text-olive-900">Reminders</h2>
        <p className="mt-1 text-sm text-olive-600">
          What Margaret is nudged about, and whether she confirmed.
        </p>

        <Card className="stagger mt-4 divide-y divide-bone-300/50 p-2">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-3.5 px-3.5 py-3.5">
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-2xl",
                  reminder.enabled
                    ? "bg-olive-50 text-olive-500"
                    : "bg-bone-200 text-olive-400",
                )}
              >
                <AlarmClock size={17} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-olive-900">{reminder.title}</p>
                <p className="truncate text-xs text-olive-400">
                  {reminder.timeLabel} · {reminder.repeatLabel}
                </p>
              </div>

              <div className="shrink-0 text-right">
                {reminder.enabled ? (
                  reminder.lastConfirmed ? (
                    <span className="text-xs text-olive-700">{reminder.lastConfirmed}</span>
                  ) : (
                    <span className="text-xs text-olive-400">Not yet due</span>
                  )
                ) : (
                  <span className="text-xs text-olive-400">Paused</span>
                )}
              </div>
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
