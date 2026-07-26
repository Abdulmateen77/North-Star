"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { askLiveAssistant, loadLiveCareSpace } from "@/data/live";

 type Message = { id: string; author: "user" | "assistant"; body: string };

const suggestions = [
  "What is saved for today?",
  "What reminders are coming up?",
  "Who should I contact?",
];

export function PatientAssistant({ greeting }: { greeting: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", author: "assistant", body: greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [careSpaceId, setCareSpaceId] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<
    "loading" | "ready" | "empty" | "error"
  >("loading");
  const endRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  useEffect(() => {
    let cancelled = false;

    loadLiveCareSpace()
      .then((careSpace) => {
        if (cancelled) return;
        setCareSpaceId(careSpace?.id ?? null);
        setConnectionState(careSpace === null ? "empty" : "ready");
      })
      .catch(() => {
        if (cancelled) return;
        setConnectionState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted.current) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  async function send(question: string) {
    const trimmed = question.trim();
    if (trimmed === "" || thinking) return;

    hasInteracted.current = true;

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, author: "user", body: trimmed },
    ]);
    setDraft("");
    setThinking(true);

    try {
      if (careSpaceId === null) {
        throw new Error(
          connectionState === "loading"
            ? "I am still connecting to the shared care space. Please try again in a moment."
            : connectionState === "empty"
              ? "Your caregiver has not created a shared care space yet. Ask them to set one up first."
              : "I could not connect to the shared care space right now. Please try again.",
        );
      }

      const answer = await askLiveAssistant(careSpaceId, trimmed);
      setMessages((current) => [...current, { id: answer.id, author: "assistant", body: answer.body }]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          author: "assistant",
          body: error instanceof Error ? error.message : "I could not reach the live assistant right now.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col">
      <div className="flex-1 space-y-5">
        {messages.map((message) =>
          message.author === "assistant" ? (
            <div key={message.id} className="animate-fade-up flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-olive-900 text-gold-200">
                <StarMark size={18} />
              </span>
              <div className="min-w-0 flex-1 rounded-panel rounded-tl-lg border border-gold-100 bg-gold-50/60 p-5">
                {message.body.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "text-lg leading-relaxed text-pretty text-olive-800",
                      index > 0 && "mt-3",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div key={message.id} className="animate-fade-up flex justify-end">
              <p className="max-w-[85%] rounded-panel rounded-tr-lg bg-clay-500 px-5 py-3.5 text-lg leading-relaxed text-pretty text-white">
                {message.body}
              </p>
            </div>
          ),
        )}

        {thinking ? (
          <div className="animate-fade-in flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-olive-900 text-gold-200">
              <StarMark size={18} />
            </span>
            <div className="flex items-center gap-1.5 rounded-panel rounded-tl-lg border border-gold-100 bg-gold-50/60 px-5 py-4">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="animate-breathe size-2 rounded-full bg-gold-500"
                  style={{ animationDelay: `${index * 0.18}s`, animationDuration: "1.2s" }}
                />
              ))}
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 -mx-4 bg-gradient-to-t from-bone-100 via-bone-100 to-transparent px-4 pt-6 pb-4">
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => send(item)}
              className="shrink-0 rounded-pill border border-bone-300 bg-white px-4 py-2 text-base text-olive-700"
            >
              {item}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          className="flex items-end gap-2 rounded-panel border border-bone-300 bg-white p-2 shadow-soft"
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={1}
            placeholder="Ask North Star…"
            className="max-h-36 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-lg text-olive-900 placeholder:text-olive-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim() === "" || thinking}
            aria-label="Send"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-clay-500 text-white disabled:opacity-40"
          >
            <ArrowUp size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
