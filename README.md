# GospelLift

GospelLift is a project for helping emerging gospel musicians organize their artist story and prepare promotional materials. **Brain Activator MVP is a static, browser-only planning aid** with guided prompts, examples, artist bio/caption drafts, and a downloadable artist brief.

## Live preview
After GitHub Pages deployment finishes, open: https://akameredon.github.io/gospellift/

## Honest status
- Available in the static preview: responsive landing page, Brain Activator prompts, suggested artist/song names, genre and goal examples, bio/caption draft generation, copy/download brief.
- Not active in this static preview: real accounts, private audio uploads, admin review, notifications, campaign database, payments, or automatic social publishing.
- Selecting an audio file only displays local file details. It is not uploaded or saved by this page.
- Privacy and terms pages are drafts and require real operator contact details and review.

## Technical direction for full product
The planned application stack is Next.js + Supabase Auth/Postgres/private Storage, with GitHub for source control. The separate starter archive must be integrated and tested before claiming the full account/upload product works. Configure Supabase and test row-level/storage policies using two artist accounts before accepting unreleased master recordings.

## Deploy
GitHub Actions builds and deploys the root static site to GitHub Pages on pushes to `main`. Repository Settings → Pages should use GitHub Actions. No secrets are required for this static preview.

## Product principles
Private by default for future uploads; human review before publication; artists approve promotional assets; disclose separate expenses; never promise guaranteed views, streams, fame, playlist placement or revenue; do not invent artist facts.

## Project documents
- `docs/PRD.md` — product requirements and acceptance criteria
- `docs/TRD.md` — technical requirements
- `docs/ARCHITECTURE.md` — system architecture and staged delivery
- `docs/SECURITY_PRIVACY_RIGHTS.md` — privacy, security, copyright and consent
- `docs/QA_RELEASE_CHECKLIST.md` — verification checklist
- `docs/ROADMAP.md` — build sequence
