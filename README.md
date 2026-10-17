# Wise Track — Health Companion

A calm, accessible web app for managing chronic conditions (diabetes and hypertension) with adaptive daily schedules, simple logging, and clear guides.

## Run it

```bash
npm install
npm run dev
```

Then open the URL it prints (usually `http://localhost:5173`).

## Features

- **Onboarding** — pick a condition, get a tailored baseline plan
- **Today** — your adaptive daily schedule with progress tracking
- **Log** — voice or text input for glucose, BP, meals, mood, activity
- **Guides** — expandable cards with read-aloud support
- **Insights** — weekly patterns from your logs
- **Accessibility** — large tap targets, high contrast, voice in & out

## Stack

- Vite + React
- Tailwind CSS v3 (calm sage/cream palette)
- Web Speech API (browser-native, no third-party)
- localStorage (all data stays on device)

## Project layout

- `src/App.jsx` — main app shell
- `src/data/conditions.js` — diabetes & hypertension templates
- `src/lib/storage.js` — localStorage helpers
- `src/lib/insights.js` — weekly pattern detection
- `src/lib/speech.js` — voice input + read-aloud
- `src/components/` — UI components and pages

See `DECISIONS.md` for the full scope and design decisions.