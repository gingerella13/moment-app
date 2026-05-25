# Moment — MVP Handoff

## Project path
`/home/user/workspace/moment`

## Stack
Express + Vite + React 18 + TypeScript + Tailwind CSS v3 + shadcn/ui + Drizzle ORM + SQLite (better-sqlite3). Hash routing via wouter.

## Route map (hash routing)
- `#/` — Welcome
- `#/begin` — Expectations
- `#/ground` — 60s grounding / breathing pulse
- `#/feeling` — Prompt 1
- `#/body` — Prompt 2 (with helper examples)
- `#/hardest` — Prompt 3
- `#/integration` — "Take one slow breath" + optional reflection
- `#/complete` — Completion (Finish / Continue Reflection)
- `#/signup` — Optional mock signup (post-completion)
- `#/archive` — Chronological list of saved sessions
- `#/session/:id` — Session detail (revisit + release)

## Key files added/changed
- `shared/schema.ts` — `sessions` table (id, createdAt, feeling, body, hardest, integration, ownerName, ownerEmail) + zod schemas
- `server/storage.ts` — `IStorage` with `listSessions`, `getSession`, `createSession`, `updateSession`, `deleteSession`; safety-net `CREATE TABLE IF NOT EXISTS`
- `server/routes.ts` — `GET/POST /api/sessions`, `GET/PATCH/DELETE /api/sessions/:id`
- `client/index.html` — Title, meta, inline SVG favicon, Inter + Source Serif 4 fonts
- `client/src/index.css` — Warm-neutral palette (paper-white bg, clay primary), `breathe` and `settle-in` keyframes, `prefers-reduced-motion` overrides, quiet focus ring
- `client/src/App.tsx` — All routes registered; `SessionDraftProvider` wraps the tree
- `client/src/lib/sessionStore.tsx` — In-memory React context for the in-progress session draft (no localStorage)
- `client/src/components/Logo.tsx` — Inline SVG mark (ring + dot, using `currentColor`)
- `client/src/components/Shell.tsx` — Page shell + `Stage` (centered, spacious, settle-in)
- `client/src/components/PromptScreen.tsx` — Shared layout for the three free-text prompts
- `client/src/pages/Welcome.tsx`, `Expectations.tsx`, `Grounding.tsx`, `PromptFeeling.tsx`, `PromptBody.tsx`, `PromptHardest.tsx`, `Integration.tsx`, `Completion.tsx`, `Signup.tsx`, `Archive.tsx`, `SessionDetail.tsx`
- `client/src/pages/not-found.tsx` — Replaced default with a tone-matched empty state

## Design direction
- Warm paper background (HSL `40 28% 96%`), deep ink text (`30 12% 14%`), muted clay accent (`18 28% 44%`) used only for CTAs and focus
- Serif (`Source Serif 4`) for prompts, headings, and the wordmark; Inter for UI
- One slow breathing pulse: 8s `breathe` keyframe (4s inhale, 4s exhale), three concentric layers with phase text
- No icons in copy, no stock imagery, no decorative gradients

## Persistence model
- Sessions persisted in SQLite (`data.db` next to the server) via Drizzle
- Draft (in-progress) data lives in React context only — refresh during a session resets it (acceptable for a 3-minute moment; finished sessions are saved server-side)
- Per the brief: no use of `localStorage`, `sessionStorage`, `indexedDB`, or cookies anywhere in the app

## Accessibility / safety
- Keyboard navigable; focus-visible ring at `2px outline-offset: 3px` in primary at 55% alpha
- `prefers-reduced-motion: reduce` disables the breathing animation and the settle-in transition
- `aria-label` on logo, `aria-live="polite"` on breath phase, descriptive labels on optional inputs
- `data-testid` on every interactive control and dynamic display element

## Account / signup
- Mocked: post-completion screen shows "Save your reflections?" with optional name/email
- Submitting PATCHes the just-saved session with `ownerName`/`ownerEmail`
- Skipping is fully supported — nothing blocks the first or any subsequent session
- No real auth wired (per the brief)

## Commands run
- `cp -r template/ moment/`
- `cd moment && npm install` — 453 packages, 0 vulnerabilities
- `npm run build` — vite (client) + esbuild (server). Outputs:
  - `dist/public/index.html` (1.20 kB)
  - `dist/public/assets/index-*.css` (71.18 kB)
  - `dist/public/assets/index-*.js` (293.12 kB)
  - `dist/index.cjs` (927 KB)
- `NODE_ENV=production PORT=5050 node dist/index.cjs` for QA — `GET/POST/PATCH/DELETE /api/sessions` all verified via curl

## Testing status
- Build: passes with no errors
- API CRUD: verified via curl (list, create, get, patch, delete)
- End-to-end flow via Playwright: Welcome → Expectations → Grounding (skip) → Feeling → Body → Hardest → Integration → Completion → Signup (skip) → Archive list shows 1 entry → Session detail renders all 4 fields with correct labels. No console errors.
- QA screenshots in `qa/` at desktop (1280×800) and mobile (375×812):
  - `desktop-welcome.png`, `desktop-expectations.png`, `desktop-grounding.png`, `desktop-feeling.png`, `desktop-body.png`, `desktop-hardest.png`, `desktop-integration.png`, `desktop-completion.png`, `desktop-signup.png`, `desktop-archive.png` (empty state), `desktop-archive-populated.png`, `desktop-session-detail.png`
  - `mobile-welcome.png`, `mobile-grounding.png`, `mobile-feeling.png`, `mobile-archive.png`, `mobile-archive-populated.png`

## Known limitations
- Single-user prototype: there is no real auth; "signup" attaches an optional name/email to the most recently saved session. The Archive shows all sessions regardless of who saved them — fine for a prototype, would need scoping in V2.
- SQLite database file (`data.db`) is created in the working directory of the server process. Fresh deploys start empty.
- The brief mentions "allow one guest session before signup" — implemented as a gentle prompt after completion, but a guest can begin further sessions without ever signing up (the brief also requires we never block sessions; we kept the non-blocking interpretation).
- No drizzle migration file is shipped; the storage layer self-creates the `sessions` table on first run. Run `npm run db:push` if you prefer drizzle-kit to manage it.
- The grounding "Continue" CTA stays disabled until the 60-second timer reaches zero, but a "Skip" affordance is offered so users are never trapped (matches "you can stop anytime").

## Deployment
Not deployed (per the task). To deploy, the main agent should:
1. `npm run build` in `/home/user/workspace/moment`
2. Start the prod server on port 5000: `NODE_ENV=production node dist/index.cjs`
3. `deploy_website(project_path="moment/dist/public", site_name="moment", entry_point="index.html")`

## Mobile / cross-origin API
The frontend reads `VITE_API_BASE_URL` at build time. When set, all `/api/...`
calls go to that absolute origin; when unset, the existing relative-path
behavior (with the `__PORT_5000__` Perplexity-preview rewrite) is preserved.

The Express server enables CORS via `cors`. Configure with `CORS_ORIGIN` or
`ALLOWED_ORIGINS` (comma-separated, or `*`). In production with neither set,
cross-origin is disallowed; in dev it reflects the request origin.

See `MOBILE.md` → "Backend / API" for the full Capacitor build flow.
