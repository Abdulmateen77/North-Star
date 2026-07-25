import { TodayCompanion } from "@/components/patient/TodayCompanion";
import { getAppointments, getCareReceiver, getCareTasks, getTodaysDoses } from "@/data";

export default async function PatientTodayPage() {
  const [doses, tasks, appointments, receiver] = await Promise.all([
    getTodaysDoses(),
    getCareTasks(),
    getAppointments(),
    getCareReceiver(),
  ]);

  // Only the things Margaret does herself belong on her screen.
  const herTasks = tasks.filter((task) => task.assigneeId === receiver.id);

  return (
    <TodayCompanion
      doses={doses}
      tasks={herTasks}
      appointment={appointments[0] ?? null}
      firstName={receiver.fullName.split(" ")[0]}
    />
  );
}
