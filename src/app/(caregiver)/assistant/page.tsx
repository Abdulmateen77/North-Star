import { AssistantView } from "@/components/caregiver/AssistantView";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { getAssistantConversation, getAssistantSuggestions, getCurrentUser } from "@/data";

export default async function AssistantPage() {
  const [messages, suggestions, user] = await Promise.all([
    getAssistantConversation(),
    getAssistantSuggestions(),
    getCurrentUser(),
  ]);

  // Only the opening briefing is shown; the scripted exchange below it is a
  // demo aid, so the thread starts clean and the suggestions stay visible.
  const opening = messages.slice(0, 1);

  return (
    <PageBody>
      <PageHeader
        eyebrow="AI assistant"
        title="Ask anything about Margaret's care"
        description="It has read every document, appointment and medication change in her record."
      />
      <div className="mt-8">
        <AssistantView initialMessages={opening} suggestions={suggestions} user={user} />
      </div>
    </PageBody>
  );
}
