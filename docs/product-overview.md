# North Star — Product & Frontend Overview

*A detailed reference to what North Star is, how it's built, and what state it's actually in. Written from the frontend side of the project — see [`backend-api.md`](./backend-api.md) for the API surface and [`README.md`](../README.md) for the pitch-level summary.*

**Live demo:** [north-star-taran.vercel.app](https://north-star-taran.vercel.app)
**Repo:** [github.com/Abdulmateen77/North-Star](https://github.com/Abdulmateen77/North-Star), frontend work on the `taran` branch

---

## 1. What North Star is

North Star is a care-coordination app for families looking after someone they love. The core idea: a caregiver uploads a hospital letter or prescription, the app reads it and turns it into a plan — appointments to book, medicines that changed, tasks the family can share — and the person actually receiving care gets their own simplified view of just what matters to them today.

It's built as **two separate products sharing one care space**, not one responsive app wearing two hats:

| | Caregiver app | Patient app |
|---|---|---|
| **Who** | Family members coordinating care | The person being cared for |
| **Design goal** | Convenient — fast to set things up | Minimal — fewest possible taps |
| **Entry point** | `/dashboard` | `/patient` |
| **Nav pattern** | Sidebar (desktop) / drawer (mobile), 7 destinations | Bottom tab bar, 4 destinations |

The demo runs on a single seeded scenario: **Margaret Okafor**, 78, three weeks into recovery from a hip replacement. Her daughter **Amara** is the primary caregiver; her son **David** and sister **Ruth** are also in the family circle. Every screen in the app tells a piece of that one story — the same medicines, the same discharge letter, the same six-week follow-up — so nothing feels like disconnected demo filler.

---

## 2. The two apps, screen by screen

### Caregiver app (`/dashboard`, `/care`, `/timeline`, `/documents`, `/assistant`, `/circle`, `/insights`)

- **Dashboard** — the daily briefing (an AI-voiced summary of what happened overnight, styled on the brand's dark gradient mesh), what needs attention, today's medicine schedule with a progress ring, the top 3 priorities, and trend cards for the things worth watching.
- **Care plan** (`/care`) — three tabs: **Tasks** (a to-do board with swipe-to-cross-off and tap-to-convert-to-reminder gestures), **Medicines** (each with a distinct colour so they're recognisable at a glance), and **Appointments & reminders**.
- **Timeline** — a filterable, chronological history of everything that's happened: hospital stays, medication changes, appointments, milestones, documents.
- **Documents** — drag-and-drop upload with a staged "reading it now" animation, then a plain-English summary and extracted facts for each letter.
- **Assistant** — a chat interface that answers questions about Margaret's care with citations back to the source document, and can take follow-up actions (create a task, share an update).
- **Family circle** — who's in the care circle, their role and what it lets them do, plus a shared updates feed.
- **Insights** — the weekly-summary version of the dashboard: trends over time, not just today.

**One thing worth calling out:** there used to be three different buttons that all opened the same "add a task" form (a card grid on the dashboard, a header button on the care plan, a board button). That's gone — there's now exactly **one "Add" button**, fixed in the shell, on every caregiver screen. It opens a single sheet with a segmented Task / Reminder / Medicine / Appointment picker inside it, so choosing *what* to add and filling it in happen in one place instead of two.

### Patient app (`/patient`, `/patient/health`, `/patient/assistant`, `/patient/family`, `/patient/reminders`, `/patient/emergency`)

- **Today** — the whole day on one screen: a single dominant card for the *next* thing to do (whole-card tap target, one button, no secondary controls), today's appointment shown inline, everything else in a quiet list below, and finished items folded behind a "N done today" disclosure so she's never scrolling past completed business to find what's left.
- **Health** — "About You" leads the page (nine data points: blood group, conditions, NHS number, GP, consultant, recent procedure, emergency contact — not just a name and age), then coming-up appointments, medicines (colour-coded to match the caregiver side), and letters. Tapping a letter opens the actual transcribed text alongside a plain-English explanation, in the same modal.
- **Ask** — the same assistant engine as the caregiver side, but every answer is shorter and gentler, and it explicitly hands off to a human ("that's better asked of Amara or your doctor") rather than guessing.
- **Family** — one tap to call or message anyone in the circle, plus the same shared-updates feed the caregivers see.
- **Emergency** — a 999 button, a call-your-family list, and a paramedic-facing medical summary. Reachable from a "Help" button in the header on every patient screen, not buried in a menu.

The patient app deliberately has **no onboarding, no forced intro, and a 4-item nav** (Reminders was cut as a destination — her reminders *are* the Today checklist, so a separate tab would have shown the same information twice).

---

## 3. Design system

The visual language is modelled on the **Embody** yoga-app identity (a Behance reference the design was built against), translated into a healthcare context without borrowing its layouts or illustrations — deliberately *not* the blue-and-white clinical look most healthcare software defaults to.

**Palette** — warm, not clinical:
- `bone` — the canvas (cream, not white)
- `olive` — the dark anchor (used for the AI voice and headline emphasis, never pure black)
- `clay` — the primary action colour
- `gold` / `peach` — accents and highlights
- `rose` — the one "attention" colour, kept soft enough not to read as an alarm

**Typography** — **Gabarito** (bold, tight tracking) carries almost everything; **Fraunces**, a soft serif, is reserved for exactly one emphasised word per major headline, set in italic with a hand-drawn stroke swept underneath it (the `<Emphasis>` component) — the brand's signature device, borrowed directly from the Embody reference.

**Surfaces** — four named gradient-mesh utilities (`mesh-dawn`, `mesh-rise`, `mesh-bloom`, `mesh-ignite`) replace flat fills on hero surfaces: the landing page background, the daily briefing card, the patient's "next thing to do" card, the onboarding. `mesh-ignite` (the darkest one) carries a built-in scrim so light text on top stays close to 9:1 contrast even on a narrow card — this was a real bug caught during review (dark-on-dark text on the first pass) and fixed with the scrim rather than by avoiding dark surfaces altogether.

**Motion** — everything eases with the same `cubic-bezier(0.22, 1, 0.36, 1)` curve; nothing snaps. Reduced-motion is respected globally.

**Component library** (`src/components/ui/`): `Card`, `Button`, `Badge`, `Avatar`, `Logo`, `Emphasis`, `ProgressRing`, `Sparkline`, `medicationColor` — a small, deliberately shared set rather than one-off styles per screen, so the two apps read as one product.

---

## 4. Architecture

**Stack:** Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4, TypeScript, deployed on Vercel. Backend domains (Supabase + OpenAI) are wired independently by the backend owner — see §6.

**The one seam that matters:** every screen in both apps reads data through `src/data/index.ts` — a set of async accessor functions (`getCareTasks()`, `getMedications()`, `getCareReceiver()`, etc.) currently backed by a single realistic mock dataset (`src/data/mock.ts`, ~810 lines) rather than the live API. No component imports the mock file directly. This means swapping in the real backend is a change to the *bodies* of those functions — replacing `return mock.careTasks` with a `fetch()` call — with no UI code touched. `src/data/types.ts` (~315 lines) documents the exact shape every endpoint is expected to return, and already re-exports the backend's real `User` / `CareSpace` / `CareMember` types so the two sides speak one vocabulary where they overlap.

**State that needs to persist across a page** (the care plan, reminders, medicines, appointments) lives in a single React context, `CareProvider`. It's not global state for its own sake — it exists because the "Add" button and the quick-setup sheet need to update a list that a *different* component on the *same* page is rendering, and that had to work without a page reload.

**Routing structure:**
```
src/app/
├── page.tsx                    — landing page (two doors + footer)
├── (caregiver)/                — route group, shares CaregiverShell + CareProvider
│   ├── dashboard/
│   ├── care/
│   ├── timeline/
│   ├── documents/
│   ├── assistant/
│   ├── circle/
│   └── insights/
├── patient/                    — shares PatientShell, no CareProvider
│   ├── page.tsx                — Today
│   ├── health/
│   ├── assistant/
│   ├── family/
│   ├── reminders/
│   └── emergency/
└── api/                        — backend owner's domain, untouched by this work
```

**Testing:** the backend carries 13 test files / 35 tests (`vitest`) covering the domain services — care-space, care-management, health-records, collaboration, timeline, notifications, analytics, rate-limiting. The frontend has no component test suite yet; verification has been done by driving the actual rendered app (typecheck + build + manual interaction through the browser) rather than unit tests, which is a real gap, not an oversight — see §7.

---

## 5. What's real vs. scripted

Worth being precise about, since it's easy to overstate a demo:

| Feature | Status |
|---|---|
| Task board, quick-setup sheet, swipe/tap gestures | **Real** — genuine React state, works end-to-end |
| Onboarding | **Real** UI, gated by `localStorage` (no server-side "has this account onboarded" flag, because there's no account system yet) |
| AI assistant replies | **Scripted** — keyword-matched canned responses with a simulated thinking delay, not a live model call. Citations and follow-up actions are real UI, wired to fake content. |
| Document upload → AI summary | **Simulated** — a staged progress animation and a canned "here's what changed" summary; not real OCR/AI extraction on the frontend (the backend's `health-records` domain has the real pipeline — document agent, text extraction, analysis service — but the frontend isn't calling it yet) |
| Medicine colours, "About You" fields, letter full-text | **Real**, backed by mock data written to be internally consistent (the GP named in "About You" is the same GP who prescribes her medicines and appears in her appointments) |
| Sign in | **Decorative** — the "Sign in" link goes straight to `/dashboard`. No auth exists in the backend (`grep` for `supabase.auth` or an auth domain returns nothing) |

---

## 6. Team boundary

This is a two-person hackathon project with an explicit split:

- **Frontend** (this document, the `taran` branch history): UI/UX, both apps' full screen set, the design system, the mock data layer, onboarding, deployment.
- **Backend** (owned by the repo's other maintainer): the eight domains under `src/domains/` (`ai-care-engine`, `analytics`, `care-management`, `collaboration`, `dashboard`, `health-records`, `notifications`, `timeline`), all 27 API routes under `src/app/api/`, the Supabase schema and migrations, and the real OpenAI-backed document/briefing/assistant agents.

`main` currently contains an **earlier** snapshot of the frontend (merged in before this design pass) plus the backend owner's own follow-on work (live Supabase wiring, a new logo mark). `taran` has the full redesign described here but not their latest backend/branding commits. The two branches have diverged and will need a real merge — noted here rather than resolved unilaterally, since it touches both halves of the project.

---

## 7. Honest gaps

- **No real authentication.** "Sign in" is a link, not a flow.
- **No frontend test suite.** Everything's been verified by driving the real app in a browser (screenshots, DOM checks, simulated pointer events for the swipe gesture), which catches real bugs — two were found and fixed exactly this way — but doesn't guard against regressions the way a test suite would.
- **The AI is scripted on the frontend.** The backend has real AI agents; the frontend doesn't call them yet. Wiring that up is a `src/data/index.ts` change, not a redesign.
- **Vercel deploy is a one-off, not continuous.** The live demo was pushed via the CLI from a local branch; it is not connected to GitHub, so new commits to `taran` don't automatically appear at the live URL until someone redeploys.
- **Branch divergence with `main`** (see §6) is unresolved.

---

## 8. Where things are

```
Live demo         https://north-star-taran.vercel.app
Repo              https://github.com/Abdulmateen77/North-Star
Frontend branch   taran
This doc          docs/product-overview.md
Backend API docs  docs/backend-api.md
Pitch README      README.md
```
