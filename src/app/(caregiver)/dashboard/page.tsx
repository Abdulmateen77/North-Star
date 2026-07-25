import {
  ArrowRight,
  CalendarPlus,
  Check,
  Clock,
  ListPlus,
  MapPin,
  Pill,
  Sparkles,
  Upload,
} from "lucide-react";
import Link from "next/link";

import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Sparkline } from "@/components/ui/Sparkline";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import {
  findPerson,
  getAppointments,
  getCareReceiver,
  getCareTasks,
  getCurrentUser,
  getHealthMetrics,
  getInsights,
  getTodaysDoses,
} from "@/data";
import type { DoseStatus, HealthMetric, MedicationDose } from "@/data/types";

export default async function DashboardPage() {
  const [user, receiver, doses, tasks, insights, appointments, metrics] = await Promise.all([
    getCurrentUser(),
    getCareReceiver(),
    getTodaysDoses(),
    getCareTasks(),
    getInsights(),
    getAppointments(),
    getHealthMetrics(),
  ]);

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const priorities = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const attention = insights.find((i) => i.tone === "attention");
  const nextAppointment = appointments[0];
  const firstName = user.fullName.split(" ")[0];
  const receiverFirstName = receiver.fullName.split(" ")[0];

  return (
    <PageBody>
      <PageHeader
        eyebrow="Saturday, 25 July"
        title={`Good morning, ${firstName}`}
        description={`${receiverFirstName} had a settled night. Here's where things stand today.`}
        action={
          <ButtonLink href="/documents">
            <Upload size={16} />
            Upload a document
          </ButtonLink>
        }
      />

      {/* --- Quick actions ---------------------------------------------------- */}
      <div className="no-scrollbar animate-fade-up mt-7 flex gap-2.5 overflow-x-auto pb-1">
        <QuickAction href="/assistant" icon={<Sparkles size={15} />} label="Ask the assistant" />
        <QuickAction href="/care" icon={<ListPlus size={15} />} label="Assign a task" />
        <QuickAction href="/care" icon={<CalendarPlus size={15} />} label="Add appointment" />
        <QuickAction href="/care" icon={<Pill size={15} />} label="Manage medicines" />
      </div>

      {/* --- Today at a glance ------------------------------------------------ */}
      <div className="stagger mt-5 grid gap-5 lg:grid-cols-3">
        <Card className="p-6 sm:p-7 lg:col-span-2">
          <CardHeader
            title={`${receiverFirstName}'s day`}
            subtitle="Medicines, movement and how the routine is holding"
            action={
              <Badge tone="sage">
                <span className="size-1.5 rounded-full bg-sage-500" />
                On track
              </Badge>
            }
          />

          <div className="mt-6 flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
            <ProgressRing value={takenCount / doses.length} size={132}>
              <div>
                <p className="font-display text-3xl leading-none font-semibold text-ink-900">
                  {takenCount}
                  <span className="text-ink-400">/{doses.length}</span>
                </p>
                <p className="mt-1 text-xs text-ink-600">doses today</p>
              </div>
            </ProgressRing>

            <div className="w-full min-w-0 flex-1">
              <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
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

        {/* --- AI daily briefing ---------------------------------------------- */}
        <Card tone="plum" className="flex flex-col p-6 sm:p-7">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-2xl bg-plum-100 text-plum-500">
              <StarMark size={17} />
            </span>
            <div>
              <p className="text-sm font-medium text-ink-900">Your daily briefing</p>
              <p className="text-xs text-ink-400">Prepared at 8:30am</p>
            </div>
          </div>

          <p className="mt-5 flex-1 leading-relaxed text-pretty text-ink-800">
            {receiverFirstName} took her morning medicines on time and did her physio set.
            Two things need you today: the six-week orthopaedic follow-up still needs booking,
            and her Ramipril is down to nine days.
          </p>

          <Link
            href="/assistant"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-plum-500 transition hover:text-plum-400"
          >
            Ask a follow-up
            <ArrowRight size={15} />
          </Link>
        </Card>
      </div>

      {/* --- Priorities + what's next ----------------------------------------- */}
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
              const assignee = findPerson(task.assigneeId);
              return (
                <li
                  key={task.id}
                  className="flex items-start gap-3.5 rounded-card border border-sand-300/50 bg-cream-50/70 p-4 transition duration-300 hover:border-sand-400/70 hover:bg-cream-50"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border-2",
                      task.status === "in-progress"
                        ? "border-clay-500 bg-clay-100"
                        : "border-sand-400",
                    )}
                  >
                    {task.status === "in-progress" ? (
                      <span className="size-1.5 rounded-full bg-clay-500" />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink-900">{task.title}</p>
                      {task.generatedByAi ? (
                        <Badge tone="plum">
                          <StarMark size={10} />
                          AI
                        </Badge>
                      ) : null}
                    </div>
                    {task.detail ? (
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">{task.detail}</p>
                    ) : null}
                    <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                      <Badge tone={task.priority === "high" ? "rose" : "neutral"}>
                        <Clock size={11} />
                        {task.dueLabel}
                      </Badge>
                      {assignee ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-ink-600">
                          <Avatar
                            initials={assignee.initials}
                            accent={assignee.accent}
                            size="xs"
                          />
                          {assignee.fullName.split(" ")[0]}
                        </span>
                      ) : (
                        <span className="text-xs text-ink-400">Unassigned</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-5">
          {nextAppointment ? (
            <Card tone="sand" className="p-6">
              <p className="text-xs font-medium tracking-wide text-ink-400 uppercase">
                Next appointment
              </p>
              <h3 className="mt-2 text-lg text-ink-900">{nextAppointment.title}</h3>
              <p className="mt-1 text-sm text-ink-600">{nextAppointment.clinician}</p>

              <div className="mt-4 space-y-2 text-sm text-ink-600">
                <p className="flex items-center gap-2">
                  <Clock size={14} className="text-ink-400" />
                  {nextAppointment.dateLabel} · {nextAppointment.timeLabel}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-ink-400" />
                  {nextAppointment.location}
                </p>
              </div>

              {nextAppointment.transport ? (
                <p className="mt-4 rounded-2xl bg-white/70 px-3.5 py-2.5 text-xs text-ink-600">
                  {nextAppointment.transport}
                </p>
              ) : null}
            </Card>
          ) : null}

          {attention ? (
            <Card tone="clay" className="p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium tracking-wide text-clay-600 uppercase">
                  Needs attention
                </p>
                <span className="font-display text-2xl leading-none font-semibold text-clay-700">
                  {attention.metric}
                </span>
              </div>
              <h3 className="mt-2.5 text-lg text-ink-900">{attention.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{attention.body}</p>
            </Card>
          ) : null}
        </div>
      </div>

      {/* --- Health signals ---------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl text-ink-900">How {receiverFirstName} is doing</h2>
        <p className="mt-1.5 text-sm text-ink-600">Trends over the last two weeks.</p>

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

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-sand-300/70 bg-white px-4 py-2.5 text-sm font-medium text-ink-800 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:border-clay-300 hover:text-clay-700"
    >
      <span className="text-clay-500">{icon}</span>
      {label}
    </Link>
  );
}

const doseStyles: Record<DoseStatus, { dot: string; label: string; tone: string }> = {
  taken: { dot: "bg-sage-500", label: "Taken", tone: "text-sage-600" },
  due: { dot: "bg-clay-500 animate-breathe", label: "Due now", tone: "text-clay-600" },
  upcoming: { dot: "bg-sand-400", label: "Later", tone: "text-ink-400" },
  missed: { dot: "bg-rose-500", label: "Missed", tone: "text-rose-500" },
  skipped: { dot: "bg-sand-400", label: "Skipped", tone: "text-ink-400" },
};

function DoseRow({ dose }: { dose: MedicationDose }) {
  const style = doseStyles[dose.status];

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition",
        dose.status === "due" ? "bg-clay-50 ring-1 ring-clay-100" : "bg-cream-100/70",
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", style.dot)} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink-900">
          {dose.medicationName}{" "}
          <span className="font-normal text-ink-400">{dose.dosage}</span>
        </p>
      </div>
      <span className="shrink-0 text-xs text-ink-400">{dose.scheduledFor}</span>
      <span className={cn("flex shrink-0 items-center gap-1 text-xs font-medium", style.tone)}>
        {dose.status === "taken" ? <Check size={12} /> : null}
        {style.label}
      </span>
    </li>
  );
}

const metricTone = {
  positive: "text-sage-500",
  attention: "text-clay-500",
  neutral: "text-plum-400",
} as const;

function MetricCard({ metric }: { metric: HealthMetric }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-600">{metric.label}</p>
      <p className="mt-2 font-display text-2xl leading-none font-semibold text-ink-900">
        {metric.value}
        {metric.unit ? (
          <span className="ml-1 text-sm font-normal text-ink-400">{metric.unit}</span>
        ) : null}
      </p>
      <div className={cn("mt-3", metricTone[metric.tone])}>
        <Sparkline series={metric.series} width={140} height={34} />
      </div>
      <p className="mt-2 text-xs text-ink-400">{metric.trendLabel}</p>
    </Card>
  );
}
