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
        title="Margaret's story so far"
        description="Everything that's happened, in order — appointments, medication changes, hospital stays and the small wins in between."
      />
      <TimelineView events={events} people={[...caregivers, receiver]} />
    </PageBody>
  );
}
