# Hackathon Project: Decisions & Scope (v2)

## Theme
**Wise Track: Max Ease Convenience**: making it easy to do more, in more places, with less effort.

## The Idea (v2)
A **calm, accessible health companion** that helps people manage chronic conditions with a personalized daily schedule, simple logging, a calendar of appointments, and a medication tracker. Built with accessibility as a default, not a feature.

## Locked scope (v2)

### ✅ Core
1. **Profile + onboarding survey**: name, age range, weight, height, fitness level, condition
2. **Personalised greeting**: "Hi, {name}: good morning"
3. **Adaptive daily schedule**: activity duration reflects user's fitness level
4. **Condition templates**: diabetes & hypertension
5. **Calendar**: month view, add appointments, import `.ics`, reminders with custom lead times (same day / 1 day / 3 days / 1 week / 2 weeks)
6. **Medication tracker**: pill shape, colour, dosage, daily taken/missed checklist
7. **Missed-medication pattern detection**: "If you regularly forget, talk to your GP or pharmacist"
8. **Logging**: glucose, BP, meals, mood, activity (with voice input)
9. **Weekly insights**: patterns from logs

### ✅ Accessibility / polish
10. **Voice input for logging** (toggleable in Settings)
11. **Read-aloud on insights** (toggleable in Settings)
12. **Settings page**: profile, condition, voice toggles, backup/export, erase data
13. **Calm sage/cream palette**: no flash, accessible contrast
14. **Large tap targets (44px min)**

### ❌ Cut from the hackathon
- Diabetes monitor / wearable hardware integration
- Auto-translation for worldwide access
- ~~Blood test PDF translator~~ (struck through in the brainstorm)
- Cloud backend / accounts: local-only

### 🤔 Optional / time permitting
- Flower garden (still on the shelf)
- More conditions beyond diabetes/hypertension

## Why this scope
v1 was too broad (a full product, not a hackathon project). v2 keeps the **core daily-rhythm loop**, swaps Guides for a Calendar (the new "friction-removal" feature), and adds a personalisation layer (survey + name + fitness) so the schedule feels made for the user.

## Stack
- Vite + React
- Tailwind CSS v3 (calm sage/cream palette)
- Web Speech API (browser-native voice in/out)
- ElevenLabs (optional): studio text-to-speech + Scribe speech-to-text, enabled only when the user pastes their own key in Settings
- localStorage (all data stays on device)
- Custom minimal ICS parser for calendar import (no third-party deps)

## File map
- `src/App.jsx`: main shell, page routing, survey/profile orchestration
- `src/data/conditions.js`: diabetes & hypertension schedules & guides data
- `src/data/profileOptions.js`: age ranges, fitness levels
- `src/lib/storage.js`: localStorage helpers (all data shapes)
- `src/lib/insights.js`: weekly pattern detection
- `src/lib/speech.js`: voice input + read-aloud
- `src/lib/ics.js`: minimal ICS parser for calendar import
- `src/lib/calendar.js`: month grid, reminders, date helpers
- `src/components/Survey.jsx`: first-run onboarding
- `src/components/TodayPage.jsx`: personalised daily schedule
- `src/components/LogPage.jsx`: voice & text logging
- `src/components/CalendarPage.jsx`: calendar view, add, import, reminders
- `src/components/MedicationsPage.jsx`: pill tracker, missed-dose prompt
- `src/components/InsightsPage.jsx`: weekly patterns
- `src/components/SettingsPage.jsx`: profile, condition, voice toggles, data export/erase

## Decisions log
- Node.js v24.22.0 + npm 11.19.1 installed.
- PowerShell execution policy set to RemoteSigned for current user.
- v1 cut: hardware integration, auto-translation, blood-test PDF translator.
- v2 added: calendar with `.ics` import, medication tracker, profile/survey, settings page.
- Speech features are toggleable from Settings.
- Calendar import uses the universal ICS format (no Google/Apple/Outlook API keys needed).
- Time buckets: Morning (<12) / Afternoon (<17) / Evening (<21) / Night (else).
- "If this keeps happening" prompt for missed medications is the **deliberately gentle** UX: we don't shame the user for missing pills, we suggest care-team contact.
- 2026-10-17: Full pivot to student wellbeing (no chronic-illness conditions). Steps + water tracking, device-local leaderboard, calendar week view, settings toggles rebuilt.
- 2026-10-17: Habits page upgrade: one-tap habit presets (`habitPresets.js`), per-habit streaks (`lib/habits.js`), water snapshot card on Habits, Documents renamed "My files" with student framing.
- 2026-10-17: Known gap vs judging criteria ("AI agent that adapts when new stream data, changing priorities, or corrected assumptions arrive"): current schedule is static. Proposed fix: on-device adaptive day agent + "Adaptations today" feed so re-planning is visible. Not yet built: awaiting go-ahead.
- 2026-10-17: Adaptive Day Agent built (`src/lib/agent.js` + `src/components/AgentFeed.jsx`, wired into TodayPage). Six adaptation rules, all fully local and deterministic: (1) water behind pace → hydration catch-up item; (2) steps behind pace → step catch-up walk; (3) rain forecast ≥60% → walk moved earlier (live override); (4) calendar today/tomorrow → prep item added, priorities override routine; (5) totals edited downwards → agent re-checks pace after your correction; (6) completed task un-ticked → scaled to a "gentle 5-min version". Every decision appears in a visible "🤖 Adaptations today" feed with timestamp + reason; agent-added/overridden plan items carry a 🤖 badge. Re-runs every 2.5s on the Today page, re-plans survive reload, agent memory resets at midnight. Verified live in browser: all six rules fired.
- 2026-10-18: App renamed **Wise Track → Cuore** (the hackathon track category is the Society track: *Starting University*). README rewritten around the student-wellbeing problem definition. Name updated in index.html (title, description, launch screen), SettingsPage speech/disclaimer copy, and agent header comment. Internal localStorage keys still use the `wisetrack.` prefix: renaming those would silently wipe demo data, so they stay as-is. `src/components/Onboarding.jsx` identified as unused v1 leftover (candidate for deletion).
- 2026-10-18: Onboarding.jsx deleted. All em dashes removed from README, code comments and UI strings (user preference; kept colour-palette arrows like →).
- 2026-10-18: Homepage redesigned per the design review: hierarchy is now header (small greeting, date, compact [+ Log] pill + gear) → single "Today's progress" bar (one % only) → side-by-side compact Steps/Water cards (value and goal on one line, thin bar, two quick-add buttons, "Exact" expando for manual entry) → tappable collapsible "Your garden" card (level and points shown ONLY here, plus a next-plant countdown; tap illustration to expand) → agent Adaptations feed → "Your routine" accordion (Morning/Afternoon/Evening/Night, each with task counts, current time of day auto-open, agent-added items keep the 🤖 badge) → leaderboard collapsed at the bottom (summary line; tap to expand top 3 + own row). Header slimmed: profile button removed (bottom nav covers it). FlowerGarden gained a `compact` mode (bare scene) so chrome isn't duplicated.
- 2026-10-18: **UTC date bug fixed** in `todayKey()` (storage.js): it used `toISOString()` (UTC), so after local midnight the app wrote/read completions against *yesterday* (e.g. NZ local 18 Oct vs UTC 17 Oct): ticks, XP, routine progress and agent correction detection silently mismatched during late-night demo hours. Now uses the local calendar date. Verified live end-to-end after the redesign: UI tick writes local-date storage, progress/XP update ("1 of 14 tasks completed", "Level 1 · 90 points"), un-tick fires `undo-reset-wake` and renders the "Gentle 5-min version" agent item with the feed.
- 2026-10-18: Second design-feedback pass (all verified live):

  - Routine accordion headers (Morning/Afternoon/Evening/Night only) tinted green (`bg-mint-100` + `border-mint-300`) so they read as section cards; the checklist rows stay white.
  - Page background darkened one step (`body` now `bg-mint-100`) so white cards pop with more contrast.
  - Steps/Water quick-adds slimmed to ONE quick button each (+500 steps / +250ml water) with "Exact" beside it; +1k and +500ml buttons removed.
  - Expanded leaderboard now shows ALL profiles (Alhaam was being cut by the old top-3 slice when the user ranked inside the top three).
  - "My files" note shortened to "GP letters, lab reports: all in one place" (no lecture notes).
  - "What does this do?" habit lookup section removed entirely (user decision), including dead code `MedicationInfo`/`InfoRow` and the `medicationLibrary` import.
  - Logbook made reachable again: routed at `page === 'logbook'` and a "📖 View logbook" button added under Save log on the Log page. Also fixed a latent crash: `LogbookPage` still referenced leftover `conditionId`/`conditions` and would have thrown the moment an entry existed.
- 2026-10-18: Third polish pass (all verified live):

  - Toggle switches rebuilt: the global 44px tap-target rule was inflating the track, which pushed the knob off-centre (user's report). Toggle now sets `min-h-0`, track 48x28, knob perfectly centred, gradient green when on, matched to the design reference.
  - Settings "Edit" button now works: was a no-op because `onProfileUpdate` was never passed down. Replaced with an inline ProfileEditor (name / weight / height / activity select) that saves via `storage.setProfile` and refreshes App state (`onProfileSave` prop). Read view shows friendly activity labels.
  - Log page "What are you logging?" type options and mood tags turned into tinted cards/chips (mint fill + mint border) so they read as tappable cards against the darker background instead of floating text.
  - Logbook entry icons swapped from type emojis to a green pencil SVG (mint-600 `#427d60`) in a tinted tile.
  - Logo: prototype hand-drawn heart-in-blob mark rebuilt as clean vector SVG (`public/cuore-logo.svg`) in app palette greens; used on the Today header (top right, with "Cuore" wordmark beneath) and as the site favicon.
- 2026-10-18: Fourth polish pass (all verified live):

  - Favicon cache-busted (`favicon.svg?v=2`) so the browser tab picks up the new heart logo.
  - Today header re-ordered: gear removed; logo + "Cuore" now sit in the far-right corner where the gear was, and tapping the logo tile opens Settings (so Settings stays reachable from Home). The Log pill stays.
  - Greeting now includes the name: "Good morning, Zaara" (emoji dropped at the same time).
  - Profile page: bottom "Settings & data" card removed (and the unused Insights stub with it). The corner gear is now a proper SVG cog (was a small emoji), 26px, darker sage-grey `#566a60`.
  - Note: a Vite HMR crash (edits landed while the server held a stale module) blanked the page until a file touch forced a re-transform; source was always valid, no code fix needed.
- 2026-10-18: Header corner refined after user feedback (logo + caption above the Log pill looked mismatched): switched to a horizontal brand lockup, heartbeat logo beside the wordmark "Cuore", vertically centred with the Log pill. Order: [♥ Cuore] [+ Log]. Logo tap still opens Settings. Page title set to "Cuore - The Student Health App".
- 2026-10-18: Gallery re-shot a second time per user request: every frame now includes the bottom navbar (user found the missing navbar odd). Same framings and per-page zoom as the approved set, adjusted for the current browser window (800 CSS px wide at dpr 1.5: zooms scaled by ~0.8x so text and layout match the earlier 1000px-wide shots). All 12 files are now uniform ~1176x1197. User's hand-cropped versions preserved in `screenshots/backup_user_crops/`. Demo state seeded identically (3 agent events: rain move, Chemistry lab prep, gentle 5-min version after un-tick), then wiped after the shoot. Port note: the screenshot run used `localhost:5173`; `localhost:5175` was restarted for the user's own recordings after it died mid-session.
- 2026-10-18: Garden readability fix after user reported "the flower doesn't show up": at level 2 the single plant was a sprout coloured `#7bb392`, the same colour as the grass gradient's bottom stop, and it was drawn small at the far left, so it was effectively invisible. Fixes: species order now leads with flowers (`daisy`, `tulip`, `sunflower`, `sprout`, `bush`, `tree`, `mushroom`, `bluebell`) so the first plant a student grows is a daisy; the slot 0 x-position is now dead centre; every plant is drawn at 1.5x scale about its soil base; the sprout palette darkens to `#427d60` for contrast. Verified live at level 2.
- 2026-10-18: Repo-readiness fix in `src/lib/leaderboard.js` (public GitHub version): the "you" row was hardcoded to the name "Zaara" and seeded with fake steps, which would have shown a stranger's name and invented numbers to anyone cloning the repo. It now mirrors the name from the survey profile (falling back to "You") and starts at 0 steps so Today and the leaderboard agree; only the three friends keep synthesized demo steps. Screenshot gallery is unaffected because the demo profile name is still Zaara.
- 2026-10-18: **Optional ElevenLabs voice layer added** (user request; possible because both halves ship as simple HTTP endpoints). New `src/lib/elevenlabs.js`: `elevenSpeak()` posts to `POST /v1/text-to-speech/{voice_id}` with the `xi-api-key` header, `transcribe()` posts a recorded clip to `POST /v1/speech-to-text` with `model_id: scribe_v2`, `listVoices()` fills the Settings voice picker, `startRecording()` wraps MediaRecorder. TTS tries `eleven_flash_v2_5` and only retries `eleven_multilingual_v2` on a model error (422/400), so an auth failure costs one request rather than two. `speech.js` routes `speak()` through ElevenLabs when a key exists and falls back to the browser voice on any failure; the Log page records a clip for Scribe when a key is set and otherwise keeps the existing live browser transcript.
  - Key handling: pasted by the user in Settings, kept at `wisetrack.elevenlabsKey` in that browser only. Deliberately excluded from the backup export (a shared backup can never leak it), and cleared both by "Remove key" and by "Erase all data". No secret ever enters the repo, so the public GitHub version stays clean and a judge can paste their own key.
  - Verified live on port 5180 with a dummy key: CORS is open for all three endpoints from a browser origin (401 JSON rather than a blocked preflight), the short-key guard fires, "Load voices" and "Test ElevenLabs voice" both surface "ElevenLabs rejected the key. Check it in Settings.", read-aloud falls back to the browser voice with a single warning and no uncaught errors, and the Log page caption switches between "Transcribed by ElevenLabs Scribe" and "Using your browser's built-in speech." after the key is removed.
  - Not verified, and cannot be from here: real playback with a valid key and a real microphone transcription. The user tests those. README stack, limitations and file map updated.
- 2026-10-18: Pre-pivot dead code deleted (user approved): `parseLogFromSpeech()` removed from `src/lib/speech.js` (the old diabetes/hypertension voice parser, no callers) and `src/data/medicationLibrary.js` deleted (Type 2 diabetes content, no importers). `src/data/conditions.js` stays: it is now a small backwards-compat shim that re-exports the student day, and it is still referenced in this file's file map.
- 2026-10-18: **ElevenLabs verified against the user's real key, end to end.** Findings and the fixes they caused:
  - `POST /v1/text-to-speech/{voice_id}` returns 200 with real audio (17 to 66 KB mp3) for Sarah (`EXAVITQu4vr4xnSDxMaL`), Adam (`pNInz6obpgDQGcFmaJgB`) and Daniel (`onwK4e9ZLuTAKqWW03F9`). Rachel (`21m00Tcm4TlvDq8ikWAM`), which was our default, returns 402 `paid_plan_required`: a free account cannot use library voices through the API. `FALLBACK_VOICE_ID` is now Sarah, so a default install makes sound on a free key.
  - `POST /v1/speech-to-text` with `model_id: scribe_v2` works: a clip generated by the same account's text-to-speech was transcribed back word for word ("I felt tired after my chemistry lab today, but the walk home helped."). That is how the transcription path was proven without a microphone.
  - The supplied key is scoped without `voices_read`, `models_read` or `user_read`, so `GET /v1/voices` answers 401 `missing_permissions`. The picker therefore cannot list voices on this key. Added an "Or paste a voice ID" field in Settings as the fallback, and this is the limitation to be honest about with judges.
  - `friendlyError` now reads the ElevenLabs `detail.status` and `detail.code`, so a missing permission reads as a missing permission, a plan limit reads as a plan limit, and only a genuinely bad key says "rejected the key". Before this, all three produced the same message.
  - Verified in the app UI with the real key: "Test ElevenLabs voice" reports "That was the ElevenLabs voice." and plays Sarah by default and Daniel after pasting his ID; "Load voices" shows the exact missing permission; audio plays from a page with no user gesture in this browser, so the demo path works.
  - The key was never written to a file: it was used only for these test calls and then removed from the test origin's localStorage.
  - Gallery: `screenshots/photo_11.png` re-shot to include the new "AI voice" card (1200x1196, matched to the set: the app is rendered inside a 1000x997 same-origin frame at zoom 0.72, which puts the cards at the same 360 image px as the approved frames and keeps the navbar at the bottom). The frame deliberately shows the key field empty, so the public gallery reads as "bring your own key" rather than implying the demo carries a secret. The previous version is kept at `%TEMP%\photo_11_prev.png`.
- 2026-10-18: **ElevenLabs key can now come from the build as well as from Settings** (user request: keep a default key in the project so it works out of the box, while each user can still add their own). Resolution order in `src/lib/elevenlabs.js`: a key pasted in Settings wins, otherwise `VITE_ELEVENLABS_API_KEY` from `.env`, otherwise the browser voice. New helpers `getUserKey()`, `hasUserKey()`, `hasBuiltInKey()`.
  - The key is deliberately NOT written into a source file. It lives in `.env`, which is now gitignored (`.env`, `.env.*`, with `!.env.example` so the template is committed). Putting a live key in source would hand it to everyone reading the public repo and to GitHub secret scanning.
  - The Settings card now has three states: your own key saved (with "Remove key"), no own key but a build default (voice controls work immediately, labelled "Using the demo key built into this app", with the paste form offered as an override), and no key at all (the plain paste form).
  - Verified on a fresh port (5182, empty storage): with nothing pasted at all, the card reports the built-in key and "Test ElevenLabs voice" plays Sarah; pasting a key moves to the saved state; "Remove key" falls back to the built-in key and still plays.
  - Tradeoff, documented in README: `.env` values are inlined into the bundle at build time, so `dist/assets/index-*.js` now contains the key (confirmed by grep). That is fine for a local demo, but a public deployment should be built with an empty key so nobody can spend the quota.
- 2026-10-18: **Key-length hardening after a real failure report.** The user tried a second key (`sk_be1fc...`, 67 characters) and reported it "was working before". Direct API calls say otherwise: it returns `400 {"message":"API key must be exactly 51 characters, got 67"}` on both `GET /v1/voices` and `POST /v1/text-to-speech`, so it is not a valid ElevenLabs API key and can never be the default. The 51-character key already in `.env` returns 200 on both endpoints (TTS: 18,851 bytes of audio), so the default key was and is the working one. Before this change the app happily saved a 67-character key and only failed at request time, which is what looked like a regression.
  - Added `isKeyShape()` (`sk_` plus 48 characters) to `src/lib/elevenlabs.js`. `getKey()`, `hasUserKey()` and `hasBuiltInKey()` now ignore a key of the wrong shape instead of sending it, so a bad paste or a bad `.env` falls back to the built-in key, then to the browser voice, and never breaks the demo.
  - Settings now refuses to save a wrong-length key and explains the rule, and shows a warning banner when a previously stored key of the wrong shape is being ignored.
  - `friendlyError` also maps the API's own "must be exactly 51 characters" 400 to a plain explanation.
  - Verified live on port 5184: the built-in key plays with nothing pasted; pasting the 67-character key makes zero network calls and stores nothing; a 67-character key injected straight into localStorage is ignored, the banner appears, and "Test ElevenLabs voice" still plays through the built-in key.