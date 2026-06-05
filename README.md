# Moment

**A quiet space to pause, notice, and return to yourself.**

Moment is a structured self-reflection app built as a full-stack portfolio project. It guides users through a brief, repeatable session: a 60-second breathing exercise, three focused reflection prompts, and an optional integration note — then saves the session privately for later review.

The app was designed mobile-first and ships as both a progressive web app and a native mobile shell (iOS + Android via Capacitor).

---

## The Problem It Solves

Most journaling and wellness apps are either too open-ended (blank page anxiety) or too prescriptive (endless questionnaires). Moment takes a third path: a three-minute, three-question session with a grounding exercise at the start. No gamification, no streaks, no social layer — just a quiet, repeatable practice.

The design constraint was deliberate: the app should feel like a deep breath, not a productivity tool.

---

## Live Demo

> Deployment instructions are in [`HANDOFF.md`](HANDOFF.md). A live instance can be spun up locally in under five minutes — see [Local Setup](#local-setup) below.

---

## Features

- **Guided breathing exercise** — 60-second animated breathing pulse (4s inhale / 4s exhale cycle) with a live phase label and countdown. Users can skip if they prefer to go straight to prompts.
- **Three structured reflection prompts** — "What are you feeling right now?", "Where do you feel it in your body?", "What's the hardest thing right now?" — each with optional example hints.
- **Optional integration note** — A post-prompt space to capture one insight before finishing.
- **Session archive** — Chronological list of all saved sessions with full detail view, edit, and delete.
- **Optional account attachment** — After completing a session, users are gently prompted (never blocked) to save their name and email. Previously saved guest sessions can be claimed by a verified Supabase auth user.
- **Mobile app packaging** — Capacitor wraps the web client for iOS and Android distribution with no client-side persistence changes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Routing | wouter (hash routing for Capacitor compatibility) |
| UI components | shadcn/ui + Radix UI primitives |
| Styling | Tailwind CSS v3 (custom warm-neutral design system) |
| Backend | Node.js + Express |
| Database ORM | Drizzle ORM |
| Database | SQLite via better-sqlite3 |
| Auth | Supabase (magic link + OAuth) |
| Mobile packaging | Capacitor v7 (iOS + Android) |
| Build tooling | Vite (client) + esbuild (server) |
| End-to-end testing | Playwright |
| Validation | Zod (shared schema, client + server) |

---

## Architecture

```
moment-app/
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/  # Shell, Logo, PromptScreen, shadcn/ui
│       ├── pages/       # Welcome, Grounding, 3 Prompts, Integration, Completion, Archive, SessionDetail
│       ├── lib/         # sessionStore (React context), supabase client, queryClient
│       └── index.css    # Warm-neutral design tokens, breathe keyframe
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # REST API: GET/POST/PATCH/DELETE /api/sessions
│   ├── storage.ts       # IStorage interface + SQLite implementation
│   └── static.ts        # Static file serving
├── shared/
│   └── schema.ts        # Drizzle table definition + Zod schemas (shared client/server)
├── android/             # Capacitor Android project
├── ios/                 # Capacitor iOS project
├── HANDOFF.md           # Developer handoff notes, deployment steps, known limitations
└── MOBILE.md            # Capacitor build flow, CORS configuration, app store prerequisites
```

The session draft (in-progress data) lives in React context only — a deliberate choice. Finished sessions are persisted server-side. No `localStorage`, `sessionStorage`, `indexedDB`, or cookies are used anywhere in the application.

---

## Data Model

```typescript
// shared/schema.ts
sessions {
  id          integer   PRIMARY KEY AUTOINCREMENT
  createdAt   integer   NOT NULL   // unix ms
  feeling     text      NOT NULL   // Prompt 1 response
  body        text      NOT NULL   // Prompt 2 response
  hardest     text      NOT NULL   // Prompt 3 response
  integration text      NOT NULL   // Optional reflection note
  ownerId     text                 // Supabase user ID (nullable)
  ownerName   text                 // Optional display name
  ownerEmail  text                 // Used for guest session claiming
}
```

---

## REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/sessions` | List all sessions (filter by `ownerId`, `ownerEmail`, or `guest=true`) |
| `POST` | `/api/sessions` | Create a new session |
| `GET` | `/api/sessions/:id` | Retrieve a single session |
| `PATCH` | `/api/sessions/:id` | Update a session (attach integration note or account info) |
| `DELETE` | `/api/sessions/:id` | Delete a session |
| `POST` | `/api/sessions/claim` | Claim guest sessions by email for a verified Supabase user |

All request bodies are validated against a shared Zod schema. Invalid input returns `400` with structured error details.

---

## Local Setup

**Prerequisites:** Node.js 18+, npm

```bash
# 1. Clone the repo
git clone https://github.com/gingerella13/moment-app.git
cd moment-app

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for auth
# Leave blank to run without auth (guest sessions only)

# 4. Start the development server
npm run dev
# Opens at http://localhost:5000
```

**Production build:**

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

The SQLite database (`data.db`) is created automatically on first run. No migration step required — the storage layer self-creates the `sessions` table via `CREATE TABLE IF NOT EXISTS`.

---

## Mobile (iOS / Android)

The web client is packaged as a native mobile app using Capacitor v7. The mobile shell loads the bundled frontend and communicates with a separately deployed backend.

```bash
# Build the web client
npm run mobile:build

# Sync to native projects
npm run mobile:sync

# Open in Xcode (iOS)
npm run mobile:ios

# Open in Android Studio
npm run mobile:android
```

See [`MOBILE.md`](MOBILE.md) for the full build flow, CORS configuration, and app store prerequisites.

---

## Accessibility

Accessibility was treated as a first-class requirement, not an afterthought:

- **Keyboard navigable** — all interactive elements reachable and operable via keyboard
- **Focus ring** — visible `2px outline-offset: 3px` in primary color at 55% alpha; never suppressed
- **`aria-live="polite"`** — applied to the breath phase label (`Inhale` / `Exhale`) so screen reader users receive live updates during the grounding exercise
- **`aria-label`** — applied to the logo SVG and timer countdown
- **`prefers-reduced-motion`** — the breathing animation and page settle-in transition are fully disabled for users who have requested reduced motion
- **`data-testid`** — applied to every interactive control and dynamic display element to support reliable automated testing

---

## Testing

End-to-end tests were written with Playwright and cover the full user journey:

```
Welcome -> Expectations -> Grounding (skip) -> Feeling -> Body -> Hardest
-> Integration -> Completion -> Signup (skip) -> Archive (1 entry) -> Session Detail
```

All four saved fields render correctly in Session Detail. No console errors across the full flow.

QA screenshots were captured at both desktop (1280×800) and mobile (375×812) breakpoints for every route.

API CRUD operations were verified independently via curl:
- `list` — returns empty array on fresh database
- `create` — returns the new session with generated `id` and `createdAt`
- `get` — returns the correct session by ID
- `patch` — updates `ownerName`/`ownerEmail` correctly
- `delete` — removes the session and returns 404 on subsequent get

---

## Design System

The visual design uses a custom warm-neutral palette defined as CSS custom properties — no off-the-shelf theme.

| Token | Value | Purpose |
|---|---|---|
| `--background` | HSL `40 28% 96%` | Warm paper-white surface |
| `--foreground` | HSL `30 12% 14%` | Deep ink text (never pure black) |
| `--primary` | HSL `18 28% 44%` | Muted clay accent — CTAs and focus only |
| `--muted-foreground` | HSL `30 8% 42%` | Secondary text, helper copy |

Typography uses **Source Serif 4** for prompts, headings, and the wordmark; **Inter** for all UI elements. The breathing animation (`breathe` keyframe) runs an 8-second cycle — 4s inhale, 4s exhale — across three concentric layers with staggered animation delays to create a natural pulse effect.

---

## Known Limitations

- **Single-user prototype** — no real auth scope on the archive. All sessions are visible regardless of who saved them. V2 would scope the archive to the authenticated user.
- **Fresh deploy = empty database** — SQLite is local to the server process. Redeployments start with an empty `data.db` unless the file is persisted externally.
- **Guest sessions are non-blocking** — a user can complete any number of sessions without ever signing up. The signup prompt after completion is a gentle suggestion, not a gate.

---

## Author

**Ginger Banegas** — SaaS Implementation Professional | [LinkedIn](https://www.linkedin.com/in/gingerbanegas/)
