# North Star Backend API

Backend foundation for the North Star care coordination platform.

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `LOG_LEVEL` (`debug`, `info`, `warn`, or `error`)

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm test
npm run typecheck
npm run build
```

## Auth

API routes expect an access token in the HTTP `Authorization` header using the Bearer scheme.

## Security controls

- Non-GET API requests are protected by a shared in-memory rate limiter through `withApiHandler`.
- The default mutation limit is 120 requests per minute per client/method/path.
- Routes can override the limiter by passing `rateLimit` options to `withApiHandler`.
- Rate limit failures return a consistent JSON error with status `429` and code `RATE_LIMITED`.
- Domain events are persisted to `audit_logs` through the shared audit event publisher.
- Audit metadata is recursively redacted for sensitive keys such as tokens, passwords, secrets, API keys, authorization headers, cookies, and sessions.
- Direct audit-log reads are owner-only via RLS; writes are performed server-side after service authorization.

## Implemented API routes

- `GET /api/health`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `DELETE /api/users/me`
- `GET /api/care-spaces`
- `POST /api/care-spaces`
- `GET /api/care-spaces/:careSpaceId`
- `PATCH /api/care-spaces/:careSpaceId`
- `DELETE /api/care-spaces/:careSpaceId`
- `GET /api/care-spaces/:careSpaceId/members`
- `POST /api/care-spaces/:careSpaceId/members`
- `GET /api/care-spaces/:careSpaceId/members/:careMemberId`
- `PATCH /api/care-spaces/:careSpaceId/members/:careMemberId`
- `DELETE /api/care-spaces/:careSpaceId/members/:careMemberId`
- `POST /api/health-records/documents`
- `GET /api/health-records/documents?careSpaceId=:careSpaceId&page=1&pageSize=20`
- `GET /api/health-records/documents/:id`
- `DELETE /api/health-records/documents/:id`
- `POST /api/health-records/documents/:id/analyze`
- `GET /api/care-management/tasks?careSpaceId=:careSpaceId`
- `POST /api/care-management/tasks`
- `POST /api/care-management/tasks/:id/complete`
- `GET /api/care-management/reminders?careSpaceId=:careSpaceId`
- `POST /api/care-management/reminders`
- `POST /api/care-management/reminders/:id/trigger`
- `POST /api/care-management/reminders/process-due`
- `GET /api/timeline?careSpaceId=:careSpaceId`
- `GET /api/timeline/feed?careSpaceId=:careSpaceId`
- `GET /api/timeline/events/:id`
- `POST /api/collaboration/invite`
- `PATCH /api/collaboration/permissions`
- `GET /api/collaboration/activity?careSpaceId=:careSpaceId`
- `GET /api/collaboration/comments?careSpaceId=:careSpaceId`
- `POST /api/collaboration/comments`
- `POST /api/assistant/chat`
- `POST /api/briefing`
- `GET /api/notifications?careSpaceId=:careSpaceId`
- `POST /api/notifications/send`
- `POST /api/subscriptions`
- `GET /api/dashboard?careSpaceId=:careSpaceId`
- `GET /api/analytics/insights?careSpaceId=:careSpaceId`

## Domain models

- `User`
- `CareSpace`
- `CareMember`
- `HealthcareDocument`
- `ExtractedMedicalRecord`
- `Appointment`
- `Medication`
- `MedicalCondition`
- `MedicalInstruction`
- `CareTask`
- `CareReminder`
- `TimelineEvent`
- `Invitation`
- `Comment`
- `Notification`
- `DailyBriefing`
- `CareInsight`

## Health Records

The Health Records bounded context is the canonical source of healthcare information inside a care space.

### Upload document

`POST /api/health-records/documents`

Multipart form data:

- `careSpaceId`: UUID
- `file`: PDF, JPG, or PNG healthcare document

Response:

```json
{
  "documentId": "...",
  "status": "uploaded"
}
```

### Analyze document

`POST /api/health-records/documents/:id/analyze`

Runs storage retrieval, OCR/text extraction, the Document Agent, AI output validation, and persistence into normalized records.

Response:

```json
{
  "documentId": "...",
  "status": "analyzed",
  "analysis": {
    "documentType": "appointment_letter",
    "summary": "...",
    "appointments": [],
    "medications": [],
    "conditions": [],
    "instructions": [],
    "confidence": 0.94
  }
}
```

### List documents

`GET /api/health-records/documents`

Required query:

- `careSpaceId`

Optional query:

- `page`
- `pageSize`
- `status`
- `documentType`
- `sortBy`: `uploadedAt`, `title`, `documentType`, `status`
- `sortDirection`: `asc`, `desc`

### Get document

`GET /api/health-records/documents/:id`

Returns document metadata, a signed original-document URL, latest AI analysis, and normalized appointments, medications, conditions, and medical instructions.

### Delete document

`DELETE /api/health-records/documents/:id`

Soft-deletes the document metadata only. Original uploads are not overwritten.

## Care Management

Care Management owns coordination work items and reminders. It does not own source medical records.

- `POST /api/care-management/tasks` creates a care task and publishes `TaskCreated` / `TaskAssigned` domain events.
- `POST /api/care-management/tasks/:id/complete` completes a task and publishes `TaskCompleted`.
- `POST /api/care-management/reminders` creates a scheduled reminder.
- `POST /api/care-management/reminders/:id/trigger` marks a reminder triggered and publishes `ReminderTriggered`.
- `POST /api/care-management/reminders/process-due` is a cron-only endpoint protected by `CRON_SECRET`. It processes due scheduled reminders, marks recent due reminders as triggered, marks stale due reminders as missed, and publishes `ReminderTriggered` / `ReminderMissed` events.

## Timeline

Timeline is an append-only event feed. Health Records, Care Management, Collaboration, and Notification actions publish strongly typed domain events that are projected into `timeline_events`.

## Family Collaboration

Collaboration supports invitations, permission updates, care-space activity, and shared comments. All operations are scoped to care-space membership.

## AI Care Engine

- `POST /api/assistant/chat` retrieves platform context before invoking the assistant agent.
- `POST /api/briefing` retrieves tasks, appointments, reminders, and timeline context before generating a daily briefing.

Agents perform reasoning only. They do not access persistence directly.

## Notifications and Realtime

Notifications are stored in `notifications`, broadcast through a `RealtimeGateway`, and exposed via `GET /api/notifications`. The current gateway is a logging adapter designed so Supabase Realtime / Firebase / APNs adapters can be added later.

## Dashboard and Analytics

- `GET /api/dashboard` returns one optimized caregiver dashboard payload.
- `GET /api/analytics/insights` returns structured, non-diagnostic observations from existing platform data.
