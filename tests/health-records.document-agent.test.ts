import { describe, expect, it, vi } from "vitest";

import { DocumentAgent } from "@/domains/health-records/agents/document.agent";

const sourceText = `Appointment date: 2026-08-14. Department: Cardiology. Medication: Aspirin 75mg daily.`;

describe("DocumentAgent", () => {
  it("asks the AI model for JSON-only structured healthcare extraction", async () => {
    const create = vi.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              documentType: "appointment_letter",
              summary: "Cardiology appointment mentioning Aspirin.",
              appointments: [
                {
                  date: "2026-08-14",
                  time: null,
                  location: null,
                  department: "Cardiology",
                  clinician: null,
                  status: null,
                },
              ],
              medications: [
                {
                  name: "Aspirin",
                  dosage: "75mg",
                  frequency: "daily",
                  instructions: null,
                },
              ],
              conditions: [],
              instructions: [],
              confidence: 0.91,
            }),
          },
        },
      ],
    });
    const client = { chat: { completions: { create } } };

    const agent = new DocumentAgent(client as never, {
      model: "test-model",
      timeoutMs: 1_000,
    });

    const result = await agent.analyze(sourceText, { documentId: "doc_123" });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "test-model",
        response_format: { type: "json_object" },
      }),
    );
    expect(result.documentType).toBe("appointment_letter");
    expect(result.appointments).toHaveLength(1);
    expect(result.medications[0]?.name).toBe("Aspirin");
  });

  it("fails safely when the AI returns malformed JSON", async () => {
    const client = {
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: "not-json" } }],
          }),
        },
      },
    };

    const agent = new DocumentAgent(client as never, {
      model: "test-model",
      timeoutMs: 1_000,
    });

    await expect(agent.analyze(sourceText, { documentId: "doc_123" })).rejects.toMatchObject({
      code: "MALFORMED_AI_RESPONSE",
      statusCode: 502,
    });
  });
});
