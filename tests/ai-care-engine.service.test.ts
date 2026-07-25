import { describe, expect, it, vi } from "vitest";

import { AssistantService } from "@/domains/ai-care-engine/services/assistant.service";
import { BriefingService } from "@/domains/ai-care-engine/services/briefing.service";

const careSpaceId = "22222222-2222-4222-8222-222222222222";
const actorId = "11111111-1111-4111-8111-111111111111";

describe("AI Care Engine", () => {
  it("retrieves platform context before answering caregiver questions", async () => {
    const contextRetriever = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        appointments: [{ date: "2026-08-14", department: "Cardiology" }],
        medications: [],
        tasks: [],
        reminders: [],
        timeline: [],
      }),
    };
    const agent = {
      answer: vi.fn().mockResolvedValue({
        answer: "Grandma's next appointment is Cardiology on 2026-08-14.",
        sources: [{ type: "appointment", id: "appointment-1" }],
        confidence: 0.92,
      }),
    };
    const service = new AssistantService(contextRetriever, agent);

    const response = await service.chat(actorId, {
      careSpaceId,
      question: "When is Grandma's next appointment?",
    });

    expect(contextRetriever.assertCareSpaceMember).toHaveBeenCalledWith(careSpaceId, actorId);
    expect(contextRetriever.retrieve).toHaveBeenCalledWith(careSpaceId);
    expect(agent.answer).toHaveBeenCalledWith(
      expect.objectContaining({ question: "When is Grandma's next appointment?" }),
    );
    expect(response.answer).toContain("2026-08-14");
  });

  it("generates daily briefings from retrieved care context", async () => {
    const contextRetriever = {
      assertCareSpaceMember: vi.fn().mockResolvedValue(undefined),
      retrieve: vi.fn().mockResolvedValue({
        documents: [],
        appointments: [],
        medications: [],
        tasks: [{ title: "Confirm transport", status: "pending" }],
        reminders: [],
        timeline: [],
      }),
    };
    const agent = {
      generate: vi.fn().mockResolvedValue({
        todayPriorities: ["Confirm transport"],
        upcomingAppointments: [],
        overdueTasks: [],
        importantChanges: [],
        generatedAt: "2026-01-01T00:00:00.000Z",
      }),
    };
    const service = new BriefingService(contextRetriever, agent);

    const briefing = await service.generateDailyBriefing(actorId, { careSpaceId });

    expect(contextRetriever.retrieve).toHaveBeenCalledWith(careSpaceId);
    expect(briefing.todayPriorities).toEqual(["Confirm transport"]);
  });
});
