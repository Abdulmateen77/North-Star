import { AlertCircle, ArrowRight, Minus, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Sparkline } from "@/components/ui/Sparkline";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { getHealthMetrics, getInsights } from "@/data";
import type { Insight, InsightTone, TrendDirection } from "@/data/types";

const toneStyles: Record<
  InsightTone,
  { card: string; chip: string; metric: string; label: string }
> = {
  positive: {
    card: "bg-olive-50 border-olive-100",
    chip: "bg-olive-100 text-olive-700",
    metric: "text-olive-700",
    label: "Going well",
  },
  attention: {
    card: "bg-clay-50 border-clay-100",
    chip: "bg-clay-100 text-clay-700",
    metric: "text-clay-700",
    label: "Worth a look",
  },
  neutral: {
    card: "bg-white border-bone-300/60",
    chip: "bg-bone-200 text-olive-600",
    metric: "text-olive-900",
    label: "Noted",
  },
};

const trendIcons: Record<TrendDirection, typeof TrendingUp> = {
  up: TrendingUp,
  down: TrendingDown,
  steady: Minus,
};

export default async function InsightsPage() {
  const [insights, metrics] = await Promise.all([getInsights(), getHealthMetrics()]);

  const attention = insights.filter((i) => i.tone === "attention");
  const rest = insights.filter((i) => i.tone !== "attention");

  return (
    <PageBody>
      <PageHeader
        eyebrow="Insights & alerts"
        title="What's changed this week"
        description="Patterns North Star noticed across Margaret's medicines, appointments and readings."
      />

      {/* --- Weekly summary --------------------------------------------------- */}
      <Card tone="ai" className="animate-fade-up mt-8 p-6 sm:p-8">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-2xl bg-gold-100 text-gold-500">
            <StarMark size={17} />
          </span>
          <div>
            <p className="text-sm font-medium text-olive-900">This week in summary</p>
            <p className="text-xs text-olive-400">19–25 July</p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-olive-800">
          Margaret has had a good week. Her blood tests came back better than April&apos;s, her
          blood pressure has settled since the Ramipril change, and David logged her walking
          to the gate without the frame — a first since the operation.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed text-pretty text-olive-600">
          Two small things for whenever suits: the six-week orthopaedic follow-up still
          needs booking, and her Ramipril is worth reordering soon.
        </p>
      </Card>

      {/* --- Needs attention -------------------------------------------------- */}
      {attention.length > 0 ? (
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl text-olive-900">
            <AlertCircle size={19} className="text-clay-500" />
            Needs attention
          </h2>
          <div className="stagger mt-4 grid gap-4 sm:grid-cols-2">
            {attention.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </section>
      ) : null}

      {/* --- Trends ----------------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl text-olive-900">Care trends</h2>
        <p className="mt-1.5 text-sm text-olive-600">Two weeks of readings, at a glance.</p>

        <div className="stagger mt-4 grid gap-4 sm:grid-cols-2">
          {metrics.map((metric) => {
            const TrendIcon = trendIcons[metric.trend];
            const tone = toneStyles[metric.tone];

            return (
              <Card key={metric.id} className="p-6">
                <CardHeader
                  title={metric.label}
                  action={
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium",
                        tone.chip,
                      )}
                    >
                      <TrendIcon size={12} />
                      {metric.trendLabel}
                    </span>
                  }
                />

                <div className="mt-5 flex items-end justify-between gap-5">
                  <p
                    className={cn(
                      "font-display text-4xl leading-none font-semibold",
                      tone.metric,
                    )}
                  >
                    {metric.value}
                    {metric.unit ? (
                      <span className="ml-1.5 text-base font-normal text-olive-400">
                        {metric.unit}
                      </span>
                    ) : null}
                  </p>
                  <div
                    className={cn(
                      metric.tone === "positive"
                        ? "text-olive-500"
                        : metric.tone === "attention"
                          ? "text-clay-500"
                          : "text-gold-500",
                    )}
                  >
                    <Sparkline series={metric.series} width={170} height={48} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* --- Everything else -------------------------------------------------- */}
      <section className="mt-10">
        <h2 className="text-xl text-olive-900">Other observations</h2>
        <div className="stagger mt-4 grid gap-4 sm:grid-cols-2">
          {rest.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </section>
    </PageBody>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const tone = toneStyles[insight.tone];

  const inner = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "rounded-pill px-2.5 py-1 text-xs font-medium",
            tone.chip,
          )}
        >
          {tone.label}
        </span>
        {insight.metric ? (
          <div className="text-right">
            <p className={cn("font-display text-2xl leading-none font-semibold", tone.metric)}>
              {insight.metric}
            </p>
            {insight.metricLabel ? (
              <p className="mt-1 text-xs text-olive-400">{insight.metricLabel}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <h3 className="mt-3.5 text-lg text-olive-900">{insight.title}</h3>
      <p className="mt-1.5 leading-relaxed text-pretty text-olive-600">{insight.body}</p>

      {insight.href ? (
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-clay-600">
          Take a look
          <ArrowRight size={14} />
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "rounded-card border p-6 shadow-soft transition duration-300",
    tone.card,
    insight.href !== null && "hover:-translate-y-0.5 hover:shadow-lift",
  );

  return insight.href !== null ? (
    <Link href={insight.href} className={cn(className, "block")}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
