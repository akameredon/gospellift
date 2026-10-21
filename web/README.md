# GospelLift web application

A Next.js artist workspace backed by the dedicated GospelLift Supabase project. The static GitHub Pages preview remains separate; this application is intended for a Next.js-compatible host.

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` to `https://aadzngxabyzdiogfxoiy.supabase.co` and set `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the **publishable** key from the GospelLift project's API Keys page. Never use a `service_role` or `sb_secret_` key in browser code.
4. In Supabase Authentication URL Configuration, set the Site URL to your deployed app URL and add redirect URLs for `/auth/callback` and `/update-password` on local and deployed hosts.
5. Run `npm install`, then `npm run dev`.

## Included in this first integration

- Email/password sign-up and sign-in.
- Password reset email and password update screen.
- Private artist submission form and per-account submission list.
- Optional MP3/WAV/audio upload to the private `artist-audio` bucket, capped at 50 MiB.
- Required music-rights and processing-consent checkboxes.
- Client-side uses only Supabase's publishable key; row-level security is the security boundary for data access.

## Before production

- Configure email templates, SMTP/delivery and redirect URLs in Supabase.
- Add the environment variables to the hosting provider; never commit `.env.local`.
- Verify RLS and storage policies with two separate artist accounts and an admin account.
- Add server-side protected admin pages and controlled campaign management in a later phase. This first app does not yet expose admin operations.
- Review privacy/terms copy, contact details, retention policy and audio upload rights before accepting real users.
