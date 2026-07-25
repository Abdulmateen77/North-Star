import { AlarmClock, Check, Droplets, Footprints, Pill, Stethoscope } from "lucide-react";

import { cn } from "@/components/ui/cn";
import { getReminders } from "@/data";
import type { ReminderKind } from "@/data/types";

const kindConfig: Record<ReminderKind, { icon: typeof AlarmClock; chip: string }> = {
  medication: { icon: Pill, chip: "bg-clay-100 text-clay-600" },
  appointment: { icon: Stethoscope, chip: "bg-sage-100 text-sage-600" },
  hydration: { icon: Droplets, chip: "bg-plum-100 text-plum-500" },
  movement: { icon: Footprints, chip: "bg-gold-100 text-gold-500" },
  custom: { icon: AlarmClock, chip: "bg-cream-200 text-ink-600" },
};

export default async function PatientRemindersPage() {
  const reminders = await getReminders();
  const active = reminders.filter((r) => r.enabled);
  const paused = reminders.filter((r) => !r.enabled);

  return (
    <>
      <h1 className="animate-fade-up text-3xl leading-tight text-ink-900">Your reminders</h1>
      <p className="animate-fade-up mt-2 leading-relaxed text-ink-600">
        These are the nudges North Star sends you through the day.
      </p>

      <ul className="animate-fade-up mt-7 space-y-3">
        {active.map((reminder) => {
          const config = kindConfig[reminder.kind];
          const Icon = config.icon;

          return (
            <li
              key={reminder.id}
              className="flex items-center gap-4 rounded-panel border border-sand-300/60 bg-white p-5 shadow-soft"
            >
              <span
                className={cn("grid size-12 shrink-0 place-items-center rounded-2xl", config.chip)}
              >
                <Icon size={22} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-lg leading-snug font-medium text-ink-900">{reminder.title}</p>
                <p className="mt-0.5 text-sm text-ink-600">
                  {reminder.timeLabel} · {reminder.repeatLabel}
                </p>
                {reminder.lastConfirmed !== null ? (
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-sage-600">
                    <Check size={14} strokeWidth={3} />
                    Done {reminder.lastConfirmed.toLowerCase()}
                  </p>
                ) : (
                  <p className="mt-1.5 text-sm text-ink-400">Not due yet</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {paused.length > 0 ? (
        <section className="mt-8">
          <h2 className="px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
            Paused
          </h2>
          <ul className="mt-3 space-y-3">
            {paused.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center gap-4 rounded-panel border border-sand-300/50 bg-cream-200/50 p-5"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/60 text-ink-400">
                  <AlarmClock size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-snug font-medium text-ink-600">
                    {reminder.title}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-400">
                    {reminder.timeLabel} · {reminder.repeatLabel}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
