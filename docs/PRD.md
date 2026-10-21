# GospelLift Product Requirements Document

**Version:** 0.2 · **Status:** Static Brain Activator MVP deployed from source; secure platform planned.

## Vision
Give emerging gospel musicians a welcoming, understandable path to describe their music, prepare a basic artist brief and request human-operated promotional support.

## Users
- Emerging artist who may be unfamiliar with music marketing forms or digital tools.
- Operator/admin who reviews submissions, checks rights, prepares assets and records campaign activity.
- Future approved creators/reviewers who help produce assets under controlled access.

## Current static MVP requirements
- Mobile-friendly public landing page and plain-language explanation.
- Brain Activator topic tabs for artist name, song title, genre, goal and song story.
- Examples are suggestions, not assertions; user can select or edit them.
- Generate a bio draft and promotional caption from entered facts.
- Copy/download an artist brief.
- Audio file selector may show file name/size only; must not imply upload or secure storage.
- No automatic publication; all promotional assets require artist approval.

## Full-product functional requirements
- Email/password registration, sign-in and recovery.
- Artist profile and private track submission with metadata, rights declaration and private storage.
- Artist-only submission visibility and protected admin review.
- Status workflow: Draft, Submitted, In Review, Needs Information, Approved for Campaign, In Campaign, Completed, Rejected/Withdrawn.
- Review notes, tasks, deliverables, approvals, expenses and source-backed campaign metrics.
- End-of-campaign report distinguishing work completed from outcomes observed.

## Commercial terms baseline
Proposed first package: 14 days, one artist, one lead song; ₦25,000 service fee. Advertising, influencers, radio, travel, filming, printing, distribution and other third-party costs are separate and require prior approval. Scope must be agreed in writing. No guaranteed views, streams, fame, placement or revenue.

## Acceptance criteria
- User can use the Brain Activator on mobile and desktop without account setup.
- Generated content labels unknown details and never claims unprovided awards, testimonies or collaborations.
- File picker explicitly states that the selected audio is not uploaded.
- User can copy/download the brief.
- For full-product release: two artist accounts cannot access each other's tracks; unauthenticated users cannot access private uploads; rights confirmation is required; invalid status changes are rejected; admin is server-authorized.

## Out of scope for the static MVP
Real authentication, database persistence, private uploads, payment, social auto-posting, DSP distribution, automatic music video generation and AI hit prediction.
