"use client";

import { ArrowRight, ListPlus, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CarePerson, CareReceiver } from "@/data/types";

const STORAGE_KEY = "north-star:onboarded-caregiver";

interface Step {
  icon: typeof Users;
  eyebrow: string;
  title: string;
  body: string;
}

/**
 * A three-step, skippable welcome shown once per browser before the caregiver
 * meets the dashboard proper. There's no real account system yet — this is a
 * scripted orientation, not auth — so it's gated by localStorage rather than
 * a server-side "has this user onboarded" flag.
 *
 * Deliberately caregiver-only: the patient app is optimised for the fewest
 * possible taps, and a forced intro sequence would cut directly against that.
 */
export function Onboarding({
  user,
  receiver,
  caregivers,
}: {
  user: CarePerson;
  receiver: CareReceiver;
  caregivers: CarePerson[];
}) {
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = window.localStorage.getItem(STORAGE_KEY) === "1";
    setOpen(!seen);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") finish();
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function finish() {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!checked || !open) return null;

  const firstName = user.fullName.split(" ")[0];
  const receiverFirstName = receiver.fullName.split(" ")[0];
  const others = caregivers.filter((person) => person.id !== user.id);
  const otherNames = others.map((person) => person.fullName.split(" ")[0]);

  const steps: Step[] = [
    {
      icon: Users,
      eyebrow: `Welcome, ${firstName}`,
      title: `You're looking after ${receiverFirstName}, together`,
      body:
        otherNames.length > 0
          ? `You, ${otherNames.join(" and ")} share one picture of ${receiverFirstName}'s care — everyone sees the same tasks, medicines and updates, kept in sync automatically.`
          : `Everything you and the rest of the family do for ${receiverFirstName} lives in one place, kept in sync automatically.`,
    },
    {
      icon: Sparkles,
      eyebrow: "Every morning",
      title: "Start with the daily briefing",
      body: `North Star reads what's changed overnight and tells you in plain English — what's going well, and the one or two things worth a moment of your time. Never a wall of data.`,
    },
    {
      icon: ListPlus,
      eyebrow: "Setting things up",
      title: "One button adds anything",
      body: `Add a task, a reminder, a medicine or an appointment from the same place, every time. The moment you add it, it appears on ${receiverFirstName}'s own app too.`,
    },
  ];

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Skip onboarding"
        onClick={finish}
        className="animate-fade-in absolute inset-0 bg-olive-900/35 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={current.title}
        className="animate-rise relative flex w-full max-w-lg flex-col overflow-hidden rounded-t-panel bg-bone-50 shadow-deep sm:rounded-panel"
      >
        <div className="mesh-ignite relative shrink-0 px-7 pt-9 pb-8 sm:px-9">
          <span className="grid size-12 place-items-center rounded-2xl bg-gold-400 text-olive-900">
            <Icon size={22} />
          </span>

          <p className="mt-5 text-xs font-medium tracking-wide text-bone-300 uppercase">
            {current.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl leading-tight font-bold tracking-tight text-bone-50 sm:text-[1.75rem]">
            {current.title}
          </h2>
          <p className="mt-3 leading-relaxed text-pretty text-bone-200">{current.body}</p>

          {step === 0 ? (
            <div className="mt-6 flex -space-x-2">
              <Avatar
                initials={receiver.initials}
                accent={receiver.accent}
                size="md"
                className="ring-2 ring-olive-900"
              />
              {others.map((person) => (
                <Avatar
                  key={person.id}
                  initials={person.initials}
                  accent={person.accent}
                  size="md"
                  className="ring-2 ring-olive-900"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 px-7 py-6 sm:px-9">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {steps.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "h-1.5 rounded-pill transition-all duration-300",
                  index === step ? "w-6 bg-clay-500" : "w-1.5 bg-bone-300",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-4">
            {!isLast ? (
              <button
                type="button"
                onClick={finish}
                className="text-sm font-medium text-olive-500 transition hover:text-olive-800"
              >
                Skip
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStep((current) => current + 1))}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-clay-500 px-5 text-sm font-semibold text-white transition duration-200 hover:bg-clay-600 active:scale-[0.98]"
            >
              {isLast ? "Get started" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
