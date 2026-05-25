# Moment — Mobile (Capacitor)

Moment is packaged for iOS and Android using [Capacitor](https://capacitorjs.com/).
The mobile app is a thin native shell that loads the same Vite-built web client
(`dist/public`) and talks to the same backend REST endpoints over HTTPS.

- **App ID / Bundle ID:** `com.moment.app` (placeholder — change before publishing)
- **App name:** `Moment`
- **Web dir:** `dist/public`
- **Capacitor config:** `capacitor.config.ts`

> Mobile packaging is wrapper-only at this step. We have **not** introduced any
> client-side persistent storage (no `localStorage` / `sessionStorage` /
> `indexedDB` / native Preferences). All persistence remains server-side.

---

## Local setup

### 1. Install JS dependencies

```bash
npm install
```

### 2. Configure Supabase env vars

Copy `.env.example` to `.env` and fill in your Supabase values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`.env` is gitignored. **Do not commit Supabase keys.**

### 3. Run the web app (for development)

```bash
npm run dev
```

The web app runs on the Express server (default port 5000) and hot-reloads via Vite.

---

## Mobile workflow

### Build web assets and sync to native projects

```bash
npm run mobile:sync
```

This runs `vite build` (output goes to `dist/public`) and then `npx cap sync`,
which copies the build into `ios/App/App/public/` and
`android/app/src/main/assets/public/`, and updates native plugins.

### Open the iOS project (requires macOS + Xcode)

```bash
npm run mobile:ios
```

Equivalent to `npx cap open ios`. Opens `ios/App/App.xcworkspace` in Xcode.

### Open the Android project (requires Android Studio)

```bash
npm run mobile:android
```

Equivalent to `npx cap open android`. Opens the `android/` Gradle project in
Android Studio.

### Recreating a native platform from scratch

If `ios/` or `android/` is deleted (or you want a clean regeneration):

```bash
npm run mobile:add:ios       # or: npm run mobile:add:android
npm run mobile:sync
```

---

## App-store prerequisites

### iOS

- macOS with **Xcode 15+** installed.
- **CocoaPods** (`sudo gem install cocoapods` or `brew install cocoapods`).
  Capacitor will warn and skip the `pod install` step on environments without it.
- An **Apple Developer Program** membership ($99/year) for distribution.
- In Xcode: set the team, signing certificate, and a real bundle identifier
  (replace the `com.moment.app` placeholder).
- Update `ios/App/App/Info.plist` with any usage descriptions required by the
  features you enable (we currently use none, so this is a no-op).

### Android

- **Android Studio** (latest stable) with the Android SDK and a JDK 17+.
- A **Google Play Developer** account ($25 one-time) for distribution.
- In Android Studio: configure a signing key for release builds and update
  `android/app/build.gradle` `applicationId` if you change from `com.moment.app`.

### Backend / API

The mobile shell loads the bundled `dist/public` and calls `/api/...` paths.
For a production build that runs without `npm run dev`, you need to either:

1. Point the client at an absolute backend URL (and configure CORS on the
   server), **or**
2. Serve `dist/public` from the same origin as the API (recommended for the
   web build) and run the mobile app against that public origin.

This is **not configured yet** — the current mobile build is suitable for local
verification only. Wire this up before submitting to either app store.

---

## What's committed vs. ignored

Committed:

- `capacitor.config.ts`
- `ios/` (native Xcode project sources)
- `android/` (native Gradle project sources)
- `MOBILE.md` (this file)

Ignored (see `.gitignore`):

- `dist/`, `node_modules/`, `.env`, SQLite data files, `qa/`
- `ios/App/App/public/` and `android/app/src/main/assets/public/` (regenerated
  by `cap sync` from `dist/public`)
- iOS `Pods/`, `build/`, `xcuserdata/`, `DerivedData/`
- Android `.gradle/`, `build/`, `local.properties`, `.idea/`
