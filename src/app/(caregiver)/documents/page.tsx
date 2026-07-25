import { DocumentsView } from "@/components/caregiver/DocumentsView";
import { PageBody, PageHeader } from "@/components/caregiver/PageHeader";
import { getCareDocuments } from "@/data";

export default async function DocumentsPage() {
  const documents = await getCareDocuments();

  return (
    <PageBody>
      <PageHeader
        eyebrow="Medical records"
        title="Documents, in plain English"
        description="Every letter and result in one place — with the jargon translated and the important dates already on the timeline."
      />
      <DocumentsView documents={documents} />
    </PageBody>
  );
}
