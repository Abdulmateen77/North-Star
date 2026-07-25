import { describe, expect, it } from "vitest";

import { AssistantAgent } from "@/domains/ai-care-engine/agents/assistant.agent";

const prompts = { getPrompt: () => "Return an AssistantAnswer JSON object." };
const context = { documents: [], appointments: [], medications: [], tasks: [], reminders: [], timeline: [] };

describe("AssistantAgent", () => {
  it("normalizes non-conforming model JSON into the AssistantAnswer contract", async () => {
    const client = {
      chat: {
        completions: {
          create: async () => ({
            choices: [
              {
                message: {
                  content: JSON.stringify({ outstanding_tasks: ["Book follow-up"] }),
                },
              },
            ],
          }),
        },
      },
    };
    const agent = new AssistantAgent(prompts, client);

    const answer = await agent.answer({ question: "What tasks are outstanding?", context });

    expect(answer).toEqual({
      answer: '{"outstanding_tasks":["Book follow-up"]}',
      sources: [],
      confidence: 0,
    });
  });
});
