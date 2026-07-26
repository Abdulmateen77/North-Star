import { CalendarDays, Droplet, FileText, MapPin, Pill, ShieldAlert, User } from "lucide-react";

import { LetterList } from "@/components/patient/LetterList";
import { cn } from "@/components/ui/cn";
import { medicationColor } from "@/components/ui/medicationColor";
import {
  getAppointments,
  getCareDocuments,
  getCareReceiver,
  getEmergencyContacts,
  getMedications,
} from "@/data";

export default async function PatientHealthPage() {
  const [appointments, medications, documents, receiver, contacts] = await Promise.all([
    getAppointments(),
    getMedications(),
    getCareDocuments(),
    getCareReceiver(),
    getEmergencyContacts(),
  ]);

  const primaryContact = contacts.find((contact) => contact.primary) ?? null;

  return (
    <>
      <h1 className="animate-fade-up text-3xl leading-tight text-olive-900">Your health</h1>
      <p className="animate-fade-up mt-2 leading-relaxed text-olive-600">
        Everything about you, your appointments, your medicines and your letters.
      </p>

      {/* --- About You — leads the page, since everything else is about her --- */}
      <section className="animate-fade-up mt-7">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          <User size={15} />
          About You
        </h2>

        <div className="mt-3 rounded-panel border border-bone-300/60 bg-white p-5 shadow-soft">
          <p className="text-lg leading-snug font-semibold text-olive-900">
            {receiver.fullName}
          </p>
          <p className="mt-0.5 text-olive-600">{receiver.age} years old</p>
          <p className="mt-3 leading-relaxed text-olive-700">{receiver.situation}</p>

          {receiver.allergies.length > 0 ? (
            <p className="mt-4 flex items-start gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-rose-500">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              <span>
                <span className="font-semibold">Allergic to </span>
                {receiver.allergies.join(", ")}
              </span>
            </p>
          ) : null}

          <dl className="mt-4 divide-y divide-bone-300/60 border-t border-bone-300/60">
            {receiver.bloodType !== null ? (
              <Row icon={Droplet} label="Blood group" value={receiver.bloodType} />
            ) : null}
            {receiver.conditions.length > 0 ? (
              <Row label="Conditions" value={receiver.conditions.join(", ")} />
            ) : null}
            {receiver.nhsNumber !== null ? (
              <Row label="NHS number" value={receiver.nhsNumber} />
            ) : null}
            {receiver.gpName !== null ? (
              <Row
                label="Your GP"
                value={`${receiver.gpName}${receiver.gpPractice !== null ? ` · ${receiver.gpPractice}` : ""}`}
              />
            ) : null}
            {receiver.consultantName !== null ? (
              <Row
                label="Consultant"
                value={`${receiver.consultantName}${receiver.hospital !== null ? ` · ${receiver.hospital}` : ""}`}
              />
            ) : null}
            {receiver.recentProcedure !== null ? (
              <Row
                label="Recent procedure"
                value={`${receiver.recentProcedure}${receiver.recentProcedureDate !== null ? `, ${receiver.recentProcedureDate}` : ""}`}
              />
            ) : null}
            {primaryContact !== null ? (
              <Row
                label="Emergency contact"
                value={`${primaryContact.name} (${primaryContact.relationship}) · ${primaryContact.phone}`}
              />
            ) : null}
          </dl>
        </div>
      </section>

      {/* --- Appointments ----------------------------------------------------- */}
      <section className="animate-fade-up mt-9">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          <CalendarDays size={15} />
          Coming up
        </h2>

        <ul className="mt-3 space-y-3">
          {appointments.map((appt) => (
            <li
              key={appt.id}
              className="rounded-panel border border-bone-300/60 bg-white p-5 shadow-soft"
            >
              <p className="text-lg leading-snug font-medium text-olive-900">{appt.title}</p>
              <p className="mt-0.5 text-sm text-olive-600">{appt.clinician}</p>

              <div className="mt-3.5 space-y-2 text-olive-600">
                <p className="flex items-center gap-2">
                  <CalendarDays size={16} className="shrink-0 text-olive-400" />
                  {appt.dateLabel} at {appt.timeLabel}
                </p>
                <p className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-olive-400" />
                  {appt.location}
                </p>
              </div>

              {appt.transport !== null ? (
                <p className="mt-3.5 rounded-2xl bg-olive-50 px-4 py-3 text-sm text-olive-700">
                  {appt.transport}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {/* --- Medicines -------------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          <Pill size={15} />
          Your medicines
        </h2>

        <ul className="mt-3 space-y-3">
          {medications.map((med) => {
            const color = medicationColor(med.id);
            return (
              <li
                key={med.id}
                className="flex items-start gap-4 rounded-panel border border-bone-300/60 bg-white p-5 shadow-soft"
              >
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl",
                    color.bg,
                    color.text,
                  )}
                >
                  <Pill size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-lg leading-snug font-medium text-olive-900">
                    {med.name} <span className="text-base text-olive-400">{med.dosage}</span>
                  </p>
                  <p className="mt-0.5 text-olive-600">{med.instruction}</p>
                  <p className="mt-1.5 text-sm text-olive-400">{med.purpose}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* --- Letters ---------------------------------------------------------- */}
      <section className="mt-9">
        <h2 className="flex items-center gap-2 px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          <FileText size={15} />
          Your letters
        </h2>
        <p className="mt-1 px-1 text-sm text-olive-400">Tap one to read it in full.</p>

        <LetterList documents={documents} />
      </section>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Droplet;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-3.5">
      <dt className="flex shrink-0 items-center gap-1.5 text-olive-400">
        {Icon !== undefined ? <Icon size={14} /> : null}
        {label}
      </dt>
      <dd className="text-right font-medium text-olive-900">{value}</dd>
    </div>
  );
}
