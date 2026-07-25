import type { AnalyticsInsightsResult, CareInsight } from "../types/models";
import type { AnalyticsRepository } from "../types/repositories";

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async generateInsights(actorId: string, careSpaceId: string): Promise<AnalyticsInsightsResult> {
    await this.repository.assertCareSpaceMember(careSpaceId, actorId);
    const snapshot = await this.repository.getAnalyticsSnapshot(careSpaceId);
    const completedTasks = snapshot.tasks.filter((task) => task.status === "completed").length;
    const totalTasks = snapshot.tasks.length;
    const missedReminders = snapshot.reminders.filter((reminder) => reminder.status === "missed").length;
    const insights: CareInsight[] = [
      {
        id: "task-completion-trend",
        type: "task_completion_trend",
        title: "Task completion",
        value: totalTasks === 0 ? "No tasks yet" : `${completedTasks}/${totalTasks}`,
        description: "Observed completed care tasks compared with total tracked tasks.",
        severity: "info",
        diagnostic: false,
      },
      {
        id: "missed-reminders",
        type: "missed_reminders",
        title: "Missed reminders",
        value: missedReminders,
        description: "Observed reminders marked missed in the care space.",
        severity: missedReminders > 0 ? "warning" : "info",
        diagnostic: false,
      },
      {
        id: "appointment-frequency",
        type: "appointment_frequency",
        title: "Appointments tracked",
        value: snapshot.appointments.length,
        description: "Observed appointments detected or created in North Star.",
        severity: "info",
        diagnostic: false,
      },
    ];
    return { careSpaceId, generatedAt: new Date().toISOString(), insights };
  }
}
