import { getEnv } from "@/lib/env";
import { jsonResponse, noContentResponse, withApiHandler } from "@/lib/http";
import { parseJsonBody, resolveRouteParams, validateParams } from "@/lib/validation";
import { getDefaultActor } from "@/services/auth.service";
import { requireCronSecret } from "@/shared/security/cron-auth";

import {
  createReminderSchema,
  createTaskSchema,
  listRemindersQuerySchema,
  listTasksQuerySchema,
  reminderIdParamSchema,
  taskIdParamSchema,
  updateReminderSchema,
  updateTaskSchema,
} from "../schemas/api.schema";
import type { CareManagementService } from "../services/care-management.service";
import type { ReminderSchedulerService } from "../services/reminder-scheduler.service";

export type IdRouteContext = { params: Promise<{ id: string }> | { id: string } };

function queryObject(request: Request) {
  return Object.fromEntries(new URL(request.url).searchParams.entries());
}

export class CareManagementController {
  constructor(
    private readonly service: CareManagementService,
    private readonly scheduler: ReminderSchedulerService,
    private readonly cronSecret: () => string | undefined = () => getEnv().CRON_SECRET,
  ) {}

  async createTask(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const input = await parseJsonBody(request, createTaskSchema);
      const task = await this.service.createTask(actor.id, input);
      return jsonResponse({ task }, 201);
    });
  }

  async listTasks(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const query = listTasksQuerySchema.parse(queryObject(request));
      const tasks = await this.service.listTasks(actor.id, {
        careSpaceId: query.careSpaceId,
        status: query.status,
        assignedTo: query.assignedTo,
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
      });
      return jsonResponse({ tasks });
    });
  }

  async completeTask(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), taskIdParamSchema);
      const task = await this.service.completeTask(actor.id, params.id);
      return jsonResponse({ task });
    });
  }

  async updateTask(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), taskIdParamSchema);
      const input = await parseJsonBody(request, updateTaskSchema);
      const task = await this.service.updateTask(actor.id, params.id, input);
      return jsonResponse({ task });
    });
  }

  async deleteTask(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), taskIdParamSchema);
      await this.service.deleteTask(actor.id, params.id);
      return noContentResponse();
    });
  }

  async createReminder(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const input = await parseJsonBody(request, createReminderSchema);
      const reminder = await this.service.createReminder(actor.id, input);
      return jsonResponse({ reminder }, 201);
    });
  }

  async listReminders(request: Request): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const query = listRemindersQuerySchema.parse(queryObject(request));
      const reminders = await this.service.listReminders(actor.id, {
        careSpaceId: query.careSpaceId,
        status: query.status,
        assignedTo: query.assignedTo,
        limit: query.pageSize,
        offset: (query.page - 1) * query.pageSize,
      });
      return jsonResponse({ reminders });
    });
  }

  async triggerReminder(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), reminderIdParamSchema);
      const reminder = await this.service.triggerReminder(actor.id, params.id);
      return jsonResponse({ reminder });
    });
  }

  async updateReminder(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), reminderIdParamSchema);
      const input = await parseJsonBody(request, updateReminderSchema);
      const reminder = await this.service.updateReminder(actor.id, params.id, input);
      return jsonResponse({ reminder });
    });
  }

  async deleteReminder(request: Request, context: IdRouteContext): Promise<Response> {
    return withApiHandler(request, async () => {
      const actor = await getDefaultActor();
      const params = validateParams(await resolveRouteParams(context.params), reminderIdParamSchema);
      await this.service.deleteReminder(actor.id, params.id);
      return noContentResponse();
    });
  }

  async processDueReminders(request: Request): Promise<Response> {
    return withApiHandler(
      request,
      async () => {
        requireCronSecret(request, this.cronSecret());
        const result = await this.scheduler.processDueReminders();
        return jsonResponse(result);
      },
      { rateLimit: false },
    );
  }
}
