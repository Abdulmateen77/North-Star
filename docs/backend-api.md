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

## Domain models

- `User`
- `CareSpace`
- `CareMember`

The service layer intentionally contains only care space management logic.
