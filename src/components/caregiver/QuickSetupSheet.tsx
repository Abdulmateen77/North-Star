"use client";

import { AlarmClock, CalendarPlus, Check, ListPlus, Pill, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import type {
  Appointment,
  CarePerson,
  CareTask,
  Medication,
  MedicationTiming,
  Reminder,
  ReminderKind,
  TaskPriority,
} from "@/data/types";

import { useCare, type SetupKind } from "./CareProvider";

const sheetMeta: Record<SetupKind, { label: string; blurb: string; icon: typeof ListPlus }> = {
  task: {
    label: "Task",
    blurb: "Something the family needs to do. Assign it and it appears on their list.",
    icon: ListPlus,
  },
  reminder: {
    label: "Reminder",
    blurb: "Margaret gets a gentle nudge, and you'll see when she confirms it.",
    icon: AlarmClock,
  },
  medicine: {
    label: "Medicine",
    blurb: "It joins her daily checklist at the times you choose.",
    icon: Pill,
  },
  appointment: {
    label: "Appointment",
    blurb: "Everyone sees it, and you can say who's taking her.",
    icon: CalendarPlus,
  },
};

const setupKinds: SetupKind[] = ["task", "reminder", "medicine", "appointment"];

export function QuickSetupSheet() {
  const { setupKind, openSetup, closeSetup } = useCare();

  // Escape closes, and the page behind shouldn't scroll while it's open.
  useEffect(() => {
    if (setupKind === null) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeSetup();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [setupKind, closeSetup]);

  if (setupKind === null) return null;

  const meta = sheetMeta[setupKind];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={closeSetup}
        className="animate-fade-in absolute inset-0 bg-olive-900/35 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Add a ${meta.label.toLowerCase()} to Margaret's care`}
        className="animate-rise relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-panel bg-bone-50 shadow-deep sm:rounded-panel"
      >
        {/* Header carries the brand mesh so even a form feels considered.
            The type picker lives here rather than on a separate step: there is
            exactly one way into this sheet, so choosing what to add and filling
            it in have to happen in the same view. */}
        <div className="mesh-rise relative shrink-0 px-6 pt-5 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight text-olive-900">
                Add to Margaret&apos;s care
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-olive-700">{meta.blurb}</p>
            </div>
            <button
              type="button"
              onClick={closeSetup}
              aria-label="Close"
              className="grid size-9 shrink-0 place-items-center rounded-full text-olive-700 transition hover:bg-white/50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto" role="tablist">
            {setupKinds.map((kind) => {
              const item = sheetMeta[kind];
              const ItemIcon = item.icon;
              const active = kind === setupKind;

              return (
                <button
                  key={kind}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => openSetup(kind)}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-medium transition duration-200",
                    active
                      ? "bg-olive-900 text-bone-50"
                      : "bg-white/65 text-olive-700 hover:bg-white/90",
                  )}
                >
                  <ItemIcon size={15} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {setupKind === "task" ? <TaskForm /> : null}
          {setupKind === "reminder" ? <ReminderForm /> : null}
          {setupKind === "medicine" ? <MedicineForm /> : null}
          {setupKind === "appointment" ? <AppointmentForm /> : null}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared field primitives                                                     */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-olive-800">{label}</span>
      {hint !== undefined ? (
        <span className="ml-2 text-xs text-olive-400">{hint}</span>
      ) : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-bone-300 bg-white px-4 py-3 text-olive-900 " +
  "placeholder:text-olive-400 transition focus:border-clay-400 focus:outline-none";

/** Horizontal chip picker — one tap instead of a dropdown. */
function ChipGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; icon?: ReactNode }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition duration-200",
            value === option.value
              ? "border-clay-500 bg-clay-500 text-white"
              : "border-bone-300 bg-white text-olive-600 hover:border-bone-400",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** Same as ChipGroup but multiple values can be on at once. */
function MultiChipGroup<T extends string>({
  options,
  values,
  onToggle,
}: {
  options: Array<{ value: T; label: string }>;
  values: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(option.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition duration-200",
              on
                ? "border-clay-500 bg-clay-500 text-white"
                : "border-bone-300 bg-white text-olive-600 hover:border-bone-400",
            )}
          >
            {on ? <Check size={13} strokeWidth={3} /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function PersonPicker({
  people,
  value,
  onChange,
  allowNobody = true,
}: {
  people: CarePerson[];
  value: string | null;
  onChange: (id: string | null) => void;
  allowNobody?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {people.map((person) => (
        <button
          key={person.id}
          type="button"
          onClick={() => onChange(person.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-pill border py-1.5 pr-3.5 pl-1.5 text-sm font-medium transition duration-200",
            value === person.id
              ? "border-clay-500 bg-clay-500 text-white"
              : "border-bone-300 bg-white text-olive-600 hover:border-bone-400",
          )}
        >
          <Avatar initials={person.initials} accent={person.accent} size="xs" />
          {person.fullName.split(" ")[0]}
        </button>
      ))}

      {allowNobody ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            "rounded-pill border px-3.5 py-2 text-sm font-medium transition duration-200",
            value === null
              ? "border-clay-500 bg-clay-500 text-white"
              : "border-bone-300 bg-white text-olive-600 hover:border-bone-400",
          )}
        >
          Nobody yet
        </button>
      ) : null}
    </div>
  );
}

function SubmitRow({ label, disabled }: { label: string; disabled: boolean }) {
  const { closeSetup } = useCare();

  return (
    <div className="mt-7 flex gap-3">
      <Button type="submit" disabled={disabled} className="flex-1">
        {label}
      </Button>
      <Button type="button" variant="outline" onClick={closeSetup}>
        Cancel
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Task                                                                        */
/* -------------------------------------------------------------------------- */

function TaskForm() {
  const { people, addTask, closeSetup } = useCare();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(people[0]?.id ?? null);
  const [dueLabel, setDueLabel] = useState("Today");
  const [priority, setPriority] = useState<TaskPriority>("medium");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    addTask({
      id: `task-${Date.now()}`,
      title: title.trim(),
      detail: detail.trim() === "" ? null : detail.trim(),
      status: "todo",
      priority,
      category: "admin",
      assigneeId,
      dueLabel,
      generatedByAi: false,
      sourceDocumentId: null,
      completedAt: null,
    });
    closeSetup();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="What needs doing?">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Order a repeat prescription"
          className={inputClass}
          autoFocus
        />
      </Field>

      <Field label="Any detail?" hint="optional">
        <input
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder="Nine days of supply left"
          className={inputClass}
        />
      </Field>

      <Field label="Who's doing it?">
        <PersonPicker people={people} value={assigneeId} onChange={setAssigneeId} />
      </Field>

      <Field label="When?">
        <ChipGroup
          value={dueLabel}
          onChange={setDueLabel}
          options={[
            { value: "Today", label: "Today" },
            { value: "Tomorrow", label: "Tomorrow" },
            { value: "This week", label: "This week" },
          ]}
        />
      </Field>

      <Field label="How urgent?">
        <ChipGroup<TaskPriority>
          value={priority}
          onChange={setPriority}
          options={[
            { value: "high", label: "Urgent" },
            { value: "medium", label: "Normal" },
            { value: "low", label: "Whenever" },
          ]}
        />
      </Field>

      <SubmitRow label="Add task" disabled={title.trim() === ""} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Reminder                                                                    */
/* -------------------------------------------------------------------------- */

function ReminderForm() {
  const { addReminder, closeSetup } = useCare();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<ReminderKind>("medication");
  const [time, setTime] = useState("08:00");
  const [repeat, setRepeat] = useState("Every day");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    addReminder({
      id: `rem-${Date.now()}`,
      title: title.trim(),
      kind,
      timeLabel: formatTime(time),
      repeatLabel: repeat,
      enabled: true,
      lastConfirmed: null,
    });
    closeSetup();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="What's the reminder?">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Evening medication"
          className={inputClass}
          autoFocus
        />
      </Field>

      <Field label="What kind?">
        <ChipGroup<ReminderKind>
          value={kind}
          onChange={setKind}
          options={[
            { value: "medication", label: "Medicine" },
            { value: "appointment", label: "Appointment" },
            { value: "movement", label: "Movement" },
            { value: "hydration", label: "Drink" },
            { value: "custom", label: "Something else" },
          ]}
        />
      </Field>

      <Field label="What time?">
        <input
          type="time"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="How often?">
        <ChipGroup
          value={repeat}
          onChange={setRepeat}
          options={[
            { value: "Every day", label: "Every day" },
            { value: "Weekdays", label: "Weekdays" },
            { value: "Once", label: "Just once" },
          ]}
        />
      </Field>

      <SubmitRow label="Set reminder" disabled={title.trim() === ""} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Medicine                                                                    */
/* -------------------------------------------------------------------------- */

function MedicineForm() {
  const { addMedication, closeSetup } = useCare();
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [purpose, setPurpose] = useState("");
  const [timings, setTimings] = useState<MedicationTiming[]>(["morning"]);

  function toggleTiming(timing: MedicationTiming) {
    setTimings((current) =>
      current.includes(timing)
        ? current.filter((item) => item !== timing)
        : [...current, timing],
    );
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    addMedication({
      id: `med-${Date.now()}`,
      name: name.trim(),
      dosage: dosage.trim(),
      instruction: describeTimings(timings),
      timings,
      purpose: purpose.trim() === "" ? "Added by the family" : purpose.trim(),
      prescribedBy: "Added by Amara",
      startedAt: new Date().toISOString().slice(0, 10),
      changedNote: null,
      refillsRemaining: 1,
      daysSupplyLeft: 28,
    });
    closeSetup();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Which medicine?">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Metformin"
          className={inputClass}
          autoFocus
        />
      </Field>

      <Field label="How much?">
        <input
          value={dosage}
          onChange={(event) => setDosage(event.target.value)}
          placeholder="500mg"
          className={inputClass}
        />
      </Field>

      <Field label="When does she take it?" hint="choose any">
        <MultiChipGroup<MedicationTiming>
          values={timings}
          onToggle={toggleTiming}
          options={[
            { value: "morning", label: "Morning" },
            { value: "midday", label: "Midday" },
            { value: "evening", label: "Evening" },
            { value: "night", label: "Bedtime" },
            { value: "as-needed", label: "Only if needed" },
          ]}
        />
      </Field>

      <Field label="What's it for?" hint="in plain English">
        <input
          value={purpose}
          onChange={(event) => setPurpose(event.target.value)}
          placeholder="Keeps blood sugar steady"
          className={inputClass}
        />
      </Field>

      <SubmitRow
        label="Add medicine"
        disabled={name.trim() === "" || dosage.trim() === "" || timings.length === 0}
      />
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* Appointment                                                                 */
/* -------------------------------------------------------------------------- */

function AppointmentForm() {
  const { people, addAppointment, closeSetup } = useCare();
  const [title, setTitle] = useState("");
  const [clinician, setClinician] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [escortId, setEscortId] = useState<string | null>(people[0]?.id ?? null);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const when = date === "" ? new Date() : new Date(`${date}T${time}`);

    addAppointment({
      id: `appt-${Date.now()}`,
      title: title.trim(),
      clinician: clinician.trim(),
      location: location.trim(),
      startsAt: when.toISOString(),
      dateLabel: when.toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      timeLabel: formatTime(time),
      escortId,
      notes: null,
      transport:
        escortId === null
          ? null
          : `${people.find((p) => p.id === escortId)?.fullName.split(" ")[0]} taking her`,
    });
    closeSetup();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="What's the appointment?">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Physiotherapy — session 5"
          className={inputClass}
          autoFocus
        />
      </Field>

      <Field label="Who's she seeing?">
        <input
          value={clinician}
          onChange={(event) => setClinician(event.target.value)}
          placeholder="Nadia Hassan, Physiotherapist"
          className={inputClass}
        />
      </Field>

      <Field label="Where?">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Rowan Community Clinic"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Date">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Who's taking her?">
        <PersonPicker people={people} value={escortId} onChange={setEscortId} />
      </Field>

      <SubmitRow label="Add appointment" disabled={title.trim() === "" || date === ""} />
    </form>
  );
}

/* -------------------------------------------------------------------------- */

/** "14:30" -> "2:30pm". Keeps display formatting out of the data layer. */
function formatTime(value: string): string {
  const [hourPart, minutePart] = value.split(":");
  const hour = Number(hourPart);
  const suffix = hour < 12 ? "am" : "pm";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${minutePart}${suffix}`;
}

function describeTimings(timings: MedicationTiming[]): string {
  if (timings.length === 0) return "As directed";
  if (timings.includes("as-needed") && timings.length === 1) return "Only when needed";

  const words: Record<MedicationTiming, string> = {
    morning: "morning",
    midday: "midday",
    evening: "evening",
    night: "bedtime",
    "as-needed": "as needed",
  };

  const parts = timings.map((timing) => words[timing]);
  if (parts.length === 1) return `Every ${parts[0]}`;

  return `Every ${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
