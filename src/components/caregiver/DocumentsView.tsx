"use client";

import {
  CheckCircle2,
  FileText,
  Loader2,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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

/** The stages a freshly dropped file moves through, with copy for each. */
const analysisStages = [
  { at: 0, label: "Uploading securely" },
  { at: 34, label: "Reading the document" },
  { at: 58, label: "Pulling out dates and medicines" },
  { at: 80, label: "Building the summary" },
] as const;

export function DocumentsView({ documents }: { documents: CareDocument[] }) {
  const [docs, setDocs] = useState(documents);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearInterval);
  }, []);

  /**
   * Runs the upload → analyse → ready sequence locally. When the backend's
   * document endpoints land, this is where the POST and its polling go; the
   * rendering below already handles every status.
   */
  const ingest = useCallback((file: File) => {
    const id = `doc-local-${Date.now()}`;
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

    const timer = setInterval(() => {
      setDocs((current) =>
        current.map((doc) => {
          if (doc.id !== id) return doc;

          const progress = Math.min(100, doc.progress + 4 + Math.random() * 7);

          if (progress >= 100) {
            clearInterval(timer);
            return {
              ...doc,
              progress: 100,
              status: "ready",
              kind: "letter",
              aiSummary:
                "North Star has read this document and added anything date-related to Margaret's timeline. Nothing in it changes her current medicines. Open it below to see the details, or ask the assistant about anything that isn't clear.",
              extractedFacts: [
                { label: "Pages", value: String(doc.pageCount) },
                { label: "Added to timeline", value: "Yes" },
                { label: "Medicine changes", value: "None found" },
              ],
            };
          }

          return {
            ...doc,
            progress,
            status: progress > 30 ? "analysing" : "uploading",
          };
        }),
      );
    }, 260);

    timers.current.push(timer);
  }, []);

  function handleFiles(files: FileList | null) {
    if (files === null) return;
    Array.from(files).forEach(ingest);
  }

  return (
    <>
      {/* --- Drop zone -------------------------------------------------------- */}
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
            : "border-sand-300 bg-white/60 hover:border-sand-400",
        )}
      >
        <span
          className={cn(
            "mx-auto grid size-16 place-items-center rounded-3xl transition duration-300",
            dragging ? "bg-clay-100 text-clay-600" : "bg-cream-200 text-ink-400",
          )}
        >
          <UploadCloud size={28} />
        </span>

        <h2 className="mt-5 text-xl text-ink-900">Drop a letter or report here</h2>
        <p className="mx-auto mt-2 max-w-md leading-relaxed text-pretty text-ink-600">
          NHS letters, discharge summaries, test results, prescriptions. We&apos;ll read it,
          explain it in plain English, and add anything important to the timeline.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={() => inputRef.current?.click()}>
            <Paperclip size={16} />
            Choose a file
          </Button>
          <span className="text-sm text-ink-400">PDF, JPG or PNG · up to 20MB</span>
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

      {/* --- Documents -------------------------------------------------------- */}
      <div className="stagger mt-8 space-y-4">
        {docs.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </>
  );
}

function DocumentCard({ doc }: { doc: CareDocument }) {
  const busy = doc.status === "uploading" || doc.status === "analysing";
  const stage =
    [...analysisStages].reverse().find((s) => doc.progress >= s.at) ?? analysisStages[0];

  return (
    <Card className="overflow-hidden p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            busy ? "bg-plum-50 text-plum-500" : "bg-cream-200 text-ink-600",
          )}
        >
          {busy ? <Loader2 size={20} className="animate-spin" /> : <FileText size={20} />}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-lg text-ink-900">{doc.title}</h3>
            {!busy ? <Badge tone="neutral">{kindLabels[doc.kind]}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-ink-400">
            {doc.source} · {doc.dateLabel} · {doc.fileSizeLabel}
          </p>
        </div>

        {!busy ? (
          <Badge tone="sage" className="shrink-0">
            <CheckCircle2 size={12} />
            Understood
          </Badge>
        ) : null}
      </div>

      {/* --- In-flight analysis --------------------------------------------- */}
      {busy ? (
        <div className="mt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-plum-500">
              <StarMark size={13} />
              {stage.label}
            </span>
            <span className="text-ink-400">{Math.round(doc.progress)}%</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-pill bg-cream-200">
            <div
              className="h-full rounded-pill bg-plum-400 transition-[width] duration-300 ease-out"
              style={{ width: `${doc.progress}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* --- AI understanding ------------------------------------------------ */}
      {doc.aiSummary ? (
        <div className="mt-5 rounded-card border border-plum-100 bg-plum-50/60 p-4 sm:p-5">
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-plum-500 uppercase">
            <StarMark size={12} />
            What this says
          </p>
          <p className="mt-2.5 leading-relaxed text-pretty text-ink-800">{doc.aiSummary}</p>

          {doc.extractedFacts.length > 0 ? (
            <dl className="mt-4 flex flex-wrap gap-2">
              {doc.extractedFacts.map((fact) => (
                <div
                  key={fact.label}
                  className="rounded-2xl border border-plum-100 bg-white/80 px-3 py-2"
                >
                  <dt className="text-[0.68rem] tracking-wide text-ink-400 uppercase">
                    {fact.label}
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-ink-900">{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {doc.generatedTaskIds.length > 0 ? (
            <p className="mt-4 flex items-center gap-2 border-t border-plum-100 pt-3.5 text-sm text-plum-500">
              <CheckCircle2 size={14} />
              {doc.generatedTaskIds.length} task
              {doc.generatedTaskIds.length === 1 ? "" : "s"} created for the family
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
