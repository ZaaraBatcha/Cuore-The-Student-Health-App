# Hackathon Project — Decisions & Scope (v2)

## Theme
**Wise Track: Max Ease Convenience** — making it easy to do more, in more places, with less effort.

## The Idea (v2)
A **calm, accessible health companion** that helps people manage chronic conditions with a personalized daily schedule, simple logging, a calendar of appointments, and a medication tracker. Built with accessibility as a default, not a feature.

## Locked scope (v2)

### ✅ Core
1. **Profile + onboarding survey** — name, age range, weight, height, fitness level, condition
2. **Personalised greeting** — "Hi, {name} — good morning"
3. **Adaptive daily schedule** — activity duration reflects user's fitness level
4. **Condition templates** — diabetes & hypertension
5. **Calendar** — month view, add appointments, import `.ics`, reminders with custom lead times (same day / 1 day / 3 days / 1 week / 2 weeks)
6. **Medication tracker** — pill shape, colour, dosage, daily taken/missed checklist
7. **Missed-medication pattern detection** — "If you regularly forget, talk to your GP or pharmacist"
8. **Logging** — glucose, BP, meals, mood, activity (with voice input)
9. **Weekly insights** — patterns from logs

### ✅ Accessibility / polish
10. **Voice input for logging** (toggleable in Settings)
11. **Read-aloud on insights** (toggleable in Settings)
12. **Settings page** — profile, condition, voice toggles, backup/export, erase data
13. **Calm sage/cream palette** — no flash, accessible contrast
14. **Large tap targets (44px min)**

### ❌ Cut from the hackathon
- Diabetes monitor / wearable hardware integration
- Auto-translation for worldwide access
- ~~Blood test PDF translator~~ (struck through in the brainstorm)
- Cloud backend / accounts — local-only

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
- `src/App.jsx` — main shell, page routing, survey/profile orchestration
- `src/data/conditions.js` — diabetes & hypertension schedules & guides data
- `src/data/profileOptions.js` — age ranges, fitness levels
- `src/lib/storage.js` — localStorage helpers (all data shapes)
- `src/lib/insights.js` — weekly pattern detection
- `src/lib/speech.js` — voice input + read-aloud
- `src/lib/ics.js` — minimal ICS parser for calendar import
- `src/lib/calendar.js` — month grid, reminders, date helpers
- `src/components/Survey.jsx` — first-run onboarding
- `src/components/TodayPage.jsx` — personalised daily schedule
- `src/components/LogPage.jsx` — voice & text logging
- `src/components/CalendarPage.jsx` — calendar view, add, import, reminders
- `src/components/MedicationsPage.jsx` — pill tracker, missed-dose prompt
- `src/components/InsightsPage.jsx` — weekly patterns
- `src/components/SettingsPage.jsx` — profile, condition, voice toggles, data export/erase

## Decisions log
- Node.js v24.22.0 + npm 11.19.1 installed.
- PowerShell execution policy set to RemoteSigned for current user.
- v1 cut: hardware integration, auto-translation, blood-test PDF translator.
- v2 added: calendar with `.ics` import, medication tracker, profile/survey, settings page.
- Speech features are toggleable from Settings.
- Calendar import uses the universal ICS format (no Google/Apple/Outlook API keys needed).
- Time buckets: Morning (<12) / Afternoon (<17) / Evening (<21) / Night (else).
- "If this keeps happening" prompt for missed medications is the **deliberately gentle** UX — we don't shame the user for missing pills, we suggest care-team contact.