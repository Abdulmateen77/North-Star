import { ArrowLeft, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { cn } from "@/components/ui/cn";
import { getCareReceiver, getEmergencyContacts } from "@/data";

export default async function PatientEmergencyPage() {
  const [contacts, receiver] = await Promise.all([
    getEmergencyContacts(),
    getCareReceiver(),
  ]);

  const primary = contacts.find((contact) => contact.primary) ?? contacts[0] ?? null;
  const others = primary === null ? contacts : contacts.filter((contact) => contact.id !== primary.id);

  return (
    <>
      <Link
        href="/patient"
        className="animate-fade-up inline-flex items-center gap-2 text-olive-600 transition hover:text-olive-900"
      >
        <ArrowLeft size={18} />
        Back to today
      </Link>

      <h1 className="animate-fade-up mt-5 text-3xl leading-tight text-olive-900">
        Getting help
      </h1>
      <p className="animate-fade-up mt-2 leading-relaxed text-olive-600">
        If something feels wrong, call someone. It&apos;s never a bother.
      </p>

      {/* --- 999 -------------------------------------------------------------- */}
      <a
        href="tel:999"
        className="animate-fade-up mt-7 flex items-center gap-4 rounded-panel border border-rose-100 bg-rose-50 p-6 transition duration-200 hover:bg-rose-100 active:scale-[0.99]"
      >
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-rose-500 text-white">
          <ShieldAlert size={26} />
        </span>
        <span className="min-w-0">
          <span className="block text-2xl leading-tight font-semibold text-rose-500">
            Call 999
          </span>
          <span className="mt-0.5 block leading-relaxed text-olive-600">
            If you&apos;ve fallen, can&apos;t breathe, or have chest pain
          </span>
        </span>
      </a>

      {/* --- Primary contact --------------------------------------------------- */}
      <section className="animate-fade-up mt-7">
        <h2 className="px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          Call your family
        </h2>

        {primary === null ? (
          <p className="mt-3 rounded-panel border border-dashed border-bone-300 bg-white p-6 text-olive-500">
            No family emergency contact has been saved yet.
          </p>
        ) : (
          <a
            href={`tel:${primary.phone.replace(/\s/g, "")}`}
            className="mt-3 flex items-center gap-4 rounded-panel border border-clay-100 bg-clay-500 p-6 text-white shadow-lift transition duration-200 hover:bg-clay-600 active:scale-[0.99]"
          >
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20">
              <Phone size={26} />
            </span>
            <span className="min-w-0">
              <span className="block text-2xl leading-tight font-semibold">{primary.name}</span>
              <span className="mt-0.5 block text-clay-50">
                {primary.relationship} · {primary.phone}
              </span>
            </span>
          </a>
        )}

        <ul className="mt-3 space-y-3">
          {others.map((contact) => (
            <li key={contact.id}>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-panel border border-bone-300/60 bg-white p-5 shadow-soft transition duration-200 hover:border-clay-300 active:scale-[0.99]"
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-2xl",
                    contact.relationship === "GP practice"
                      ? "bg-olive-100 text-olive-700"
                      : contact.relationship.includes("advice")
                        ? "bg-gold-100 text-gold-500"
                        : "bg-clay-50 text-clay-500",
                  )}
                >
                  <Phone size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg leading-snug font-medium text-olive-900">
                    {contact.name}
                  </span>
                  <span className="block text-sm text-olive-600">
                    {contact.relationship} · {contact.phone}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Medical profile ---------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          Show this to a paramedic
        </h2>

        <dl className="mt-3 divide-y divide-bone-300/60 rounded-panel border border-bone-300/60 bg-white px-5 shadow-soft">
          <Row label="Name" value={receiver.fullName} />
          {receiver.age > 0 ? <Row label="Age" value={String(receiver.age)} /> : null}
          <Row
            label="Conditions"
            value={receiver.conditions.length > 0 ? receiver.conditions.join(", ") : "Not saved"}
          />
          <Row
            label="Allergies"
            value={receiver.allergies.length > 0 ? receiver.allergies.join(", ") : "Not saved"}
            highlight={receiver.allergies.length > 0}
          />
          {receiver.bloodType !== null ? (
            <Row label="Blood type" value={receiver.bloodType} />
          ) : null}
          {receiver.nhsNumber !== null ? (
            <Row label="NHS number" value={receiver.nhsNumber} />
          ) : null}
        </dl>
      </section>
    </>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <dt className="shrink-0 text-olive-400">{label}</dt>
      <dd
        className={cn(
          "text-right font-medium",
          highlight ? "text-rose-500" : "text-olive-900",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
