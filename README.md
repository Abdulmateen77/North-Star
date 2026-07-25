# North Star

### The AI Operating System for Family Caregiving

> Helping families coordinate care with clarity and confidence.

---

## Overview

North Star is an AI-powered care coordination platform that helps families manage the healthcare of loved ones in one shared space.

Instead of relying on WhatsApp, phone calls, calendars, and memory, North Star turns healthcare inputs into structured, coordinated action.

---

## Core Idea

Upload a healthcare document -> AI understands it -> generates tasks -> assigns responsibilities -> keeps everyone in sync.

---

## Key Features

- AI Document Understanding (NHS letters, reports)
- Automatic Task Generation
- Family Coordination
- Real-time Care Timeline
- Daily AI Briefings
- Simple Patient Interface

---

## Agent System

North Star is built as an agentic system, not just a UI:

- Document Agent -> extracts structured data
- Planning Agent -> generates tasks
- Coordination Agent -> assigns and tracks
- Briefing Agent -> summarises daily priorities

---

## Tech Stack

- Frontend: Next.js, Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (Postgres + Realtime)
- AI: OpenAI / Claude
- Deployment: Vercel

---

## Getting Started

```bash
git clone https://github.com/Abdulmateen77/North-Star.git
cd North-Star
npm install
npm run dev
```

---

## Environment Variables

Create `.env.local`:

```env
OPENAI_API_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LOG_LEVEL=info
OPENAI_HEALTH_RECORDS_MODEL=gpt-4o-mini
OPENAI_OCR_MODEL=gpt-4o-mini
HEALTH_RECORDS_STORAGE_BUCKET=health-records
HEALTH_RECORDS_MAX_FILE_SIZE_BYTES=10485760
HEALTH_RECORDS_AI_TIMEOUT_MS=30000
```

---

## Backend Foundation

Implemented foundation code includes:

- Supabase Bearer-token authentication for API routes
- Zod environment and request validation
- Structured JSON logging
- Centralized API error handling
- Supabase server client and OpenAI client factory
- Repository and service layers for care space management
- CRUD APIs for users, care spaces, and care members
- Supabase migration for `profiles`, `care_spaces`, and `care_members`
- Health Records bounded context for healthcare document uploads, text extraction, AI analysis, normalized medical record persistence, signed retrieval URLs, and downstream domain events

See `docs/backend-api.md` for the implemented API surface.

---

## MVP Scope (Hackathon)

- Upload healthcare document
- AI extracts structured data
- Generate care plan (tasks)
- Assign responsibilities
- Display dashboard + patient view

---

## Demo Pitch

> North Star turns healthcare chaos into coordinated family action.

---

## Vision

North Star becomes the operating system for family caregiving, connecting patients, caregivers, and healthcare workflows into one intelligent system.
