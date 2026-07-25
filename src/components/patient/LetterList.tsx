"use client";

import { FileText, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CareDocument } from "@/data/types";

type LetterTab = "simple" | "full";

/**
 * Margaret's letters. Tapping one opens the whole thing — the letter as it
 * was written, and a plain-English explanation alongside it, so she never has
 * to choose between "see it" and "understand it".
 */
export function LetterList({ documents }: { documents: CareDocument[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<LetterTab>("simple");

  const open = documents.find((doc) => doc.id === openId) ?? null;

  useEffect(() => {
    if (open === null) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenId(null);
    }

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <ul className="mt-3 space-y-3">
        {documents.map((doc) => (
          <li key={doc.id}>
            <button
              type="button"
              onClick={() => {
                setOpenId(doc.id);
                setTab("simple");
              }}
              className="flex min-h-16 w-full items-start gap-3.5 rounded-panel border border-bone-300/60 bg-bone-50 p-5 text-left transition duration-200 active:scale-[0.99]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white text-olive-500">
                <FileText size={19} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg leading-snug font-medium text-olive-900">
                  {doc.title}
                </span>
                <span className="mt-0.5 block text-sm text-olive-400">
                  {doc.source} · {doc.dateLabel}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpenId(null)}
            className="animate-fade-in absolute inset-0 bg-olive-900/35 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={open.title}
            className="animate-rise relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-panel bg-bone-50 shadow-deep sm:rounded-panel"
          >
            <div className="mesh-rise relative shrink-0 px-6 pt-5 pb-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl leading-snug font-bold tracking-tight text-olive-900">
                    {open.title}
                  </h2>
                  <p className="mt-1 text-sm text-olive-700">
                    {open.source} · {open.dateLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  aria-label="Close"
                  className="grid size-9 shrink-0 place-items-center rounded-full text-olive-700 transition hover:bg-white/50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex gap-2" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "simple"}
                  onClick={() => setTab("simple")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-medium transition duration-200",
                    tab === "simple"
                      ? "bg-olive-900 text-bone-50"
                      : "bg-white/65 text-olive-700 hover:bg-white/90",
                  )}
                >
                  <Sparkles size={14} />
                  Simple explanation
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "full"}
                  onClick={() => setTab("full")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-medium transition duration-200",
                    tab === "full"
                      ? "bg-olive-900 text-bone-50"
                      : "bg-white/65 text-olive-700 hover:bg-white/90",
                  )}
                >
                  <FileText size={14} />
                  Full letter
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              {tab === "simple" ? (
                <div>
                  {open.aiSummary !== null ? (
                    <p className="text-lg leading-relaxed text-pretty text-olive-800">
                      {open.aiSummary}
                    </p>
                  ) : (
                    <p className="text-lg leading-relaxed text-olive-600">
                      North Star hasn&apos;t finished reading this one yet.
                    </p>
                  )}

                  {open.extractedFacts.length > 0 ? (
                    <dl className="mt-5 flex flex-wrap gap-2">
                      {open.extractedFacts.map((fact) => (
                        <div
                          key={fact.label}
                          className="rounded-2xl border border-gold-200 bg-gold-50 px-3.5 py-2.5"
                        >
                          <dt className="text-[0.68rem] tracking-wide text-olive-500 uppercase">
                            {fact.label}
                          </dt>
                          <dd className="mt-0.5 text-sm font-semibold text-olive-900">
                            {fact.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <p className="mt-6 flex items-center gap-2 text-sm text-olive-400">
                    <StarMark size={13} />
                    Explained by North Star
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-bone-300/70 bg-white p-5">
                  <p className="text-xs text-olive-400">
                    {open.fileName} · {open.pageCount} page{open.pageCount === 1 ? "" : "s"}
                  </p>
                  <p className="mt-3 font-mono text-sm leading-relaxed whitespace-pre-wrap text-olive-800">
                    {open.fullText ?? "The full text of this letter isn't available yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
