import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { DashboardPanels } from "@/components/caregiver/DashboardPanels";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { SetupActions } from "@/components/caregiver/SetupButton";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader } from "@/components/ui/Card";
import { Emphasis } from "@/components/ui/Emphasis";
import { StarMark } from "@/components/ui/Logo";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Sparkline } from "@/components/ui/Sparkline";
import { cn } from "@/components/ui/cn";
import {
  getCareReceiver,
  getCurrentUser,
  getHealthMetrics,
  getInsights,
  getTodaysDoses,
} from "@/data";
import type { DoseStatus, HealthMetric, MedicationDose } from "@/data/types";

export default async function DashboardPage() {
  const [user, receiver, doses, insights, metrics] = await Promise.all([
    getCurrentUser(),
    getCareReceiver(),
    getTodaysDoses(),
    getInsights(),
    getHealthMetrics(),
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
        description={`${receiverFirstName} had a settled night. Here's where things stand today.`}
      />

      {/* --- The briefing. The brand's loudest surface, and the first thing a
              caregiver should read. ------------------------------------------ */}
      <Card
        as="section"
        className="mesh-ignite animate-fade-up mt-8 overflow-hidden border-0 p-7 sm:p-9"
      >
        {/* The mesh runs dark, so everything on it is set in bone. */}
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-gold-400 text-olive-900">
            <StarMark size={17} />
          </span>
          <div>
            <p className="text-sm font-semibold text-bone-50">Your daily briefing</p>
            <p className="text-xs text-bone-300">Prepared at 8:30am</p>
          </div>
        </div>

        <p className="mt-6 max-w-3xl text-xl leading-relaxed text-pretty text-bone-50 sm:text-2xl">
          {receiverFirstName} took her morning medicines on time and did her physio set.
          Two things need you today: the six-week orthopaedic follow-up still needs booking,
          and her Ramipril is down to nine days.
        </p>

        <Link
          href="/assistant"
          className="mt-7 inline-flex items-center gap-2 rounded-pill bg-bone-50 px-5 py-3 text-sm font-semibold text-olive-900 transition duration-200 hover:bg-white"
        >
          Ask a follow-up
          <ArrowRight size={15} />
        </Link>
      </Card>

      {/* --- Setting things up ------------------------------------------------ */}
      <section className="animate-fade-up mt-8">
        <h2 className="text-lg text-olive-900">Set something up for {receiverFirstName}</h2>
        <p className="mt-1 text-sm text-olive-600">
          It appears on her app straight away, and on the family&apos;s list.
        </p>
        <div className="mt-4">
          <SetupActions />
        </div>
      </section>

      {/* --- Her day ---------------------------------------------------------- */}
      <div className="stagger mt-8 grid gap-5 lg:grid-cols-3">
        <Card className="p-6 sm:p-7 lg:col-span-2">
          <CardHeader
            title={`${receiverFirstName}'s day`}
            subtitle="Medicines, movement and how the routine is holding"
            action={
              <Badge tone="olive">
                <span className="size-1.5 rounded-full bg-olive-500" />
                On track
              </Badge>
            }
          />

          <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
            <ProgressRing value={takenCount / doses.length} size={132}>
              <div>
                <p className="text-3xl leading-none font-bold text-olive-900">
                  {takenCount}
                  <span className="text-olive-400">/{doses.length}</span>
                </p>
                <p className="mt-1 text-xs text-olive-600">doses today</p>
              </div>
            </ProgressRing>

            <div className="w-full min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-olive-400 uppercase">
                Today&apos;s schedule
              </p>
              <ul className="mt-3 space-y-2">
                {doses.map((dose) => (
                  <DoseRow key={dose.id} dose={dose} />
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {attention !== undefined ? (
          <Card tone="clay" className="h-fit p-6">
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

      {/* --- Priorities + next appointment, live from the care store ---------- */}
      <DashboardPanels />

      {/* --- Health signals --------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl text-olive-900">How {receiverFirstName} is doing</h2>
        <p className="mt-1.5 text-sm text-olive-600">Trends over the last two weeks.</p>

        <div className="stagger mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>
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
        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition",
        dose.status === "due" ? "bg-clay-50 ring-1 ring-clay-100" : "bg-bone-100/70",
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-olive-900">
          {dose.medicationName}{" "}
          <span className="font-normal text-olive-400">{dose.dosage}</span>
        </p>
      </div>
      <span className="shrink-0 text-xs text-olive-400">{dose.scheduledFor}</span>
      <span className={cn("flex shrink-0 items-center gap-1 text-xs font-medium", style.tone)}>
        {dose.status === "taken" ? <Check size={12} /> : null}
        {style.label}
      </span>
    </li>
  );
}

const metricTone = {
  positive: "text-olive-500",
  attention: "text-clay-500",
  neutral: "text-peach-400",
} as const;

function MetricCard({ metric }: { metric: HealthMetric }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-olive-600">{metric.label}</p>
      <p className="mt-2 text-2xl leading-none font-bold text-olive-900">
        {metric.value}
        {metric.unit !== null ? (
          <span className="ml-1 text-sm font-normal text-olive-400">{metric.unit}</span>
        ) : null}
      </p>
      <div className={cn("mt-3", metricTone[metric.tone])}>
        <Sparkline series={metric.series} width={140} height={34} />
      </div>
      <p className="mt-2 text-xs text-olive-400">{metric.trendLabel}</p>
    </Card>
  );
}
