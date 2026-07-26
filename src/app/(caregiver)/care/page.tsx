import { CarePlanView } from "@/components/caregiver/CarePlanView";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";

/**
 * The care plan reads everything from `CareProvider` (set up in the caregiver
 * layout), so anything added from another screen is already here. Adding is
 * done from the shell's single "Add" button — this page deliberately has no
 * add button of its own.
 */
export default function CarePlanPage() {
  return (
    <PageBody>
      <PageHeader
        eyebrow="Care plan"
        title="Everything that needs doing"
        description="Tasks the family is sharing, the medicines Margaret takes, and what's coming up."
      />
      <CarePlanView />
    </PageBody>
  );
}
