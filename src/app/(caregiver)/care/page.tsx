import { CarePlanView } from "@/components/caregiver/CarePlanView";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import {
  getAppointments,
  getCareReceiver,
  getCaregivers,
  getCareTasks,
  getMedications,
  getReminders,
} from "@/data";

export default async function CarePlanPage() {
  const [tasks, medications, appointments, reminders, caregivers, receiver] = await Promise.all([
    getCareTasks(),
    getMedications(),
    getAppointments(),
    getReminders(),
    getCaregivers(),
    getCareReceiver(),
  ]);

  // Margaret picks up tasks too, so she belongs in the assignee list.
  const people = [...caregivers, receiver];

  return (
    <PageBody>
      <PageHeader
        eyebrow="Care plan"
        title="Everything that needs doing"
        description="Tasks the family is sharing, the medicines Margaret takes, and what's coming up."
      />
      <CarePlanView
        tasks={tasks}
        medications={medications}
        appointments={appointments}
        reminders={reminders}
        people={people}
      />
    </PageBody>
  );
}
