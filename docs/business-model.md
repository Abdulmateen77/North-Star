# North Star — Business Model

*Written for the pitch deck. Sections map roughly one-to-one to slides — lift headings and bullets directly. Figures marked **(illustrative)** are modelled assumptions for the pitch, not measured data; figures with a citation are real, current, sourced numbers. Don't present the illustrative ones as measured in front of investors — say "modelled" out loud.*

---

## 1. The one-liner

**North Star turns a hospital letter into a family's shared care plan — and gives the person it's about a version simple enough to actually use.**

---

## 2. The problem

Family caregiving in the UK runs on WhatsApp groups, paper notes stuck to a fridge, and one person's memory.

- **5.8 million people** in the UK provide unpaid care for a family member — some measures put it as high as 7 million once under-reporting is accounted for. [Carers UK, Dec 2024](https://www.carersuk.org/media/ocxheq2c/facts-about-carers-dec-2024-final.pdf)
- That unpaid care is worth **£184.3 billion a year** to the UK — more than the entire NHS budget. [Centre for Care, 2024](https://centreforcare.ac.uk/updates/2024/11/new-report-valuing-carers-uk/)
- **2.6 million people have given up work to care** — 600 people a day. **1.2 million carers live in poverty.** [Carers UK](https://www.carersuk.org/policy-and-research/key-facts-and-figures/)

None of that is a technology problem the NHS App solves — it's built for booking appointments and ordering repeat prescriptions, not for the daughter trying to work out what her mum's discharge letter actually means, whether the new tablet clashes with an old one, and who in the family is supposed to be doing what this week.

The gap isn't "no information." It's that the information arrives as an unstructured PDF, and turning it into a plan is manual, repeated, unpaid work — done by someone who is usually already stretched thin.

---

## 3. The solution

Two apps, one shared care space:

- **Caregiver app** — upload a letter, get a plan. Tasks, medicines, appointments and timeline, shared automatically across the family circle.
- **Patient app** — the same information, radically simplified: one thing to do next, in large type, with help one tap away.

Full product detail: [`docs/product-overview.md`](./product-overview.md).

---

## 4. Market size

| | Estimate | Basis |
|---|---|---|
| **TAM** — caregiver-app category, global | $3.99B (2025) → $14.94B by 2035, ~14% CAGR *(one estimate among several; ranges $2.6B–$5.2B for 2024/25 baseline depending on source)* | Industry market research (Wiseguy Reports, DataHorizzon, Market Research Future — see sources) |
| **SAM** — UK unpaid carers with a smartphone-owning family member | ~5.8M UK carer households | Carers UK, Dec 2024 |
| **SOM** — Year 1–2 realistic reach | Low tens of thousands of care circles | **(illustrative)** — see Go-to-Market, §6 |

The category-defining comparison worth putting on a slide: **the UK NHS budget for 2023/24 was smaller than the value of unpaid care already happening for free.** That's not a market North Star is creating — it's a market that already exists, entirely off-platform, on WhatsApp and paper.

*Sources: [Verified Market Reports](https://www.verifiedmarketreports.com/product/elderly-care-apps-market/), [DataHorizzon Research](https://datahorizzonresearch.com/caregiver-app-market-46872), [WiseGuy Reports](https://www.wiseguyreports.com/reports/caregiver-app-market), [Carers UK](https://www.carersuk.org/policy-and-research/key-facts-and-figures/), [Centre for Care](https://centreforcare.ac.uk/updates/2024/11/new-report-valuing-carers-uk/).*

---

## 5. Business model

**Freemium, priced per care circle — not per seat.**

This is a deliberate choice, not a default. Care coordination is worthless to one person alone; the whole point is getting the family on the same page. Charging per seat punishes the behaviour the product depends on (inviting more people in). Pricing per *circle* means one subscriber unlocks the full family — which also makes the product self-distributing: Amara subscribes, David and Ruth get full access for free the moment they're invited, and each of them is now a warm lead for their *own* family's care circle.

Three revenue lines, phased in roughly the order they become viable:

### A. Consumer subscription (from day one)
Direct-to-family freemium. The primary revenue line early on, and the one that proves willingness to pay before anything else is built.

### B. Employer / workplace benefit (B2B2C, from ~month 6)
Sold into HR and Employee Assistance Programme (EAP) budgets as a "sandwich generation" benefit — the same budget line that already pays for mental health apps and childcare vouchers. Employers pay per-employee-per-month (PEPM); employees get it free. This is the highest-leverage channel: one HR deal distributes to thousands of employees without a single consumer acquisition cost.

### C. Care provider & health-system licensing (B2B, from ~month 18)
White-labelled or API-licensed to private care agencies (compliance logging, shift handoffs) and, longer-term, NHS Integrated Care Systems as a discharge-pathway tool — the AI document pipeline is genuinely useful to a discharge team, not just a family.

---

## 6. Pricing

| Tier | Price | Who it's for | What's in it |
|---|---|---|---|
| **Free** | £0 | Anyone trying it | 1 care circle, up to 2 caregivers, 3 AI document scans/month, 7-day timeline |
| **Family** | £7.99/mo or £69/yr *(~28% off, standard annual-discount framing)* | The primary use case | Unlimited caregivers in the circle, unlimited AI document scans, full timeline history, priority reminders, data export |
| **Care Pro** | £25/mo per client | Paid/professional carers, small agencies | Everything in Family, plus compliance logging, shift handoff notes, CQC-ready audit export, multi-client dashboard |
| **Enterprise** | Custom PEPM *(illustrative: £2–4 per employee/month)* | Employers, insurers, NHS trusts | Bulk licensing, SSO, admin reporting, dedicated onboarding |

*(illustrative)* — none of these prices have been tested with real users yet. They're anchored against comparable consumer subscriptions (Headspace ~£9.99/mo, Calm ~£8/mo) but priced slightly lower, because a meaningful share of the addressable market is in financial hardship (Carers UK: 1.2M carers in poverty). The free tier has to be genuinely useful, not a paywall trap — the whole point of this market is that it's underserved, not price-insensitive.

---

## 7. Unit economics *(illustrative — modelled, not measured)*

| Metric | Modelled value | Reasoning |
|---|---|---|
| Free → paid conversion | 6–10% | In line with consumer freemium health/wellness apps generally |
| Blended CAC | £12–20 | Low relative to typical consumer health apps because early GTM (§8) leans on partnerships and word-of-mouth within family circles, not paid acquisition |
| Gross margin | ~75–80% | SaaS-typical, main COGS is LLM inference (document analysis, briefings, assistant) — offset by caching repeated document types and using smaller models for routine extraction |
| Target LTV:CAC | >3:1 | Standard subscription-health benchmark |
| Payback period | <12 months | Achievable at the above CAC/ARPU if annual-plan mix is >30% |

The honest caveat: **there is no real usage data behind any of these numbers yet.** They're a defensible starting model, not a forecast. The right next step before quoting these to an investor is a small paid pilot to replace every row in this table with a measured one.

---

## 8. Go-to-market

**Phase 1 (0–6 months) — prove the loop, direct-to-consumer.**
Free tier ships; paid conversion validated with real families, not projections. Distribution: caregiver-community channels (Facebook groups, Carers UK forums, Mumsnet-adjacent communities), content/SEO around specific discharge-letter and condition keywords, and 2–3 informal partnerships with hospital discharge teams or GP practices willing to hand a leaflet to families at the point of discharge — the single highest-intent moment there is.

**Phase 2 (6–18 months) — employer channel.**
Package as an EAP/wellbeing benefit and sell through the HR platforms and benefits brokers that already distribute similar products. This is the channel that actually scales revenue, because acquisition cost per employee approaches zero once a company-wide deal is signed.

**Phase 3 (18 months+) — health-system integration.**
Pilot with an NHS Integrated Care System or private care agency group as a discharge-pathway tool. This phase requires clinical safety certification (DTAC / UKCA as a medical device software class, depending on final feature scope) — a real regulatory and time cost, but also the moat: once North Star is wired into a trust's discharge workflow, a new entrant can't casually replicate that relationship.

---

## 9. Competitive landscape

| | North Star | WhatsApp / paper / spreadsheets | CareZone, Lotsa Helping Hands, Cake | Abridge, Nuance DAX | NHS App |
|---|---|---|---|---|---|
| **Real incumbent?** | — | Yes — this is what 90%+ of families actually use today | Niche | No — clinician-facing | Yes, but transactional |
| **Turns a document into a plan** | Yes, automatically | No | No (manual entry) | Yes, but for clinicians' notes, not families | No |
| **Built for two different people** | Yes — caregiver + patient apps | No | No | N/A | No — one UI for everyone |
| **UK/NHS-native context** | Yes | N/A | No — US-centric | Partial | Yes |
| **Family network effect** | Yes — priced per circle | N/A (already free, that's the problem) | Weak | N/A | No |

The category's real competitor is the empty state — a family with a stack of NHS letters, a WhatsApp group called "Mum," and no plan. Every purpose-built competitor above is either US-centric, clinician-facing, or a passive filing cabinet rather than something that turns a letter into an assigned task.

---

## 10. Moat

1. **Family network effects.** Once a care circle has a few weeks of timeline, tasks and shared history in it, switching cost is high — for every member of the family, not just the one who set it up.
2. **The AI flywheel.** Every document processed sharpens extraction for that document type (discharge summaries, prescriptions, blood test formats vary by trust/pharmacy) — a generic note-taking app never builds this.
3. **Category-first UK/NHS framing.** Every serious caregiving-coordination competitor is US-insurance-centric. Being NHS-native from day one (GP, NHS number, 999/111, discharge letters, hospital trust naming) is not a cosmetic choice — it's the reason a UK family would trust this over a US import.
4. **Regulatory relationship, once earned.** A clinical-safety-certified NHS discharge-pathway integration (Phase 3) is slow and expensive to build — which is exactly what makes it defensible once it exists.

---

## 11. Traction — what's actually built today

Being precise here matters more than sounding impressive:

- **Built:** both apps, fully designed and functional on realistic mock data — dashboard, task board with swipe/tap gestures, document upload flow, AI assistant UI, timeline, family circle, patient app with its own simplified nav, onboarding. Backend: 8 domain services, 27 API routes, Supabase schema, 35 passing tests, real AI agent scaffolding for document analysis, briefings and assistant replies (`src/domains/ai-care-engine`, `src/domains/health-records`).
- **Not yet built:** the frontend isn't calling the real AI backend yet (responses are scripted for the demo); there's no authentication; no real users; no revenue; no pilot partnerships signed.
- **What's proven:** the product experience is real and testable today — [north-star-taran.vercel.app](https://north-star-taran.vercel.app) — which is more than most seed-stage healthtech decks can show. What's *not* proven is willingness to pay, retention, or clinical safety, and this deck shouldn't imply otherwise.

Full detail on what's real vs. scripted: [`docs/product-overview.md`](./product-overview.md#5-whats-real-vs-scripted).

---

## 12. The ask

What the next stage of building this actually needs:

1. **Wire the real AI end-to-end** — the backend agents exist; connecting the frontend to them is the highest-leverage next engineering step, not a rebuild.
2. **A paid pilot with 20–30 real families** — replace every number in §7 with a measured one before it goes in front of anyone who'll hold us to it.
3. **One discharge-team or GP-practice partnership** — even informal, to test the highest-intent acquisition channel identified in §8.
4. **Clinical safety guidance** — a conversation with someone who's taken a product through DTAC, before Phase 3 becomes a real roadmap item rather than a slide.

---

*Sources cited inline. Illustrative/modelled figures are marked explicitly and should be replaced with real data before this deck is shown to anyone who might rely on the numbers.*
