import { Eye, Heart, MessageCircle, Shield, UserPlus } from "lucide-react";

import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { getCareReceiver, getCaregivers, getFamilyUpdates } from "@/data";
import type { CarePerson } from "@/data/types";

/** What each role can actually do, in words rather than permission flags. */
const roleSummary: Record<
  CarePerson["role"],
  { label: string; tone: BadgeTone; icon: typeof Shield; can: string }
> = {
  owner: {
    label: "Organiser",
    tone: "clay",
    icon: Shield,
    can: "Can do everything, including inviting family and removing access.",
  },
  caregiver: {
    label: "Caregiver",
    tone: "sage",
    icon: Heart,
    can: "Can add tasks, upload documents and update the timeline.",
  },
  viewer: {
    label: "Family",
    tone: "plum",
    icon: Eye,
    can: "Can see updates and the timeline, but can't change the care plan.",
  },
  "care-receiver": {
    label: "Care receiver",
    tone: "gold",
    icon: Heart,
    can: "Sees her own daily tasks and can message the family.",
  },
};

export default async function CirclePage() {
  const [caregivers, receiver, updates] = await Promise.all([
    getCaregivers(),
    getCareReceiver(),
    getFamilyUpdates(),
  ]);

  const members = [...caregivers, receiver];

  return (
    <PageBody>
      <PageHeader
        eyebrow="Family care circle"
        title="Who's looking after Margaret"
        description="Everyone in the circle sees the same picture. What they can change depends on their role."
        action={
          <Button>
            <UserPlus size={16} />
            Invite someone
          </Button>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {/* --- Members ------------------------------------------------------- */}
        <div className="stagger space-y-4 lg:col-span-2">
          {members.map((person) => {
            const role = roleSummary[person.role];
            const RoleIcon = role.icon;

            return (
              <Card key={person.id} className="p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <Avatar initials={person.initials} accent={person.accent} size="lg" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-lg text-ink-900">{person.fullName}</h3>
                      <Badge tone={role.tone}>
                        <RoleIcon size={11} />
                        {role.label}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-600">{person.relationship}</p>
                    <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{role.can}</p>
                  </div>
                </div>
              </Card>
            );
          })}

          <Card
            tone="sand"
            className="border-dashed p-6 text-center"
          >
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/70 text-ink-400">
              <UserPlus size={20} />
            </span>
            <h3 className="mt-4 text-lg text-ink-900">Add another family member</h3>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-600">
              Invite by email and choose what they can see. You can change or remove
              access at any time.
            </p>
            <Button variant="outline" size="sm" className="mt-4">
              Send an invitation
            </Button>
          </Card>
        </div>

        {/* --- Shared updates ------------------------------------------------ */}
        <Card className="h-fit p-5 sm:p-6">
          <CardHeader
            title="Shared updates"
            subtitle="What the family has been telling each other"
          />

          <div className="mt-5 space-y-5">
            {updates.map((update) => {
              const author = members.find((p) => p.id === update.authorId);
              if (author === undefined) return null;

              return (
                <div key={update.id} className="flex gap-3">
                  <Avatar initials={author.initials} accent={author.accent} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-900">
                      {author.fullName.split(" ")[0]}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-pretty text-ink-600">
                      {update.body}
                    </p>
                    <div className="mt-2 flex items-center gap-2.5">
                      <span className="text-xs text-ink-400">{update.timeLabel}</span>
                      {update.acknowledgedBy.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-ink-400">
                          <Heart size={10} className="text-clay-300" />
                          {update.acknowledgedBy.length}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Button variant="soft" size="sm" className="mt-6 w-full">
            <MessageCircle size={15} />
            Post an update
          </Button>
        </Card>
      </div>
    </PageBody>
  );
}
