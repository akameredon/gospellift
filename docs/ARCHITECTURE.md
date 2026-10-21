# GospelLift System Architecture

## Current deployed preview
Browser → static GitHub Pages files → local-only Brain Activator. Bio/caption drafts and selected-file metadata are processed in the browser. There is no database, login service or audio upload endpoint in this preview.

## Target production architecture
Artist browser → hosted Next.js app → Supabase Auth → Postgres metadata with row-level security → private Supabase Storage. Protected admin workspace handles review, consent, tasks, approved deliverables and campaign reporting. Human approval is required before publication.

## Staged delivery
1. Publish and test the static Brain Activator.
2. Configure secure account, database, private storage and email.
3. Integrate the Next.js starter into a host that supports its runtime, or design an explicitly static client-only Supabase frontend with appropriate constraints.
4. Add admin role enforcement, status workflow and consent/audit records.
5. Test isolation, upload failures, deletion, approvals and reporting.
6. Add optional AI/social integrations only after consent, official API permissions and costs are verified.

## Boundaries
Public browser is untrusted. Never trust client-side admin flags or user IDs. External social platforms and AI providers require separate permissions and clear disclosure.
