import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { DashboardPanels } from "@/components/caregiver/DashboardPanels";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Emphasis } from "@/components/ui/Emphasis";
import { StarMark } from "@/components/ui/Logo";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { cn } from "@/components/ui/cn";
import { getCareReceiver, getCurrentUser, getInsights, getTodaysDoses } from "@/data";
import type { DoseStatus, MedicationDose } from "@/data/types";

/**
 * The dashboard answers one question: what does today need from me?
 *
 * Trends and weekly patterns deliberately live on Insights instead — they were
 * duplicated here, which was a third of the page's height and the main reason
 * it scrolled. Everything here fits the width rather than stacking into bands.
 */
export default async function DashboardPage() {
  const [user, receiver, doses, insights] = await Promise.all([
    getCurrentUser(),
    getCareReceiver(),
    getTodaysDoses(),
    getInsights(),
  ]);

  const takenCount = doses.filter((dose) => dose.status === "taken").length;
  const attention = insights.find((insight) => insight.tone === "attention");
  const firstName = user.fullName.split(" ")[0];
  const receiverFirstName = receiver.fullName.split(" ")[0];

  return (
    <PageBody>
      <PageHeader
        eyebrow="Saturday, 25 July"
        title={
          <>
            Good morning, <Emphasis>{firstName}</Emphasis>
          </>
        }
      />

      {/* --- Briefing + what needs attention, side by side ------------------- */}
      <div className="stagger mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card
          as="section"
          className="mesh-ignite overflow-hidden border-0 p-6 sm:p-7 lg:col-span-2"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-gold-400 text-olive-900">
              <StarMark size={17} />
            </span>
            <div>
              <p className="text-sm font-semibold text-bone-50">Your daily briefing</p>
              <p className="text-xs text-bone-300">Prepared at 8:30am</p>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-pretty text-bone-50">
            {`Good news — ${receiverFirstName} had a settled morning, took her medicines on time and got through her physio set without any trouble. Whenever you have a moment, it'd help to book her six-week follow-up and reorder her Ramipril — but there's no rush.`}
          </p>

          <Link
            href="/assistant"
            className="mt-6 inline-flex items-center gap-2 rounded-pill bg-bone-50 px-5 py-2.5 text-sm font-semibold text-olive-900 transition duration-200 hover:bg-white"
          >
            Ask a follow-up
            <ArrowRight size={15} />
          </Link>
        </Card>

        {attention !== undefined ? (
          <Card tone="clay" className="p-6">
            <div className="flex items-start justify-between gap-4">
              <p className="text-xs font-medium tracking-wide text-clay-600 uppercase">
                Needs attention
              </p>
              <span className="text-2xl leading-none font-bold text-clay-700">
                {attention.metric}
              </span>
            </div>
            <h3 className="mt-2.5 text-lg text-olive-900">{attention.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-olive-600">{attention.body}</p>
          </Card>
        ) : null}
      </div>

      {/* --- Her day + today's priorities ------------------------------------ */}
      <div className="stagger mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <CardHeader
            title={`${receiverFirstName}'s day`}
            action={
              <Badge tone="olive">
                <span className="size-1.5 rounded-full bg-olive-500" />
                On track
              </Badge>
            }
          />

          {/* Stacked on narrow screens — side by side once there's room for
              both the ring and full, unabbreviated medicine names. */}
          <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
            <ProgressRing value={takenCount / doses.length} size={104} stroke={9}>
              <div>
                <p className="text-2xl leading-none font-bold text-olive-900">
                  {takenCount}
                  <span className="text-olive-400">/{doses.length}</span>
                </p>
                <p className="mt-0.5 text-xs text-olive-600">doses</p>
              </div>
            </ProgressRing>

            <ul className="w-full min-w-0 flex-1 space-y-1.5 sm:w-auto">
              {doses.map((dose) => (
                <DoseRow key={dose.id} dose={dose} />
              ))}
            </ul>
          </div>
        </Card>

        <DashboardPanels />
      </div>
    </PageBody>
  );
}

/* -------------------------------------------------------------------------- */

const doseStyles: Record<DoseStatus, { dot: string; label: string; tone: string }> = {
  taken: { dot: "bg-olive-500", label: "Taken", tone: "text-olive-700" },
  due: { dot: "bg-clay-500 animate-breathe", label: "Due now", tone: "text-clay-600" },
  upcoming: { dot: "bg-bone-400", label: "Later", tone: "text-olive-400" },
  missed: { dot: "bg-rose-500", label: "Missed", tone: "text-rose-500" },
  skipped: { dot: "bg-bone-400", label: "Skipped", tone: "text-olive-400" },
};

function DoseRow({ dose }: { dose: MedicationDose }) {
  const style = doseStyles[dose.status];

  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-3 py-2 transition",
        dose.status === "due" ? "bg-clay-50 ring-1 ring-clay-100" : "bg-bone-100/70",
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} />
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-olive-900">
        {dose.medicationName}
      </p>
      <span className="shrink-0 text-xs text-olive-400">{dose.scheduledFor}</span>
      <span className={cn("flex shrink-0 items-center gap-1 text-xs font-medium", style.tone)}>
        {dose.status === "taken" ? <Check size={12} /> : null}
        {style.label}
      </span>
    </li>
  );
}
