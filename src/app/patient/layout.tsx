import type { ReactNode } from "react";

import { PatientShell } from "@/components/patient/PatientShell";
import { getCareReceiver } from "@/data";

export default async function PatientLayout({ children }: { children: ReactNode }) {
  const receiver = await getCareReceiver();

  return <PatientShell receiver={receiver}>{children}</PatientShell>;
}
