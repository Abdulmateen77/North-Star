import { AssistantView } from "@/components/caregiver/AssistantView";
import { CareSpaceSetup } from "@/components/caregiver/CareSpaceSetup";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { getAssistantConversation, getAssistantSuggestions, getCurrentUser } from "@/data";

export default async function AssistantPage() {
  const [messages, suggestions, user] = await Promise.all([
    getAssistantConversation(),
    getAssistantSuggestions(),
    getCurrentUser(),
  ]);

  const opening = messages.slice(0, 1);

  return (
    <PageBody>
      <PageHeader
        eyebrow="AI assistant"
        title="Ask anything about this care space"
        description="Answers come from live North Star records saved in Supabase."
      />
      <CareSpaceSetup />
      <div className="mt-8">
        <AssistantView initialMessages={opening} suggestions={suggestions} user={user} />
      </div>
    </PageBody>
  );
}
