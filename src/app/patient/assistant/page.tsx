import { PatientAssistant } from "@/components/patient/PatientAssistant";
import { getCareReceiver } from "@/data";

export default async function PatientAssistantPage() {
  const receiver = await getCareReceiver();
  const firstName = receiver.fullName.split(" ")[0];

  return (
    <PatientAssistant
      greeting={`Hello ${firstName}. You can ask me anything saved in your North Star care space.\n\nI'll keep it simple, and I'll tell you when something is better asked of your caregiver or doctor.`}
    />
  );
}
