# WAHDATH — Your Muslim Companion

A digital companion for Muslims in Sri Lanka: prayer times, Qur'an, and
everyday Islamic tools. This is the React + Vite + Tailwind rebuild of the
original static prototype, following the architecture in the WAHDATH master
spec.

## Running it

```
npm install
cp server/.env.example server/.env
cd server && npm install && npx web-push generate-vapid-keys && cd ..
# paste the generated keys into server/.env (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY),
# and add your ANTHROPIC_API_KEY there too if you want Ask WAHDATH's explanations

npm run dev         # frontend only (Ask WAHDATH + Adhan notifications will show "not configured")
npm run dev:server  # backend only, on http://localhost:8787
npm run dev:full    # both together

npm run build       # production build (outputs to dist/)
npm run preview     # preview the production build (static parts only — see Deployment below)
```

## What changed from the original prototype

The original `app.js` did an **exact date match** against the timetable. The
uploaded timetable only has an entry every ~5 days (79 rows for the year), so
the countdown silently broke ("No source row for this date") on 4 out of 5
days. `src/services/prayerEngine.js` now **interpolates between the nearest
surrounding rows** when there's no exact entry, and falls back to the nearest
edge row outside the dataset's range instead of failing.

While testing the rebuilt engine I also introduced and then caught a real bug
of my own: `buildNextPrayer` was treating "minutes since midnight" (e.g. 273)
as if it were fractional hours, which could roll the countdown target
forward by days. Fixed and covered by the sanity checks below.

Also fixed/hardened:
- Next-prayer calculation now correctly rolls from Isha into **tomorrow's**
  Fajr, and never shows a negative countdown.
- The Eastern Province −6 minute adjustment is centralized in one place
  (`PROVINCE_ADJUSTMENTS` in `prayerEngine.js`) and always normalizes to a
  valid `HH:MM`, so it can never produce something like `24:05` or `-02:10`.
- Location data (`src/data/locations.json`) already had all 9 provinces and
  all 25 districts from the original project — just with short town lists,
  which are easy to extend.

## Architecture

```
src/
  components/   Layout, nav, prayer/location UI, NotificationSettings
  pages/        One file per route (Home, Prayer, Quran, SurahDetail, Hadith, Ramadan, ...)
  services/     prayerEngine.js, locationService.js, quranService.js, hadithService.js — pure logic, no UI
  hooks/        useNow, useNextPrayer, useQuranData, useHadithData
  context/      Theme, user location, prayer data (base vs admin override)
  utils/        hijri.js, qibla.js, csvImport.js, storage.js, pushNotifications.js
  data/         BASE DATA — locations.json, prayer-times-colombo-2026.json, quran-surahs.json (index)
  sw.js         Custom service worker source — Workbox precaching + real push/notificationclick handling
public/
  quran/        The full Qur'an dataset (quran-en.json, ~2.4MB) + its ATTRIBUTION.md and license —
                 fetched lazily by the browser, never bundled into the main JS chunk
  hadith/       An-Nawawi's Forty Hadith (nawawi-40-full.json, CC BY 4.0) + ATTRIBUTION.md
server/         Express backend — the only place API keys are used (section 42)
  retrieval.js              Keyword search over public/quran/quran-en.json — no LLM involved
  claude.js                 The single call to the Claude API, strictly scoped to retrieval's ayahs
  index.js                  Routes: POST /api/ask, notification subscribe/unsubscribe/vapid-key
  notificationScheduler.js  Ticks every 20s, reuses src/services/prayerEngine.js directly, sends
                             real web push at each subscriber's chosen prayers/offsets
  subscriptionStore.js      File-backed store for push subscriptions + preferences (swap for a real
                             DB in production — see section 41's suggested schema)
  webpush.js                VAPID configuration wrapper
```

`context/PrayerDataContext.jsx` keeps the **shipped base timetable** and any
**admin-imported override** clearly separate, per the spec's requirement not
to conflate base data with location-specific/admin data. Importing a new CSV
from the Admin page never mutates the original file — it stores a versioned
override (with an import timestamp) that can be reverted.

The notification scheduler importing `prayerEngine.js` directly from `src/`
(rather than duplicating the logic) is deliberate: the server can never
compute a different "next prayer" than what the app displays, because
they're the same code.

## What's fully implemented

- Prayer engine: next-prayer + live countdown, today's prayer statuses,
  date navigation, monthly calendar (table on desktop, cards on mobile)
- Province → District → City selector over the full 25-district dataset
- Eastern Province adjustment (configurable, Settings can also override
  manually)
- **Qur'an**: all 114 surahs, 6,236 ayahs, Uthmani Arabic + Saheeh
  International translation. Surah browser, full-text search (surah name,
  ayah number, or translation keywords), bookmarks, last-read position,
  font-size control, translation toggle, copy and share — see "Qur'an data"
  below for sourcing/licensing.
- **Ask WAHDATH (AI assistant)**: a real retrieval-then-explain pipeline.
  `server/retrieval.js` keyword-searches the full 6,236-ayah dataset — no
  LLM involved in that step, so it's impossible for it to surface a verse
  that doesn't exist. Only the ayahs it finds are then passed to Claude
  (`server/claude.js`) with a system prompt that forbids it from discussing
  anything else, issuing rulings, or claiming certainty beyond the given
  translations. If the model call fails or no API key is configured, the
  endpoint still returns the real verses with an honest "explanation not
  available" note instead of breaking.
- Qibla finder: real bearing/distance calculation to the Kaaba, with device
  orientation where the browser supports it and a graceful fallback where
  it doesn't
- Tasbih counter with presets, custom goals, vibration, persistence
- **Ramadan**: Suhoor/Iftar live countdown from real prayer data, approximate
  Hijri-based Ramadan detection, a full estimated-month Suhoor/Iftar
  calendar, and the commonly recited Iftar dua (labeled as traditional
  practice, not a specific graded hadith citation)
- **Hadith**: search over An-Nawawi's Forty Hadith (42 hadith, full Arabic +
  English, CC BY 4.0) — see "Hadith data" below for sourcing/licensing
- **Adhan notifications**: real Web Push, working even when the app/tab is
  closed — see "Adhan notifications" below for how it's wired
- Admin CSV import with row-level validation (bad dates, bad times,
  duplicates, missing columns) and clear error reporting
- Light/dark/system theme, guest-mode local persistence, PWA manifest +
  custom service worker with offline caching of the JSON data files
- Onboarding flow, Settings, Profile, About

## Qur'an data — sourcing and licensing

- **Arabic text**: Uthmani script, from The Noble Qur'an Encyclopedia
  (quranenc.com)
- **English translation**: Saheeh International (Umm Muhammad), sourced via
  Tanzil.net
- **Packaged by**: the [`quran-json`](https://github.com/risan/quran-json)
  npm package
- **License**: CC BY-SA 4.0 — full text in
  `public/quran/LICENSE-quran-data.txt`, summary in
  `public/quran/ATTRIBUTION.md`

This is real, named, licensed source text — not AI-generated and not
paraphrased. Every screen that shows a verse also shows this attribution.

## Ask WAHDATH — how it actually works

```
User question
  → server/retrieval.js: keyword search over all 6,236 ayahs (no LLM)
  → top ~5 matches, with surah/ayah numbers, Arabic, and translation
  → server/claude.js: Claude is shown ONLY those ayahs + the question
  → Claude writes a short explanation, forbidden from citing anything
    else, forbidden from issuing rulings
  → response returns: the real verses (always) + the AI explanation
    (labeled as AI-generated, degrades to "not available" on failure)
```

To enable it: copy `server/.env.example` to `server/.env` and set
`ANTHROPIC_API_KEY`. The key is read with `dotenv` and never leaves the
Node process — the frontend only ever talks to `/api/ask` on your own
server (see `vite.config.js`'s dev proxy for local development).

## Hadith data — sourcing and licensing

While researching a full Hadith corpus (Bukhari, Muslim, and the other
canonical collections), the realistic options were either unlicensed
scrapes with no explicit redistribution rights, or a dataset licensed
AGPL-3.0 — usable, but its network-copyleft clause would legally require
this whole app to be open-sourced under AGPL if shipped as-is with it. A
real tradeoff, worth deciding deliberately rather than inheriting by
accident.

So instead, `public/hadith/nawawi-40-full.json` ships with **An-Nawawi's
Forty Hadith** — 42 hadith (by scholarly convention), full Arabic text,
full English translation, and narrator chains — packaged by the
[`@kazishariar/nawawi-40-hadith-data`](https://www.npmjs.com/package/@kazishariar/nawawi-40-hadith-data)
npm package under **CC BY 4.0** (confirmed on the npm registry). This is
one well-established, clearly licensed collection, not the full canonical
corpus. Details in `public/hadith/ATTRIBUTION.md`, along with the
recommended path for adding a complete dataset later (the official
Sunnah.com API).

## Adhan notifications — how they actually work

This needed real infrastructure, not a foreground `setTimeout` (which stops
the moment the tab or app closes):

```
Browser: request Notification permission → subscribe via the Push API
  (using the server's VAPID public key) → send the subscription + chosen
  prayers/offsets to POST /api/notifications/subscribe

Server (every 20s): notificationScheduler.js reuses the SAME
  src/services/prayerEngine.js the frontend uses → for each subscriber,
  checks whether any enabled prayer (minus their offset) falls in the
  current tick → sends a real Web Push notification via VAPID

Service worker (src/sw.js): 'push' event → shows the OS-level notification,
  even if the app/tab is fully closed. 'notificationclick' → focuses or
  opens the app to the Prayer page.
```

To enable it: generate a VAPID keypair (`npx web-push generate-vapid-keys`
from inside `server/`) and put both keys in `server/.env`. Without them,
the scheduler logs a warning and stays idle, and Settings shows push as
unavailable instead of pretending it works.

**Note**: `server/subscriptions.json` is a plain JSON file used as the
subscription store — fine for running/demoing this yourself, but section
41's suggested `notifications` table is the right shape for a real
multi-instance deployment.

## What's intentionally stubbed, not faked

- **Auth/accounts**: guest mode only. No Firebase/Supabase wiring yet — all
  data (location, bookmarks, tasbih, theme, notification preferences)
  lives in `localStorage` on the client, and push subscriptions are keyed
  by device/browser on the server (see `subscriptionStore.js`) rather than
  a real user account.
- **Admin route has no real authentication.** It's reachable at `/admin` for
  demo purposes only; do not ship this without a backend auth layer.
- **Hadith coverage is one collection (Nawawi's Forty Hadith)**, not the
  full canonical corpus (Bukhari, Muslim, etc.) — see "Hadith data" above.

## Deployment

The frontend (`npm run build`) is a static site — deploy `dist/` anywhere
(Netlify, Vercel, S3+CloudFront, etc). The backend (`server/`) needs an
**actual long-running Node process** — not a one-shot serverless function —
because `notificationScheduler.js` runs on an interval. A small always-on
Node service (Fly.io, Railway, a small VPS, etc.) works well; the `/api/ask`
endpoint alone would be fine as a serverless function, but the scheduler
needs something that stays alive. Set `ANTHROPIC_API_KEY`,
`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT` in that
platform's environment variables (never in a build-time/public env var),
and point the frontend's `/api` requests at it — either through the
hosting platform's rewrite rules (same pattern as the local dev proxy in
`vite.config.js`) or by setting a full backend URL in the frontend if it's
hosted separately. Replace `subscriptionStore.js`'s JSON file with a real
database before running more than one server instance.

## Data sources

- Prayer times: the uploaded Colombo 2026 timetable (base data only —
  **not verified for other locations**; replace before production, per the
  original project's own README).
- Locations: Sri Lanka's 9 provinces / 25 districts, town lists are a
  starting point and easy to extend in `src/data/locations.json`.


## Prayer data update

The bundled prayer data now uses the ACJU Zone 01 daily timetable for September 2026 (Colombo, Gampaha, Kalutara). The official ACJU prayer-times page is the authoritative source. Other 2026 months retain the original supplied base timetable until their official daily tables are imported.


## Prayer timetable source update

WAHDATH now attempts to load the official ACJU daily timetable for the selected Sri Lankan ACJU zone through the local Express backend. The backend retrieves the monthly ACJU timetable data via the prayers.lk mirror and caches it for the session. The ACJU official prayer-times page is the source-of-record: https://www.acju.lk/prayer-times/

- 2026: the app loads daily ACJU rows for the selected zone when the backend is running.
- 2027: the year selector is included, but WAHDATH does not invent 2027 prayer times. If the ACJU timetable is not published yet, the app shows that it is unavailable.
- The bundled 2026 Colombo data remains a fallback for the first render/offline use.
- Eastern Province's existing configurable -6 minute adjustment is preserved.
- For production, verify the displayed zone against the official ACJU PDF timetable before publishing.
