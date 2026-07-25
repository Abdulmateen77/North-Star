import { TodayCompanion } from "@/components/patient/TodayCompanion";
import { getCareReceiver, getCareTasks, getTodaysDoses } from "@/data";

export default async function PatientTodayPage() {
  const [doses, tasks, receiver] = await Promise.all([
    getTodaysDoses(),
    getCareTasks(),
    getCareReceiver(),
  ]);

  // Only the things Margaret does herself belong on her screen.
  const herTasks = tasks.filter((task) => task.assigneeId === receiver.id);

  return <TodayCompanion doses={doses} tasks={herTasks} />;
}
