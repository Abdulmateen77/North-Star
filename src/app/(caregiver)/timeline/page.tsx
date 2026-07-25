import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { TimelineView } from "@/components/caregiver/TimelineView";
import { getCareReceiver, getCaregivers, getTimelineEvents } from "@/data";

export default async function TimelinePage() {
  const [events, caregivers, receiver] = await Promise.all([
    getTimelineEvents(),
    getCaregivers(),
    getCareReceiver(),
  ]);

  return (
    <PageBody>
      <PageHeader
        eyebrow="Care timeline"
        title="Care timeline"
        description="Everything saved to the live care timeline, in order."
      />
      <TimelineView events={events} people={[...caregivers, receiver]} />
    </PageBody>
  );
}
