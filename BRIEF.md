# MarshalHQ — Project Brief

## What is MarshalHQ?
MarshalHQ is a two-sided marketplace connecting location marshals with film & TV production teams in the UK. It replaces the chaotic WhatsApp group model currently used to hire marshals at short notice.

## Current State
- **Live website:** marshalhq.com (hosted on Vercel, deployed from GitHub)
- **Tech stack:** React + Vite, deployed on Vercel
- **Repo structure:**
  - `index.html` — entry point
  - `vite.config.js` — Vite config
  - `package.json` — dependencies (React 18, Vite 5)
  - `src/main.jsx` — React root mount
  - `src/App.jsx` — entire landing page (single file)
- **Current features:**
  - Password-gated landing page (password: marshalhq2026)
  - Waitlist signup form connected to Formspree (https://formspree.io/f/xwvnydov)
  - Sections: Hero, Problem, How It Works, Both Sides, Stats, Comparison Table, Waitlist Form, Founding Member Perks, Footer
- **Domain:** marshalhq.com (registered on Namecheap, DNS pointing to Vercel)
- **Social:** @marshalhquk on Instagram, TikTok, X, LinkedIn

## Brand / Design System
- **Background:** #050508 (near black)
- **Surface 1:** #0a0a10
- **Surface 2:** #111118
- **Surface 3:** #18181f
- **Border:** #222230
- **Accent (primary):** #6366f1 (indigo)
- **Accent light:** #818cf8
- **Accent dark:** #4f46e5
- **Success/money:** #10b981 (green)
- **Warning:** #f59e0b (orange)
- **Error/urgent:** #ef4444 (red)
- **Text primary:** #f1f5f9
- **Text secondary:** #cbd5e1
- **Text muted:** #94a3b8
- **Text dim:** #64748b
- **Border radius:** 12-16px cards, 10-12px buttons
- **Font:** System font stack (-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif)
- **Style:** Dark theme, glassmorphism-influenced, modern startup aesthetic

## Two User Types

### Location Marshal (Supply Side)
- Freelance workers who manage public access, parking, security, and logistics on film/TV location shoots
- Typically earn £140-200/day
- Currently find work via WhatsApp groups
- Need: reliable job matching, reputation building, schedule management

### Location Manager (Demand Side)
- Film/TV professionals who hire marshals for production shoots
- Often need 4-8 marshals at short notice (sometimes next day)
- Currently post in WhatsApp groups and manually track responses
- Need: fast reliable access to vetted marshals, quality assurance, accountability

## MVP Features to Build (Priority Order)

### 1. Marshal Profiles
- Create/edit profile: name, photo, location, bio, day rate range, travel radius
- Certifications: SIA, CSCS, First Aid, Own Transport (toggle badges)
- Availability: Mon-Sun toggles
- Stats display: jobs completed, average rating, reliability %

### 2. Job Board
- Managers post jobs: title, production, location, date, time, rate, slots, description, requirements, urgent flag
- Marshals browse available jobs (status = "live")
- Job cards show: title, production badge, location, date, rate, urgent badge, slots remaining, manager name + rating
- Job detail page with full info and "Apply Now" button

### 3. Application Flow
- Marshal applies to job with one tap
- Manager sees list of applicants with profiles, ratings, certs, distance
- Manager can accept or decline each applicant
- Slot counter updates automatically

### 4. Ratings & Reviews
- After job completion, both sides rate each other (1-5 stars + comment)
- Ratings feed into average rating displayed on profiles
- Quick tag options: "Punctual", "Professional", "Great with public", "Hard worker", "Would rebook"

## Data Model

### User (extends auth)
- role: "marshal" | "manager"
- full_name, phone, location, bio, profile_photo
- day_rate_min, day_rate_max, travel_radius_miles
- has_sia, has_cscs, has_first_aid, has_own_transport (booleans)
- availability_mon through availability_sun (booleans)
- avg_rating, total_jobs, reliability_pct (numbers)

### Job
- title, description, requirements, location (strings)
- date (date), start_time, end_time (strings)
- day_rate, slots_needed, slots_filled (numbers)
- production_name (string), is_urgent (boolean)
- status: "live" | "filled" | "completed" | "cancelled"
- posted_by (User reference)

### Application
- job (Job reference), applicant (User reference)
- status: "pending" | "accepted" | "declined"
- applied_date (date), message (string)

### Review
- reviewer, reviewed_user (User references)
- job (Job reference)
- rating (1-5), comment (string), created_date (date)

## Pages to Build
1. `/` — Password gate (current) or public landing page
2. `/login` — Login/signup with role selection
3. `/marshal/dashboard` — Job feed + my applications
4. `/marshal/profile` — Edit profile
5. `/job/:id` — Job detail + apply
6. `/manager/dashboard` — Active jobs + stats
7. `/manager/post` — Post new job form
8. `/manager/job/:id` — Review applicants, book/decline
9. `/review/:jobId/:userId` — Leave a review

## What NOT to Build Yet
- In-app payments (use manual bank transfers for now)
- Push notifications (use email via Formspree or similar)
- GPS-based radius matching (text location is fine)
- In-app messaging (exchange numbers after booking)
- Native mobile app (responsive web is sufficient)

## Market Context
- UK film & TV production spend was £6.8 billion in 2025 (BFI data)
- 361 productions shot in the UK in 2025
- 54% of the film production workforce is self-employed
- Major productions include Harry Potter (HBO), Avengers: Doomsday, The Beatles, Narnia, Spider-Man
- No existing platform serves the location marshal niche specifically

## Key Files
- This project was initially built entirely through GitHub's browser editor
- The entire app currently lives in a single `src/App.jsx` file
- As we build the MVP, we should split into proper components and add routing (React Router)
- Backend: considering Supabase (free tier) for auth + database, or building the Bubble.io version separately

## Instructions for Claude Code
When working on this project:
1. Maintain the existing dark theme design system (colours above)
2. Keep the mobile-responsive approach (the site should work on phones)
3. Split components into separate files as we build new pages
4. Use React Router for navigation between pages
5. Prioritise getting the marshal-side experience working first (browse jobs, apply, profile)
6. Keep the code clean and well-organised — this will eventually be handed to a developer