import type { ReactNode } from "react";

import { CaregiverShell } from "@/components/caregiver/CaregiverShell";
import { getCareReceiver, getCurrentUser } from "@/data";

/**
 * Shell for every caregiver screen. Data is fetched once here rather than in
 * each page so the sidebar never flickers between navigations.
 */
export default async function CaregiverLayout({ children }: { children: ReactNode }) {
  const [user, receiver] = await Promise.all([getCurrentUser(), getCareReceiver()]);

  return (
    <CaregiverShell user={user} receiver={receiver}>
      {children}
    </CaregiverShell>
  );
}
