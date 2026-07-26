import type { ReactNode } from "react";

import { CareProvider } from "@/components/caregiver/CareProvider";
import { CareToast } from "@/components/caregiver/CareToast";
import { CaregiverShell } from "@/components/caregiver/CaregiverShell";
import { Onboarding } from "@/components/caregiver/Onboarding";
import { QuickSetupSheet } from "@/components/caregiver/QuickSetupSheet";
import {
  getAppointments,
  getCareReceiver,
  getCaregivers,
  getCareTasks,
  getCurrentUser,
  getMedications,
  getReminders,
} from "@/data";

/**
 * Shell for every caregiver screen. The care plan is loaded once here and held
 * in `CareProvider`, so adding a task from the dashboard shows up on the care
 * plan immediately — and the quick-setup sheet can be opened from anywhere.
 */
export default async function CaregiverLayout({ children }: { children: ReactNode }) {
  const [user, receiver, caregivers, tasks, reminders, medications, appointments] =
    await Promise.all([
      getCurrentUser(),
      getCareReceiver(),
      getCaregivers(),
      getCareTasks(),
      getReminders(),
      getMedications(),
      getAppointments(),
    ]);

  // Margaret picks up tasks herself, so she belongs in every assignee list.
  const people = [...caregivers, receiver];

  return (
    <CareProvider
      initialTasks={tasks}
      initialReminders={reminders}
      initialMedications={medications}
      initialAppointments={appointments}
      people={people}
    >
      <CaregiverShell user={user} receiver={receiver}>
        {children}
      </CaregiverShell>
      <QuickSetupSheet />
      <CareToast />
      <Onboarding user={user} receiver={receiver} caregivers={caregivers} />
    </CareProvider>
  );
}
