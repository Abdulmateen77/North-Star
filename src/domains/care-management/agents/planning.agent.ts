export interface PlanningAgentInput {
  careSpaceId: string;
  summary: string;
  medications?: unknown[];
  appointments?: unknown[];
  instructions?: unknown[];
}

export interface PlanningAgentSuggestion {
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  rationale: string;
}

export class PlanningAgent {
  async suggestTasks(input: PlanningAgentInput): Promise<PlanningAgentSuggestion[]> {
    const suggestions: PlanningAgentSuggestion[] = [];
    if (input.appointments?.length) {
      suggestions.push({
        title: "Prepare for upcoming appointment",
        description: "Review appointment details and transport needs.",
        priority: "medium",
        rationale: "Appointment information exists in the care context.",
      });
    }
    if (input.medications?.length) {
      suggestions.push({
        title: "Review medication instructions",
        description: "Confirm dosage, frequency, and caregiver responsibilities.",
        priority: "high",
        rationale: "Medication records require caregiver coordination.",
      });
    }
    return suggestions;
  }
}
