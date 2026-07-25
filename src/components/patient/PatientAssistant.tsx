"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";

type Message = { id: string; author: "user" | "assistant"; body: string };

/**
 * Margaret's assistant. Same engine as the caregiver's, but the answers are
 * shorter, gentler, and never hand her a decision she'd need a clinician for.
 */
const replies: Array<{ match: string[]; body: string }> = [
  {
    match: ["medicine", "medication", "tablet", "pill", "take"],
    body: "You take three medicines every day.\n\nIn the morning with breakfast: Metformin and Ramipril. With your dinner: Metformin again. And one at bedtime: Atorvastatin.\n\nOn Sunday mornings you also take Alendronic acid, and you need to stay sitting up for half an hour afterwards.",
  },
  {
    match: ["physio", "exercise", "exercises", "walk"],
    body: "Your physio exercises are six short movements, about ten minutes, best done in the morning.\n\nThe first four you do sitting down. The last two you do standing, holding onto something steady.\n\nIf anything feels sharp rather than achy, stop and let Nadia know at your next session.",
  },
  {
    match: ["appointment", "next", "coming up", "when"],
    body: "Your next appointment is physiotherapy with Nadia on Thursday 30 July at half past ten, at Rowan Community Clinic.\n\nDavid is driving you. Bring your walking frame and your exercise sheet.",
  },
  {
    match: ["hip", "operation", "surgery", "recovery", "pain"],
    body: "You had your hip replaced on the 2nd of July, and you came home four days later. You're three weeks into recovery now, and you're doing well — you walked to the front gate without your frame this week.\n\nSome aching is normal at this stage. If the pain is sharp or new, ring the surgery on 020 7946 0330.",
  },
  {
    match: ["blood", "test", "results", "sugar"],
    body: "Your recent blood test came back well. Your blood sugar has come down since April and is now where Dr. Raman wants it.\n\nThere's nothing in the results you need to do anything about. Dr. Raman will talk you through them on the 6th of August.",
  },
];

function replyFor(question: string): string {
  const normalised = question.toLowerCase();
  const hit = replies.find((entry) => entry.match.some((k) => normalised.includes(k)));

  return (
    hit?.body ??
    "I'm not sure about that one, and I'd rather not guess.\n\nAmara or David would know — you can ring them from the Family page. If it's about how you're feeling, the surgery is on 020 7946 0330, or you can call 111."
  );
}

const suggestions = [
  "What medicines do I take today?",
  "When is my next appointment?",
  "How do I do my exercises?",
];

export function PatientAssistant({ greeting }: { greeting: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", author: "assistant", body: greeting },
  ]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const hasInteracted = useRef(false);

  // Only follow the thread after Margaret has asked something — scrolling on
  // mount would hide the greeting she's meant to read first.
  useEffect(() => {
    if (!hasInteracted.current) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, thinking]);

  function send(question: string) {
    const trimmed = question.trim();
    if (trimmed === "" || thinking) return;

    hasInteracted.current = true;

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, author: "user", body: trimmed },
    ]);
    setDraft("");
    setThinking(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, author: "assistant", body: replyFor(trimmed) },
      ]);
      setThinking(false);
    }, 1000);
  }

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] flex-col">
      <div className="flex-1 space-y-5">
        {messages.map((message) =>
          message.author === "assistant" ? (
            <div key={message.id} className="animate-fade-up flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-plum-100 text-plum-500">
                <StarMark size={18} />
              </span>
              <div className="min-w-0 flex-1 rounded-panel rounded-tl-lg border border-plum-100 bg-plum-50/60 p-5">
                {message.body.split("\n\n").map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "text-lg leading-relaxed text-pretty text-ink-800",
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
            <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-plum-100 text-plum-500">
              <StarMark size={18} />
            </span>
            <div className="flex items-center gap-1.5 rounded-panel rounded-tl-lg border border-plum-100 bg-plum-50/60 px-5 py-4">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className="animate-breathe size-2.5 rounded-full bg-plum-400"
                  style={{ animationDelay: `${index * 0.18}s`, animationDuration: "1.2s" }}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      {/* --- Composer --------------------------------------------------------- */}
      <div className="sticky bottom-0 -mx-5 bg-gradient-to-t from-cream-100 via-cream-100 to-transparent px-5 pt-5 pb-2">
        {messages.length === 1 ? (
          <div className="mb-3 space-y-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => send(suggestion)}
                className="block w-full rounded-panel border border-sand-300/70 bg-white px-5 py-3.5 text-left text-base text-ink-800 shadow-soft transition duration-200 hover:border-clay-300 active:scale-[0.99]"
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
          className="flex items-center gap-2 rounded-panel border border-sand-300/70 bg-white p-2 shadow-soft focus-within:border-clay-300"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask me anything…"
            aria-label="Ask the assistant"
            className="min-h-12 flex-1 bg-transparent px-3.5 text-lg text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim() === "" || thinking}
            aria-label="Send"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-clay-500 text-white transition hover:bg-clay-600 disabled:opacity-40"
          >
            <ArrowUp size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
