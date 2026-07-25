import { ArrowRight, HeartHandshake, Sparkles } from "lucide-react";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import { Logo, StarMark } from "@/components/ui/Logo";

/**
 * Entry point. Two doors — caregiver and care receiver — because the two
 * experiences are genuinely different products sharing one care space.
 */
export default function HomePage() {
  return (
    <main className="relative min-h-dvh overflow-hidden">
      {/* Soft organic wash + drifting shapes set the tone before any copy lands. */}
      <div className="aurora pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="animate-float absolute -top-24 -left-24 size-[26rem] rounded-full bg-clay-100/50 blur-3xl" />
        <div
          className="animate-float absolute top-1/3 -right-32 size-[30rem] rounded-full bg-sage-100/50 blur-3xl"
          style={{ animationDelay: "1.8s" }}
        />
        <div
          className="animate-float absolute -bottom-32 left-1/4 size-[24rem] rounded-full bg-gold-100/50 blur-3xl"
          style={{ animationDelay: "3.4s" }}
        />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-7">
        <Logo />
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-600 transition hover:text-ink-900"
        >
          Sign in
        </Link>
      </header>

      <div className="mx-auto w-full max-w-6xl px-6 pb-24">
        <section className="animate-fade-up pt-10 pb-16 text-center sm:pt-20">
          <span className="inline-flex items-center gap-2 rounded-pill border border-gold-100 bg-gold-50/80 px-3.5 py-1.5 text-xs font-medium text-ink-600 backdrop-blur">
            <StarMark size={13} className="text-gold-500" />
            For families caring for someone they love
          </span>

          <h1 className="mx-auto mt-7 max-w-3xl text-[2.6rem] leading-[1.06] font-semibold text-balance text-ink-900 sm:text-6xl">
            Healthcare can feel overwhelming.
            <span className="mt-2 block text-clay-600">
              North Star helps families find their way.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-600">
            Upload a hospital letter and we turn it into a plan — the appointments to book,
            the medicines that changed, and who in the family is doing what.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard" size="lg">
              Open the care dashboard
              <ArrowRight size={17} />
            </ButtonLink>
            <ButtonLink href="/patient" variant="outline" size="lg">
              I&apos;m the one being cared for
            </ButtonLink>
          </div>
        </section>

        <section
          className="animate-fade-up grid gap-5 sm:grid-cols-2"
          style={{ animationDelay: "0.12s" }}
        >
          <RoleDoor
            href="/dashboard"
            icon={<HeartHandshake size={22} />}
            eyebrow="For the caregiver"
            title="Hold everything in one place"
            body="Daily priorities, medicines, appointments and documents — with the rest of the family kept in the loop automatically."
            tone="clay"
          />
          <RoleDoor
            href="/patient"
            icon={<Sparkles size={22} />}
            eyebrow="For your loved one"
            title="Just today, made simple"
            body="A gentle checklist, large friendly type, and one tap to reach family whenever they need to."
            tone="sage"
          />
        </section>
      </div>
    </main>
  );
}

function RoleDoor({
  href,
  icon,
  eyebrow,
  title,
  body,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  tone: "clay" | "sage";
}) {
  const toneMap = {
    clay: { chip: "bg-clay-100 text-clay-700", ring: "hover:border-clay-300/70" },
    sage: { chip: "bg-sage-100 text-sage-600", ring: "hover:border-sage-300/70" },
  }[tone];

  return (
    <Link
      href={href}
      className={`group rounded-panel border border-sand-300/60 bg-white/70 p-8 shadow-soft backdrop-blur transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-lift ${toneMap.ring}`}
    >
      <span className={`grid size-12 place-items-center rounded-2xl ${toneMap.chip}`}>{icon}</span>
      <p className="mt-6 text-xs font-medium tracking-wide text-ink-400 uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl text-ink-900">{title}</h2>
      <p className="mt-3 leading-relaxed text-pretty text-ink-600">{body}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-clay-600">
        Continue
        <ArrowRight
          size={15}
          className="transition-transform duration-300 group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}
