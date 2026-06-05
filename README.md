# Moment

> *A quiet space to pause, notice, and return to yourself.*

Moment is a full-stack TypeScript application that guides users through a structured three-minute self-reflection session. It ships as both a web app and a native mobile shell for iOS and Android.

This project was built as a portfolio piece to demonstrate end-to-end product delivery: architecture decisions, API design, database schema, authentication, mobile packaging, accessibility, and automated testing — the same concerns that matter in enterprise SaaS implementation at scale.

---

## The Problem

Most journaling and wellness apps fail at the edges of adoption. They are either too open-ended (blank page paralysis) or too prescriptive (questionnaire fatigue). Neither model produces a repeatable habit.

Moment is built around a single constraint: a session should feel like a deep breath, not a task. Three prompts. Sixty seconds of guided breathing first. No streaks, no notifications, no social layer. The feature surface is deliberately minimal — because the goal is friction reduction, not feature completeness.

This mirrors a core principle in SaaS implementation: **time-to-value is the most important metric**. Every screen that isn't necessary is a screen that delays the outcome the user came for.

---

## Stack

| Layer | Technology | Why |
|---|---|---|
| Language | TypeScript (strict) | End-to-end type safety across client, server, and shared schema |
| Frontend | React 18 + Vite | Component model, fast dev iteration, Vite's native ESM for quick builds |
| Routing | wouter (hash-based) | Hash routing is required for Capacitor's `capacitor://localhost` WebView origin — relative paths break in native shells |
| UI Components | shadcn/ui + Radix UI | Unstyled, accessible primitives owned in the codebase rather than imported from a black box |
| Styling | Tailwind CSS v3 | Custom design token system, no external theme dependency |
| Backend | Node.js + Express | Minimal surface area, easy to reason about, fast startup |
| ORM | Drizzle ORM | Type-safe queries, shared schema with the client, zero runtime magic |
| Database | SQLite (better-sqlite3) | See [Why SQLite](#why-sqlite-not-postgres) |
| Auth | Supabase (magic link) | See [Why Supabase](#why-supabase-not-roll-your-own) |
| Mobile | Capacitor v7 | See [Why Capacitor](#why-capacitor-not-react-native) |
| Validation | Zod | Single schema definition shared by client and server — no duplication, no drift |
| Testing | Playwright (E2E) | Full user journey automation at desktop and mobile viewports |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React 18)                    │
│                                                         │
│  Welcome → Expectations → Grounding → 3 Prompts        │
│       → Integration → Completion → Archive              │
│                                                         │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  SessionStore   │    │  AuthStore (Supabase)    │   │
│  │  (React context │    │  Magic link + JWT token  │   │
│  │   in-flight     │    │  stored in memory only   │   │
│  │   sessions)     │    └──────────────────────────┘   │
│  └─────────────────┘                                   │
└────────────────────────┬────────────────────────────────┘
                         │ REST over HTTPS
                         │ (relative /api in dev,
                         │  VITE_API_BASE_URL in mobile)
┌────────────────────────▼────────────────────────────────┐
│                  Server (Express)                       │
│                                                         │
│  GET/POST/PATCH/DELETE  /api/sessions                   │
│  POST                   /api/sessions/claim             │
│                                                         │
│  Zod validation on every request body                   │
│  IStorage interface — swappable persistence layer       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              SQLite via Drizzle ORM                     │
│                                                         │
│  sessions table: id, createdAt, feeling, body,          │
│  hardest, integration, ownerId, ownerName, ownerEmail   │
│                                                         │
│  WAL mode enabled — safe for concurrent reads           │
│  Self-creating table — zero migration required          │
└─────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────
Mobile path (Capacitor v7)
─────────────────────────────────────────────────────────

  vite build → dist/public → cap sync → ios/ + android/
  Native shell loads dist/public from capacitor://localhost
  API calls routed to absolute VITE_API_BASE_URL
  CORS configured on Express for WebView origins
```

**Session data flow:** The in-progress session (draft) lives in React context only — never written to `localStorage`, `sessionStorage`, `indexedDB`, or any browser storage. Refreshing during a session resets it. This is deliberate: a three-minute reflection that survives a page refresh would need to handle partial state recovery, which adds complexity with no meaningful user benefit. Completed sessions are written to SQLite server-side immediately on submission.

---

## Key Technical Decisions

### Why SQLite, Not Postgres

Most full-stack tutorials default to Postgres. For this project, SQLite is the right choice and the reasoning is instructive:

- **Single-user prototype with a known access pattern** — one writer at a time, reads vastly outnumber writes, dataset is small. SQLite in WAL mode handles this with zero infrastructure.
- **Zero operational overhead** — no connection pool to configure, no database server to manage, no environment variables beyond the file path. The storage layer creates the table on first run via `CREATE TABLE IF NOT EXISTS`.
- **Deployment simplicity** — the entire database ships as a single file. For a hosted deployment, this means one fewer managed service.
- **Drizzle ORM abstracts the difference** — the `IStorage` interface in `server/storage.ts` means swapping to Postgres is a one-file change. The schema definition in `shared/schema.ts` and all query logic remain identical.

In enterprise SaaS delivery, this maps to a real principle: **start with the simplest persistence layer that satisfies the actual requirements, not the most scalable one**. Over-engineering the database tier is one of the most common causes of implementation delays.

### Why Supabase, Not Roll-Your-Own Auth

Authentication is the highest-risk component in any application. The two most common failure modes in enterprise implementations are (1) rolling custom auth and introducing security vulnerabilities, and (2) over-engineering an auth system that becomes a maintenance burden.

Supabase was chosen for specific reasons:

- **Magic link auth eliminates password management entirely** — no password storage, no reset flows, no brute-force protection to implement. The Supabase `/auth/v1/otp` endpoint handles all of it.
- **The JWT token stays in memory** — `authStore.tsx` reads the access token from the URL hash on callback and holds it in React state. It is never written to `localStorage`. If the tab closes, the session ends. This is a deliberate security tradeoff appropriate for a personal reflection app.
- **Guest-first, auth-optional design** — users complete sessions with no auth requirement. After completion, they are gently prompted to attach an email. If they do, the `POST /api/sessions/claim` endpoint migrates their guest sessions to their verified account by matching `ownerEmail` to the Supabase `ownerId`. Auth enhances the experience — it never gates it.
- **Graceful degradation** — `isSupabaseConfigured` checks for valid env vars at startup. The entire auth flow is disabled cleanly when Supabase isn't configured. The app is fully functional without it.

Compared to alternatives: Firebase Auth would have worked but adds a heavier SDK dependency and Google lock-in. Auth0 is well-suited for enterprise but is disproportionate for a solo project. NextAuth requires Next.js. Supabase hits the right point on the capability-vs-complexity curve for this project scope.

### Why Capacitor, Not React Native

The mobile decision was between rewriting the UI in React Native or wrapping the existing web app. Capacitor won for clear reasons:

- **Single codebase** — the same React components, Tailwind styles, and API calls run in the browser and inside the native shell. No platform-specific component variants, no bridging layer between web and native UI primitives.
- **Web-first deployment** — the app is usable as a PWA before any native build is involved. Capacitor is additive, not a requirement.
- **The UX is already mobile-first** — the design was built at 375px first. There is no interaction model that requires native UI primitives (no camera, no GPS, no Bluetooth). A WebView shell is appropriate.
- **Capacitor's WebView isolation** — `capacitor://localhost` (iOS) and `https://localhost` (Android) mean the WebView has a real origin, which makes CORS and cookie behavior predictable. This required one specific decision: hash routing via `wouter` instead of HTML5 history routing, because hash URLs survive across the WebView/backend boundary without server-side routing support.

The tradeoff acknowledged: Capacitor apps cannot match native performance for animation-heavy or sensor-heavy use cases. For Moment, the only animation is the breathing pulse — a CSS `@keyframes` animation — which performs identically in a WebView.

---

## Local Setup

**Prerequisites:** Node.js 18+, npm

```bash
# Clone
git clone https://github.com/gingerella13/moment-app.git
cd moment-app

# Install
npm install

# (Optional) Configure Supabase auth
cp .env.example .env
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Leave unset to run in guest-only mode

# Start dev server
npm run dev
# http://localhost:5000
```

The SQLite database (`data.db`) is created automatically on first run.

**Production build:**

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

**Run type checks:**

```bash
npm run check
```

---

## Mobile Build

```bash
# Build web assets and sync to native projects
npm run mobile:sync

# Open in Xcode (iOS — requires macOS)
npm run mobile:ios

# Open in Android Studio
npm run mobile:android
```

For mobile builds pointing at a deployed backend, set `VITE_API_BASE_URL` before building:

```bash
VITE_API_BASE_URL=https://your-api.example.com npm run mobile:sync
```

Configure `CORS_ORIGIN` on the Express server to include `capacitor://localhost` and `https://localhost`.

Full prerequisites (Xcode, CocoaPods, Android Studio, signing certificates) are documented in [`MOBILE.md`](MOBILE.md).

---

## Accessibility

Accessibility was specified and verified as a first-class requirement:

| Decision | Implementation | Rationale |
|---|---|---|
| Keyboard navigation | All interactive elements reachable and operable via tab + enter/space | WCAG 2.1 AA requirement; also required for enterprise software procurement in many regulated industries |
| Visible focus ring | `2px outline-offset: 3px` in primary color at 55% alpha, never suppressed | Default browser outlines are suppressed by most UI resets — the focus ring was explicitly re-implemented |
| Live breath phase | `aria-live="polite"` on the Inhale/Exhale label | Screen reader users receive live updates during the 60-second grounding exercise without an intrusive `assertive` announcement |
| Animation safety | `breathe` keyframe and `settle-in` page transition fully disabled under `prefers-reduced-motion: reduce` | Required for users with vestibular disorders; also best practice for enterprise deployments on accessibility-audited platforms |
| Semantic labels | `aria-label` on the SVG logo and countdown timer | SVG and numeric-only elements have no implicit accessible name |
| Test hooks | `data-testid` on every interactive control and dynamic display element | Decouples test selectors from visual structure — tests don't break when styling changes |

---

## Testing

End-to-end tests written with Playwright cover the complete user journey in sequence:

```
Welcome -> Expectations -> Grounding (skip) -> Feeling (prompt 1)
-> Body (prompt 2) -> Hardest (prompt 3) -> Integration
-> Completion -> Signup (skip) -> Archive -> Session Detail
```

Verified: all four saved fields render correctly in Session Detail with correct labels. Zero console errors across the full flow.

QA screenshots captured at:
- Desktop: 1280 × 800
- Mobile: 375 × 812

All 11 routes covered at both viewports.

**API verification (curl):**

```bash
# Create
curl -s -X POST http://localhost:5000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"feeling":"heaviness","body":"chest","hardest":"sitting still","integration":"noticed it"}' | jq .

# List
curl -s http://localhost:5000/api/sessions | jq .

# Patch (attach account)
curl -s -X PATCH http://localhost:5000/api/sessions/1 \
  -H "Content-Type: application/json" \
  -d '{"ownerName":"Ginger","ownerEmail":"ginger@example.com"}' | jq .

# Delete
curl -s -X DELETE http://localhost:5000/api/sessions/1 | jq .
```

---

## What I Learned — Implementation Lessons for Enterprise SaaS Delivery

Building Moment end-to-end surfaced several patterns that map directly to enterprise implementation work.

**Shared schema as the source of truth eliminates entire categories of bugs.** The Zod schema in `shared/schema.ts` is consumed by both the Express request validator and the React form layer. When the schema changes, TypeScript surfaces every affected call site at compile time — not at runtime, not in production. In enterprise SaaS implementations, integration failures between client and server are one of the most common root causes of go-live delays. A shared contract removes the ambiguity.

**Auth-optional architecture accelerates adoption.** The guest-first model — complete sessions freely, attach an account later — mirrors a principle that applies at enterprise scale: **never gate the core value behind a setup step that isn't strictly necessary at that moment**. In SaaS onboarding, requiring SSO configuration, data migration, or admin approval before a user can touch the product is a leading cause of implementation stall. Moment's auth model was designed to demonstrate the opposite approach.

**The `IStorage` interface made the persistence layer swappable without touching application logic.** Defining an explicit `IStorage` interface before writing any SQL meant the storage implementation could change (SQLite today, Postgres tomorrow) without touching `routes.ts` or any client code. This is the same pattern that matters when integrating with enterprise systems — abstract the external dependency behind an interface, so a vendor change or API version upgrade doesn't propagate through the entire codebase.

**Mobile cross-origin is a first-class problem, not an afterthought.** The Capacitor WebView loads assets from `capacitor://localhost`, which is a different origin than the Express backend. CORS had to be explicitly configured and `VITE_API_BASE_URL` had to be baked into the build. In enterprise implementations, cross-origin and cross-environment issues (dev vs. staging vs. production, API gateway vs. direct service, SSO redirect URIs) are consistently underestimated. Solving it in a controlled environment first built familiarity with the failure mode.

**Documentation written for the next person, not the current one.** `HANDOFF.md` and `MOBILE.md` were written assuming the next developer has zero context. Known limitations are listed explicitly. Deployment steps are sequential and complete. Build artifacts are identified. This discipline — documenting what doesn't work as carefully as what does — is what separates implementations that transfer cleanly from ones that create ongoing support burden.

---

## Project Status

MVP complete. Tested and documented. Not deployed (see `HANDOFF.md` for deployment steps and known limitations).

**Planned V2 work:**
- Scoped archive — filter sessions by authenticated user instead of showing all
- Supabase Realtime for session sync across devices
- Offline support via service worker and sync-on-reconnect

---

## Author

**Ginger Banegas** — SaaS Implementation Professional | [LinkedIn](https://www.linkedin.com/in/gingerbanegas/) | [GitHub](https://github.com/gingerella13)
