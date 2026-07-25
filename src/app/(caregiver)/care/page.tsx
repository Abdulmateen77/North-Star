import { CarePlanView } from "@/components/caregiver/CarePlanView";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { SetupButton } from "@/components/caregiver/SetupButton";

/**
 * The care plan reads everything from `CareProvider` (set up in the caregiver
 * layout), so anything added from another screen is already here.
 */
export default function CarePlanPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Care plan"
        title="Everything that needs doing"
        description="Tasks the family is sharing, the medicines Margaret takes, and what's coming up."
        action={<SetupButton kind="task" label="Set something up" />}
      />
      <CarePlanView />
    </PageBody>
  );
}
