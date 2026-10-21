# Secure artist platform foundation

This repository currently publishes a static GitHub Pages preview. The preview is not the secure artist platform. These files prepare a reviewed implementation path; they do not activate a Supabase project or replace deployment/configuration work.

## Included in this foundation

- `supabase/schema.sql`: Postgres tables, row-level security (RLS), private audio bucket and storage policies.
- `tests/mobile-smoke.mjs` + `.github/workflows/mobile-smoke.yml`: a real Chromium browser smoke test at a 390×844 phone viewport and a screenshot artifact.
- The existing public preview remains a planning tool until a backend-enabled application is deployed.

## Critical setup sequence

1. **Confirm the dedicated Supabase project.** Do not run this migration on an unrelated project. The currently connected Supabase account may contain other projects.
2. Apply `supabase/schema.sql` to the verified GospelLift project using a reviewed migration. Confirm all tables, RLS policies and the private `artist-audio` bucket exist.
3. Configure Supabase Auth: email confirmation, password recovery redirect URLs, allowed site URLs, and rate limits. Add an admin only by setting trusted `app_metadata.role = 'admin'` through a secure administrative path; never use client-editable `user_metadata` for authorization.
4. Integrate the secure UI in a Next.js app deployed to a host that supports its runtime. GitHub Pages only hosts static files. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as deployment environment variables. Never expose `service_role` or database credentials in client code, Git history or public build artifacts.
5. Implement and test signup, login, password reset, email confirmation, profile editing, submission create/read, private upload, signed download URLs, admin review, status changes, campaign updates and reporting.
6. Ensure each uploaded object path is `<authenticated-user-uuid>/<submission-uuid>/<filename>`. Enforce size/type limits both in Storage configuration and in the UI. The SQL currently sets a 50 MiB cap and an audio MIME allowlist; verify actual MIME handling on target browsers.
7. Review privacy/terms with the operator's real contact details and data-retention policy before collecting personal information or music.
8. Run the CI mobile smoke test, then manually test on a real iPhone and Android device. CI screenshots are useful evidence but do not replace physical-device verification.

## Security decisions and limitations

- Artist-owned records are isolated by RLS. Artist submissions are insert/read-only at table level so artists cannot self-approve by updating a status field.
- Admin checks use trusted JWT `app_metadata.role`, set only by a privileged server-side/admin path.
- Audio storage is private. Access uses authenticated storage policies and should use short-lived signed URLs when playback/download is needed.
- Campaign events and audit records are admin-only in this initial foundation. If artists later need to see selected campaign reports, add a narrowly scoped read policy.
- The SQL migration is a starting point and must be tested in a non-production project first. Review grants, auth triggers, Storage policy behavior, retention/deletion, file scanning, abuse controls and admin provisioning before launch.
- Do not upload unreleased master recordings until the backend is deployed and the access-control tests pass.

## Go-live acceptance checklist

- [ ] Verified dedicated Supabase project and region
- [ ] Migration applied and schema verified
- [ ] Auth registration, confirmation, login and password recovery tested
- [ ] Artist A cannot read Artist B's profile, submissions or audio
- [ ] Artist cannot set their own submission to approved/completed
- [ ] Non-admin cannot access admin workspace, campaign management or audit log
- [ ] Storage bucket is private and unauthenticated downloads fail
- [ ] Upload type/size, signed URL expiry, deletion and failure states tested
- [ ] Campaign records and reporting verified against test data
- [ ] Privacy/terms finalized and operator contact added
- [ ] CI mobile smoke test passes and screenshot artifact reviewed
- [ ] Physical iPhone and Android checks completed
