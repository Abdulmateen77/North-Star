"use client";

import { ArrowUp, FileText, Plus, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/Avatar";
import { StarMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import type { CarePerson, ChatMessage } from "@/data/types";

/**
 * Scripted replies so the assistant is demonstrable without the AI backend.
 * Each entry matches on keywords; `replyFor` falls back to a general answer.
 * Swapping in the real thing means replacing `replyFor` with a streamed
 * response from the assistant endpoint — the message shape already carries
 * citations and follow-up actions.
 */
const scriptedReplies: Array<{
  match: string[];
  body: string;
  citations: ChatMessage["citations"];
  actions: ChatMessage["actions"];
}> = [
  {
    match: ["blood test", "bloods", "hba1c", "sugar"],
    body: "The headline is good news: Margaret's average blood sugar over the last three months has come down.\n\nHer HbA1c is 51 mmol/mol, down from 58 in April. Anything under 53 is generally where her GP wants her, so she's moved from just outside the target range to inside it. Her kidney and liver results were both normal, which matters because two of her medicines are processed by the kidneys.\n\nNothing here needs action today. Dr. Raman will go through these at the diabetes review on 6 August.",
    citations: [
      { label: "Blood test results — July", documentId: "doc-bloods" },
      { label: "Diabetes review, 6 Aug", documentId: null },
    ],
    actions: [
      { id: "a1", label: "Add to Ruth's weekly update", kind: "share" },
      { id: "a2", label: "Open the full results", kind: "open-document" },
    ],
  },
  {
    match: ["discharge", "changed", "hospital", "operation"],
    body: "Three things changed when Margaret came home on 6 July.\n\nShe started alendronic acid, 70mg once a week on Sunday mornings, to strengthen the bone around the new hip. She was given paracetamol to take as needed for pain. And she came home with a walking frame, which she's been using less over the last week.\n\nTwo follow-ups came out of the discharge letter: the six-week orthopaedic appointment, which still needs booking before 14 August, and a grab rail by the bath that occupational therapy recommended.",
    citations: [{ label: "Hospital discharge summary", documentId: "doc-discharge" }],
    actions: [
      { id: "a3", label: "Book the follow-up", kind: "create-task" },
      { id: "a4", label: "Open the discharge letter", kind: "open-document" },
    ],
  },
  {
    match: ["physio", "review", "ask", "appointment"],
    body: "Worth asking Nadia at Thursday's physio review:\n\nWhether Margaret can start walking without the frame outdoors, not just around the house. How much discomfort is normal at six weeks, so you know when to worry. Whether the morning exercise set should change now she's managing all six. And whether she can manage stairs unaccompanied yet — that's the one that decides how much cover the family needs.",
    citations: [
      { label: "Physiotherapy exercise plan", documentId: "doc-physio" },
      { label: "Physiotherapy — session 4", documentId: null },
    ],
    actions: [{ id: "a5", label: "Save these as a task", kind: "create-task" }],
  },
  {
    match: ["ruth", "summary", "summarise", "week", "update"],
    body: "Here's this week for Ruth:\n\nMargaret is doing well. Her blood tests came back on Thursday and her blood sugar has improved since April — it's now in the range her GP wants. Her blood pressure has settled since the medication change earlier this month.\n\nShe walked to the front gate without her frame on Tuesday, which is the first time since the operation. Physio is Thursday and David is driving her.\n\nNothing to worry about, and nothing she needs from you beyond the usual Sunday call.",
    citations: [
      { label: "Blood test results — July", documentId: "doc-bloods" },
      { label: "Timeline, 22 July", documentId: null },
    ],
    actions: [{ id: "a6", label: "Send to the family circle", kind: "share" }],
  },
  {
    match: ["medicine", "medication", "ramipril", "taking", "drugs"],
    body: "Margaret currently takes five medicines.\n\nEvery day: Metformin 500mg twice, with breakfast and dinner, for blood sugar. Ramipril 5mg each morning for blood pressure — the dose was doubled on 10 July. Atorvastatin 20mg at bedtime for cholesterol.\n\nOnce a week: alendronic acid 70mg on Sunday mornings, sitting upright for half an hour afterwards.\n\nAs needed: paracetamol 500mg, up to twice a day, if the hip aches.\n\nOne thing to flag — the Ramipril is down to about nine days, and repeats at Elmwood usually take three working days.",
    citations: [{ label: "Repeat prescription — updated", documentId: "doc-prescription" }],
    actions: [{ id: "a7", label: "Order the repeat prescription", kind: "create-task" }],
  },
];

function replyFor(question: string): Omit<ChatMessage, "id" | "timeLabel"> {
  const normalised = question.toLowerCase();
  const hit = scriptedReplies.find((entry) =>
    entry.match.some((keyword) => normalised.includes(keyword)),
  );

  if (hit !== undefined) {
    return {
      author: "assistant",
      body: hit.body,
      citations: hit.citations,
      actions: hit.actions,
    };
  }

  return {
    author: "assistant",
    body: "I've looked through Margaret's records but I don't have enough to answer that confidently.\n\nI can tell you about her medicines, her recent blood tests, what changed after the operation, or what's coming up in the next few weeks. If it's clinical and urgent, Elmwood Surgery is on 020 7946 0330, or NHS 111 out of hours.",
    citations: [],
    actions: [],
  };
}

const actionIcons = {
  "create-task": Plus,
  "create-reminder": Plus,
  "open-document": FileText,
  share: Share2,
} as const;

export function AssistantView({
  initialMessages,
  suggestions,
  user,
}: {
  initialMessages: ChatMessage[];
  suggestions: string[];
  user: CarePerson;
}) {
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

  function send(question: string) {
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

    // A beat of latency — instant answers read as canned rather than considered.
    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, timeLabel: now, ...replyFor(trimmed) },
      ]);
      setThinking(false);
    }, 1100);
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
            placeholder="Ask anything about Margaret's care…"
            aria-label="Ask the assistant"
            className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3.5 py-2.5 text-olive-900 placeholder:text-olive-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={draft.trim() === "" || thinking}
            aria-label="Send"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-clay-500 text-white transition duration-200 hover:bg-clay-600 disabled:opacity-40"
          >
            <ArrowUp size={18} />
          </button>
        </form>

        <p className="mt-2.5 text-center text-xs text-olive-400">
          North Star helps you understand Margaret&apos;s records. It isn&apos;t medical advice —
          for anything urgent, call your GP or NHS 111.
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

        {message.actions.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {message.actions.map((action) => {
              const Icon = actionIcons[action.kind];
              return (
                <button
                  key={action.id}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-pill border border-bone-300/70 bg-white px-3.5 py-2 text-sm font-medium text-olive-800 transition duration-200 hover:-translate-y-0.5 hover:border-clay-300 hover:text-clay-700"
                >
                  <Icon size={14} className="text-clay-500" />
                  {action.label}
                </button>
              );
            })}
          </div>
        ) : null}

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
        <span className="ml-1.5 text-sm text-olive-600">Reading Margaret&apos;s records…</span>
      </div>
    </div>
  );
}
