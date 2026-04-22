# MarshalHQ Pilot App

MarshalHQ is a React + Vite + Supabase web app for matching film location marshals with production teams.

This repo now targets a private MVP pilot:

- Public marketing flow lives at `/` and `/join`
- Product routes sit behind the dev gate password
- Managers can post jobs, review applicants, and complete jobs
- Marshals can build profiles, browse live jobs, apply, and leave reviews
- Private contact details unlock only after an accepted booking

## Stack

- React 18
- Vite 5
- React Router
- Supabase Auth + Postgres
- Vercel for deployment

## Local Setup

1. Install dependencies:

```bash
npm ci
```

2. Create a local env file:

```bash
cp .env.example .env.local
```

PowerShell also works:

```powershell
Copy-Item .env.example .env.local
```

3. Fill in the required variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_DEV_PASSWORD`

4. Start the app:

```bash
npm run dev
```

5. Create a production build when needed:

```bash
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Enable email/password auth.
3. Copy the project URL and anon key into your env file.
4. Run `supabase/schema.sql` in the Supabase SQL editor.

The schema file includes:

- Core tables for profiles, jobs, applications, and reviews
- RLS policies for self-service profile access and role-based writes
- A `public_profiles` view for safe public profile reads
- RPCs for booking lifecycle actions
- RPCs for matched-only contact exchange
- Rating aggregation triggers

## Core Routes

- `/` public splash page
- `/join` waitlist landing page
- `/login` auth page
- `/marshal/dashboard` marshal job feed and applications
- `/marshal/profile` marshal profile editor
- `/job/:id` shared job detail page
- `/manager/dashboard` manager job overview
- `/manager/profile` manager contact/settings page
- `/manager/post` post a new job
- `/manager/edit/:id` edit a live job
- `/manager/job/:id` review applicants
- `/review/:jobId/:userId` leave a review

## Pilot Workflow

1. Share the dev gate password with invited testers.
2. Let managers and marshals self-sign up through `/login`.
3. Ask every user to complete their profile before testing live flows.
4. Have managers post real-looking jobs and accept marshals through the applicant screen.
5. Confirm that only accepted matches can see contact details.
6. Mark finished jobs as complete and leave both-sided reviews.

## Current Guardrails

- Only live jobs can accept new applications.
- Accepting the final slot moves the job to `filled` automatically.
- When a job fills, remaining pending applications are auto-declined.
- Jobs can only be completed when at least one marshal was accepted.
- Contact details are not available through public profile reads.

## Deployment Notes

- Vercel SPA rewrites are configured in `vercel.json`.
- The frontend expects a working Supabase project before app routes will function.
- The current pilot flow assumes manual ops for payments, support, and invites beyond the dev password.
