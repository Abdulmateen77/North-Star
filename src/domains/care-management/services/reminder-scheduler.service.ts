import type { DomainEventPublisher } from "@/shared/events/domain-events";

import type { CareReminder } from "../types/models";

export interface ReminderSchedulerRepository {
  findDue(now: string, limit: number): Promise<CareReminder[]>;
  update(id: string, patch: Partial<CareReminder>): Promise<CareReminder>;
}

export interface ProcessDueRemindersInput {
  now?: string;
  limit?: number;
}

export interface ProcessDueRemindersResult {
  triggered: CareReminder[];
  missed: CareReminder[];
  processedCount: number;
}

export interface ReminderSchedulerOptions {
  missedAfterMs?: number;
}

const DEFAULT_DUE_LIMIT = 100;
const DEFAULT_MISSED_AFTER_MS = 24 * 60 * 60 * 1000;

export class ReminderSchedulerService {
  private readonly missedAfterMs: number;

  constructor(
    private readonly reminders: ReminderSchedulerRepository,
    private readonly events: DomainEventPublisher,
    options: ReminderSchedulerOptions = {},
  ) {
    this.missedAfterMs = options.missedAfterMs ?? DEFAULT_MISSED_AFTER_MS;
  }

  async processDueReminders(
    input: ProcessDueRemindersInput = {},
  ): Promise<ProcessDueRemindersResult> {
    const now = input.now ?? new Date().toISOString();
    const limit = input.limit ?? DEFAULT_DUE_LIMIT;
    const dueReminders = await this.reminders.findDue(now, limit);
    const triggered: CareReminder[] = [];
    const missed: CareReminder[] = [];
    const nowMs = new Date(now).getTime();

    for (const reminder of dueReminders) {
      const scheduledMs = new Date(reminder.scheduledFor).getTime();
      const isMissed = Number.isFinite(scheduledMs) && scheduledMs + this.missedAfterMs < nowMs;

      if (isMissed) {
        const missedReminder = await this.reminders.update(reminder.id, { status: "missed" });
        missed.push(missedReminder);
        await this.events.publish({
          type: "ReminderMissed",
          careSpaceId: missedReminder.careSpaceId,
          reminderId: missedReminder.id,
          title: missedReminder.title,
          missedAt: now,
          occurredAt: now,
        });
        continue;
      }

      const triggeredReminder = await this.reminders.update(reminder.id, {
        status: "triggered",
        triggeredAt: now,
      });
      triggered.push(triggeredReminder);
      await this.events.publish({
        type: "ReminderTriggered",
        careSpaceId: triggeredReminder.careSpaceId,
        reminderId: triggeredReminder.id,
        title: triggeredReminder.title,
        triggeredAt: now,
        occurredAt: now,
      });
    }

    return {
      triggered,
      missed,
      processedCount: triggered.length + missed.length,
    };
  }
}
