# North Star — Submission Summary

**Tagline:** North Star turns a hospital letter into a family's shared care plan — and gives the person it's about a version simple enough to actually use.

**Live demo:** [north-star-taran.vercel.app](https://north-star-taran.vercel.app)
**Repo:** [github.com/Abdulmateen77/North-Star](https://github.com/Abdulmateen77/North-Star)

---

## Inspiration

It started with a conversation, not a statistic. We reached out to a friend whose grandparents don't live nearby — they're a real distance away, not down the road — and asked how the family keeps up with how they're doing. The honest answer was: they mostly don't. Nobody's there day-to-day to notice a missed appointment or a change in how they're coping, and there's no shared record anyone in the family can check — just occasional phone calls and whoever last happened to visit filling everyone else in from memory.

That's not a niche problem. 5.8 million people in the UK provide unpaid care for a family member — worth £184.3 billion a year to the economy, more than the entire NHS budget — and most of it, near or far, runs on WhatsApp groups, paper notes on the fridge, and one person's memory. Being physically distant just makes the gap worse: there's no fridge to see the note on.

We built North Star around two people who are often not in the same room: a caregiver holding a discharge letter, trying to work out what actually changed and what happens now, and family further away who just want to know how things are going without having to ask. It's why the demo's family circle includes someone in exactly that position — a sister who lives apart and checks in through the shared timeline rather than being there in person — not as an edge case, but because that's who this needs to work for.

## What it does

North Star is two apps sharing one care space, not one app trying to serve two very different people:

- **The caregiver app** — upload a letter, get a plan. It reads the document, extracts what changed (new medicines, follow-ups needed, discharge instructions), and turns it into tasks the whole family can see and share. A daily AI briefing summarises what happened overnight; a shared timeline holds the full history; a task board lets you swipe to cross something off or tap to turn a one-off task into a standing reminder.
- **The patient app** — the same information, radically simplified. One thing to do next, in large type, on one screen. No dashboards, no menus to dig through — help is one tap away, and finished tasks fold out of the way instead of piling up.

Everything in both apps is grounded in one coherent story — Margaret, three weeks out from a hip replacement, and the family coordinating her recovery — so nothing in the demo feels like disconnected filler.

## How we built it

Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, Supabase (Postgres), OpenAI, deployed on Vercel.

The backend is organised into 8 domain services (care management, health records, AI document/briefing/assistant agents, collaboration, timeline, notifications, analytics) behind 30 API routes, with 62 passing tests. The frontend reads every screen through a single data-access seam (`src/data/index.ts`), so the entire UI was built and fully verified against a realistic mock dataset while the backend was built independently — and reconnecting the two is a contained, well-defined piece of work rather than a rewrite.

The design system is a warm, non-clinical departure from the blue-and-white default most healthcare software reaches for — a bone-and-olive palette, a serif emphasis device on headlines, and soft gradient-mesh surfaces rather than flat fills, modelled on a wellness-brand identity rather than a hospital one.

## Challenges we ran into

- **A CSS grid bug that only showed up on a phone.** Every multi-column layout used `grid ... lg:grid-cols-2` with no base column count — harmless when content happened to be narrow enough, but on the dashboard's two densest cards it silently let the browser size the column to content instead of the viewport, spilling ~55px off the right edge. Fixed everywhere it appeared (8 places), not just the one flagged.
- **A React 18 dev-mode gotcha that duplicated data.** A "convert task to reminder" action called one state setter from inside another's functional updater — invisible in normal testing, but React's Strict Mode purity check re-runs that outer updater in development, silently duplicating the reminder every time. Only caught by actually dispatching synthetic pointer events end-to-end and checking the result, not by reading the code.
- **Two people, two branches, one app.** Frontend and backend were built in parallel on diverged branches. Reconciling them safely under time pressure meant identifying which files genuinely overlapped (a handful) versus which were purely additive (dozens) — and pulling in the safe half without risking the one thing that already worked.
- **Designing for two audiences without it becoming two products.** The caregiver app needed to be convenient — fast to set things up, information-dense. The patient app needed to be the opposite — one decision at a time, fewest possible taps. Keeping both feeling like *one* piece of software meant a shared design system doing a lot of the work the UI structure deliberately didn't.

## Accomplishments we're proud of

- A genuinely complete, navigable product — not a single polished screen surrounded by placeholders. Both apps, full feature sets, working end-to-end on realistic data.
- A backend built to real production shape (domain-driven, tested, migration-managed) rather than hackathon-glued.
- Being honest about what's real. The AI is scripted on the frontend today; we said so, everywhere, rather than letting the demo imply otherwise.

## What we learned

That the hardest design problem here wasn't any individual screen — it was resisting the urge to give the patient app the same power-user density as the caregiver app "for consistency." The right answer was almost always to cut, not add, on that side.

## What's next

1. Wire the frontend to the real backend AI (the hardest part — the backend architecture — is already built).
2. A small paid pilot with real families to replace every modelled assumption with a measured one.
3. A hospital discharge-team or GP-practice partnership, to test the highest-intent moment for the product to actually reach someone.
4. Clinical safety guidance ahead of any NHS-integration ambitions.

## Built with

`nextjs` `react` `typescript` `tailwindcss` `supabase` `postgresql` `openai` `vercel` `vitest`
