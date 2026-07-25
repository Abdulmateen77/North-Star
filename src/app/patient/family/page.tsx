import { Heart, MessageCircle, Phone } from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { getCareReceiver, getCaregivers, getEmergencyContacts, getFamilyUpdates } from "@/data";

export default async function PatientFamilyPage() {
  const [caregivers, updates, contacts, receiver] = await Promise.all([
    getCaregivers(),
    getFamilyUpdates(),
    getEmergencyContacts(),
    getCareReceiver(),
  ]);

  const people = [...caregivers, receiver];

  /** Match a caregiver to their phone number so "Call" actually dials. */
  function phoneFor(fullName: string): string | null {
    return contacts.find((contact) => contact.name === fullName)?.phone ?? null;
  }

  return (
    <>
      <h1 className="animate-fade-up text-3xl leading-tight text-olive-900">Your family</h1>
      <p className="animate-fade-up mt-2 leading-relaxed text-olive-600">
        They&apos;re keeping an eye on things with you.
      </p>

      {/* --- Reach someone ---------------------------------------------------- */}
      <ul className="animate-fade-up mt-7 space-y-3">
        {caregivers.map((person) => {
          const phone = phoneFor(person.fullName);

          return (
            <li
              key={person.id}
              className="rounded-panel border border-bone-300/60 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center gap-4">
                <Avatar initials={person.initials} accent={person.accent} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg leading-snug font-medium text-olive-900">
                    {person.fullName}
                  </p>
                  <p className="text-sm text-olive-600">{person.relationship}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                {phone !== null ? (
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-clay-500 px-4 font-medium text-white transition hover:bg-clay-600"
                  >
                    <Phone size={18} />
                    Call
                  </a>
                ) : null}
                <button
                  type="button"
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-pill border border-bone-300 bg-white px-4 font-medium text-olive-800 transition hover:bg-bone-50"
                >
                  <MessageCircle size={18} />
                  Message
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* --- What they've been saying ----------------------------------------- */}
      <section className="mt-9">
        <h2 className="px-1 text-sm font-medium tracking-wide text-olive-400 uppercase">
          Recent updates
        </h2>

        <ul className="mt-3 space-y-3">
          {updates.map((update) => {
            const author = people.find((p) => p.id === update.authorId);
            if (author === undefined) return null;

            return (
              <li
                key={update.id}
                className="rounded-panel border border-bone-300/60 bg-bone-50 p-5"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={author.initials} accent={author.accent} size="sm" />
                  <div>
                    <p className="font-medium text-olive-900">{author.fullName.split(" ")[0]}</p>
                    <p className="text-xs text-olive-400">{update.timeLabel}</p>
                  </div>
                </div>

                <p className="mt-3 leading-relaxed text-pretty text-olive-800">{update.body}</p>

                {update.acknowledgedBy.length > 0 ? (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-olive-400">
                    <Heart size={13} className="text-clay-300" />
                    {update.acknowledgedBy.length} in the family saw this
                  </p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
