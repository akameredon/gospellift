# GospelLift Technical Requirements Document

## Static preview (current)
- HTML, CSS and vanilla JavaScript; no runtime server or third-party API required.
- Artist brief generation runs in the browser; audio file selection is not uploaded or retained by this page.
- GitHub Actions deploys root static files to GitHub Pages.
- No form data is sent to a backend in this preview.

## Full product target
- Next.js + TypeScript frontend.
- Supabase Auth, Postgres and private Storage.
- GitHub source control and CI; hosted application runtime (e.g. Vercel) for the full Next.js app. GitHub Pages cannot run server-side Next.js functionality.
- Never expose service-role credentials in browser bundles or source control.

## Security and privacy requirements
- Enforce RLS on all user data and path-aware storage rules.
- Keep master audio private by default; signed URLs only after authorization and short-lived.
- Validate uploads server-side for size/type; do not trust filename or client MIME.
- Test cross-user access with at least two accounts and a signed-out session.
- Do not send music to external AI providers without explicit informed consent and provider/retention/cost disclosure.
- Define deletion, retention, backup and incident procedures.

## Quality gates
- Typecheck/lint/build and end-to-end checks pass.
- No secrets committed; environment files ignored.
- Mobile and accessibility review; clear loading/error states.
- Verify deployment URL and Pages Actions result.
- Do not mark full-product requirements complete based only on a static landing page.
