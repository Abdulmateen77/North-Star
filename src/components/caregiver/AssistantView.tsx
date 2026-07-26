"use client";

import { ArrowUp, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useCare } from "@/components/caregiver/CareProvider";
import { Avatar } from "@/components/ui/Avatar";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { askLiveAssistant } from "@/data/live";
import type { CarePerson, ChatMessage } from "@/data/types";

export function AssistantView({
  initialMessages,
  suggestions,
  user,
}: {
  initialMessages: ChatMessage[];
  suggestions: string[];
  user: CarePerson;
}) {
  const { careSpaceId } = useCare();
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  // Only follow the thread once the user has actually said something —
  // scrolling on mount would drag the page past the page header.
  useEffect(() => {
    if (!hasInteracted.current) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (trimmed === "" || thinking) return;

    hasInteracted.current = true;

    const now = new Date().toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
    });

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, author: "user", body: trimmed, timeLabel: now, citations: [], actions: [] },
    ]);
    setDraft("");
    setThinking(true);

    try {
      if (careSpaceId === null) {
        throw new Error("Create a care space before using chat.");
      }

      const answer = await askLiveAssistant(careSpaceId, trimmed);
      setMessages((current) => [...current, answer]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          author: "assistant",
          body:
            error instanceof Error
              ? error.message
              : "I could not reach the live assistant right now.",
          timeLabel: now,
          citations: [],
          actions: [],
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    // Sized so the composer lands at the fold on first paint, with the page
    // header still visible above the thread.
    <div className="flex min-h-[calc(100dvh-15rem)] flex-col">
      {/* --- Thread ----------------------------------------------------------- */}
      <div className="flex-1 space-y-6 pb-6">
        {messages.map((message) =>
          message.author === "assistant" ? (
            <AssistantMessage key={message.id} message={message} />
          ) : (
            <UserMessage key={message.id} message={message} user={user} />
          ),
        )}

        {thinking ? <ThinkingBubble /> : null}
        <div ref={endRef} />
      </div>

      {/* --- Composer --------------------------------------------------------- */}
      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-bone-100 via-bone-100 to-transparent px-5 pt-6 pb-5 sm:-mx-8 sm:px-8">
        {messages.length <= 1 ? (
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="shrink-0 rounded-pill border border-bone-300/70 bg-white px-4 py-2 text-sm text-olive-600 transition duration-200 hover:-translate-y-0.5 hover:border-clay-300 hover:text-clay-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          className="flex items-end gap-2 rounded-panel border border-bone-300/70 bg-white p-2 shadow-soft focus-within:border-clay-300"
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder={
              careSpaceId === null
                ? "Create a care space above to start asking…"
                : "Ask anything about this care space…"
            }
            aria-label="Ask the assistant"
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3.5 py-2.5 text-olive-900 placeholder:text-olive-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim() === "" || thinking || careSpaceId === null}
            aria-label="Send"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-clay-500 text-white transition duration-200 hover:bg-clay-600 disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </button>
        </form>

        <p className="mt-2.5 text-center text-xs text-olive-400">
          North Star answers from saved records only. It is not medical advice — for urgent concerns, contact a clinician or emergency services.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function AssistantMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="animate-fade-up flex gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-olive-900 text-gold-200">
        <StarMark size={17} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="rounded-card rounded-tl-md border border-gold-100 bg-gold-50/60 p-4 sm:p-5">
          {message.body.split("\n\n").map((paragraph, index) => (
            <p
              key={index}
              className={cn("leading-relaxed text-pretty text-olive-800", index > 0 && "mt-3")}
            >
              {paragraph}
            </p>
          ))}

          {message.citations.length > 0 ? (
            <div className="mt-4 border-t border-gold-100 pt-3.5">
              <p className="text-[0.68rem] font-medium tracking-wide text-olive-400 uppercase">
                Based on
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {message.citations.map((citation) => (
                  <span
                    key={citation.label}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-gold-100 bg-white/80 px-2.5 py-1 text-xs text-olive-600"
                  >
                    <FileText size={11} className="text-gold-500" />
                    {citation.label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <p className="mt-2 text-xs text-olive-400">{message.timeLabel}</p>
      </div>
    </div>
  );
}

function UserMessage({ message, user }: { message: ChatMessage; user: CarePerson }) {
  return (
    <div className="animate-fade-up flex justify-end gap-3.5">
      <div className="max-w-[36rem] min-w-0">
        <div className="rounded-card rounded-tr-md bg-clay-500 px-4 py-3 text-white sm:px-5">
          <p className="leading-relaxed text-pretty">{message.body}</p>
        </div>
        <p className="mt-2 text-right text-xs text-olive-400">{message.timeLabel}</p>
      </div>
      <Avatar initials={user.initials} accent={user.accent} size="sm" className="mt-0.5" />
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="animate-fade-in flex gap-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-olive-900 text-gold-200">
        <StarMark size={17} />
      </span>
      <div className="flex items-center gap-1.5 rounded-card rounded-tl-md border border-gold-100 bg-gold-50/60 px-5 py-4">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="animate-breathe size-2 rounded-full bg-gold-500"
            style={{ animationDelay: `${index * 0.18}s`, animationDuration: "1.2s" }}
          />
        ))}
        <span className="ml-1.5 text-sm text-olive-600">Reading saved records…</span>
      </div>
    </div>
  );
}
