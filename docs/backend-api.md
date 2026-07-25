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
