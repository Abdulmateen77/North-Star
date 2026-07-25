"use client";

import { AlertCircle, CheckCircle2, FileText, Loader2, Paperclip, UploadCloud } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { useCare } from "@/components/caregiver/CareProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CareDocument, DocumentKind } from "@/data/types";

const kindLabels: Record<DocumentKind, string> = {
  "discharge-summary": "Discharge summary",
  "test-results": "Test results",
  prescription: "Prescription",
  "care-plan": "Care plan",
  letter: "Letter",
  other: "Document",
};

export function DocumentsView({ documents }: { documents: CareDocument[] }) {
  const { careSpaceId } = useCare();
  const [docs, setDocs] = useState(documents);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ingest = useCallback(
    async (file: File) => {
      const id = `upload-${Date.now()}`;
      const draft: CareDocument = {
        id,
        title: file.name.replace(/\.[^.]+$/, ""),
        kind: "other",
        status: "uploading",
        source: "Uploaded by you",
        uploadedAt: new Date().toISOString(),
        dateLabel: "Just now",
        fileName: file.name,
        fileSizeLabel: formatSize(file.size),
        pageCount: 1,
        aiSummary: null,
        extractedFacts: [],
        generatedTaskIds: [],
        progress: 0,
      };

      setDocs((current) => [draft, ...current]);

      try {
        if (careSpaceId === null) {
          throw new Error("Create a care space before uploading documents.");
        }

        const form = new FormData();
        form.set("careSpaceId", careSpaceId);
        form.set("file", file);

        const response = await fetch("/api/health-records/documents", {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const body = (await response.json()) as { documentId: string; status: string };
        setDocs((current) =>
          current.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  id: body.documentId,
                  status: "ready",
                  progress: 100,
                  extractedFacts: [{ label: "Saved", value: body.status }],
                }
              : doc,
          ),
        );
      } catch (error) {
        setDocs((current) =>
          current.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  status: "failed",
                  progress: 100,
                  aiSummary: error instanceof Error ? error.message : "Upload failed.",
                }
              : doc,
          ),
        );
      }
    },
    [careSpaceId],
  );

  function handleFiles(files: FileList | null) {
    if (files === null) return;
    Array.from(files).forEach((file) => void ingest(file));
  }

  return (
    <>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "animate-fade-up mt-7 rounded-panel border-2 border-dashed p-9 text-center transition duration-300 sm:p-12",
          dragging
            ? "border-clay-500 bg-clay-50"
            : "border-bone-300 bg-white/60 hover:border-bone-400",
        )}
      >
        <span
          className={cn(
            "mx-auto grid size-16 place-items-center rounded-3xl transition duration-300",
            dragging ? "bg-clay-100 text-clay-600" : "bg-bone-200 text-olive-400",
          )}
        >
          <UploadCloud size={28} />
        </span>

        <h2 className="mt-5 text-xl text-olive-900">Upload a letter or report</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-pretty text-olive-600">
          PDF, JPG, and PNG files are saved to the live Supabase-backed health records bucket.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={() => inputRef.current?.click()}>
            <Paperclip size={16} />
            Choose a file
          </Button>
          <span className="text-sm text-olive-400">PDF, JPG or PNG · up to 10MB</span>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="stagger mt-8 space-y-4">
        {docs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
        {docs.length === 0 ? (
          <Card className="border-dashed p-8 text-center text-sm text-olive-400">
            No live documents saved yet.
          </Card>
        ) : null}
      </div>
    </>
  );
}

function DocumentCard({ doc }: { doc: CareDocument }) {
  const busy = doc.status === "uploading" || doc.status === "analysing";
  const failed = doc.status === "failed";

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            busy
              ? "bg-gold-50 text-gold-500"
              : failed
                ? "bg-clay-50 text-clay-600"
                : "bg-bone-200 text-olive-600",
          )}
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : failed ? <AlertCircle size={20} /> : <FileText size={20} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg text-olive-900">{doc.title}</h3>
            {!busy ? <Badge tone="neutral">{kindLabels[doc.kind]}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-olive-400">
            {doc.source} · {doc.dateLabel} · {doc.fileSizeLabel}
          </p>
        </div>

        {busy ? (
          <Badge tone="gold" className="shrink-0">
            <Loader2 size={12} className="animate-spin" />
            Saving
          </Badge>
        ) : failed ? (
          <Badge tone="rose" className="shrink-0">
            <AlertCircle size={12} />
            Failed
          </Badge>
        ) : (
          <Badge tone="olive" className="shrink-0">
            <CheckCircle2 size={12} />
            Saved
          </Badge>
        )}
      </div>

      {doc.aiSummary ? (
        <div className="mt-5 rounded-card border border-gold-100 bg-gold-50/60 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-gold-500 uppercase">
            <StarMark size={12} />
            Status
          </p>
          <p className="mt-2.5 leading-relaxed text-pretty text-olive-800">{doc.aiSummary}</p>
        </div>
      ) : null}

      {doc.extractedFacts.length > 0 ? (
        <dl className="mt-4 flex flex-wrap gap-2">
          {doc.extractedFacts.map((fact) => (
            <div
              key={fact.label}
              className="rounded-2xl border border-gold-100 bg-white/80 px-3 py-2"
            >
              <dt className="text-[0.68rem] tracking-wide text-olive-400 uppercase">
                {fact.label}
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-olive-900">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </Card>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
