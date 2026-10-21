# GospelLift API and Integration Plan

## Current static preview
No backend API is used. The browser creates the artist brief locally. No audio upload, authentication, database persistence, payment, AI call or social publication occurs.

## Target future interfaces
- Auth: Supabase email/password sign-up, sign-in, sign-out and recovery.
- Artist profile: read/update authenticated user's own fields.
- Submission: create draft, validate metadata, upload private audio, finalize only after storage/database confirmation.
- Admin review: protected queue, notes, missing-information requests and valid status transitions.
- Campaign tasks: deliverables, due dates, approval state and prior expense approval.
- Reporting: metrics with source, date range and definitions.

## Safeguards
Privileged operations must validate user and role server-side. Do not add social auto-posting until official API access and platform permissions are verified. Do not send music to AI providers without informed consent and provider/purpose/retention/cost disclosure. Avoid leaking storage paths, tokens, internal notes or stack traces.
