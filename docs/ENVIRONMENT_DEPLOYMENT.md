# GospelLift Environment and Deployment Guide

## Current Pages preview
- Repository: akameredon/gospellift, branch main.
- GitHub Pages uses GitHub Actions.
- Static preview needs no backend secrets.
- URL: https://akameredon.github.io/gospellift/

## Full product requirements
GitHub Pages serves static files; it does not run a Next.js server or provide a database. The full authenticated/upload product needs Supabase configuration and a compatible hosting/runtime strategy, such as a Next.js host. A static frontend talking directly to Supabase still needs strict RLS and storage policies.

Before accepting real uploads: configure Supabase Auth, private storage, upload limits, reviewed schema and least-privilege policies; test two artist accounts plus a signed-out session; set secrets only in hosting environment; publish accurate privacy/terms and contact details; verify backups, deletion, retention and incident procedures.
