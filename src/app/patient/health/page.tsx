import { CalendarDays, Clock, FileText, MapPin, Pill } from "lucide-react";

import { StarMark } from "@/components/ui/Logo";
import { getAppointments, getCareDocuments, getCareReceiver, getMedications } from "@/data";

export default async function PatientHealthPage() {
  const [appointments, medications, documents, receiver] = await Promise.all([
    getAppointments(),
    getMedications(),
    getCareDocuments(),
    getCareReceiver(),
  ]);

  return (
    <>
      <h1 className="animate-fade-up text-3xl leading-tight text-ink-900">Your health</h1>
      <p className="animate-fade-up mt-2 leading-relaxed text-ink-600">
        Your appointments, your medicines, and your letters — all in one place.
      </p>

      {/* --- Appointments ----------------------------------------------------- */}
      <section className="animate-fade-up mt-7">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
          <CalendarDays size={15} />
          Coming up
        </h2>

        <ul className="mt-3 space-y-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="rounded-panel border border-sand-300/60 bg-white p-5 shadow-soft"
            >
              <p className="text-lg leading-snug font-medium text-ink-900">{appt.title}</p>
              <p className="mt-0.5 text-sm text-ink-600">{appt.clinician}</p>

              <div className="mt-3.5 space-y-2 text-ink-600">
                <p className="flex items-center gap-2">
                  <Clock size={16} className="shrink-0 text-ink-400" />
                  {appt.dateLabel} at {appt.timeLabel}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-ink-400" />
                  {appt.location}
                </p>
              </div>

              {appt.transport !== null ? (
                <p className="mt-3.5 rounded-2xl bg-sage-50 px-4 py-3 text-sm text-sage-600">
                  {appt.transport}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* --- Medicines -------------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
          <Pill size={15} />
          Your medicines
        </h2>

        <ul className="mt-3 space-y-3">
          {medications.map((med) => (
            <li
              key={med.id}
              className="flex items-start gap-4 rounded-panel border border-sand-300/60 bg-white p-5 shadow-soft"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-clay-50 text-clay-500">
                <Pill size={20} />
              </span>
              <div className="min-w-0">
                <p className="text-lg leading-snug font-medium text-ink-900">
                  {med.name} <span className="text-base text-ink-400">{med.dosage}</span>
                </p>
                <p className="mt-0.5 text-ink-600">{med.instruction}</p>
                <p className="mt-1.5 text-sm text-ink-400">{med.purpose}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- Letters ---------------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
          <FileText size={15} />
          Your letters
        </h2>

        <ul className="mt-3 space-y-3">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="rounded-panel border border-sand-300/60 bg-cream-50 p-5"
            >
              <p className="text-lg leading-snug font-medium text-ink-900">{doc.title}</p>
              <p className="mt-0.5 text-sm text-ink-400">
                {doc.source} · {doc.dateLabel}
              </p>

              {doc.aiSummary !== null ? (
                <div className="mt-3.5 rounded-2xl border border-plum-100 bg-plum-50/60 p-4">
                  <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-plum-500 uppercase">
                    <StarMark size={12} />
                    In plain English
                  </p>
                  <p className="mt-2 leading-relaxed text-pretty text-ink-800">
                    {doc.aiSummary}
                  </p>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* --- About you -------------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="px-1 text-sm font-medium tracking-wide text-ink-400 uppercase">
          About you
        </h2>

        <dl className="mt-3 divide-y divide-sand-300/60 rounded-panel border border-sand-300/60 bg-white px-5 shadow-soft">
          <Row label="Conditions" value={receiver.conditions.join(", ")} />
          <Row label="Allergies" value={receiver.allergies.join(", ")} />
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-4">
      <dt className="shrink-0 text-ink-400">{label}</dt>
      <dd className="text-right font-medium text-ink-900">{value}</dd>
    </div>
  );
}
