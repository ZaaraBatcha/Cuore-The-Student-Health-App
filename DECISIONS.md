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