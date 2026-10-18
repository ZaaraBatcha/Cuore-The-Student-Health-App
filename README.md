# Cuore 🌿

*Your wellbeing, growing every day.*

A calm, social wellbeing web app built for **university students**, made for the **Society track: Starting University** of the Womxn in STEM Hackathon.

---

## 🎯 Problem definition

University students, especially new students during their transition period, often experience burnout and struggle to manage both academics and their personal well-being. Generic health apps assume you already have a routine: or a chronic condition to manage. Nothing speaks to a fresher juggling timetables, flat-sharing, labs and coursework.

**Cuore makes health fun and social** by letting friends connect and compete on step leaderboards to see who can take more steps, complete the most tasks, and grow the best garden. Everything you take care of yourself with: steps, water, routines: becomes something you'd actually open between lectures, not another chore.

---

## ✨ What it does

### 🌱 A garden that grows with you
Every goal you hit plants and grows a flower in your personal garden. Skip the routine, and the garden quietly reflects it. It's your week at a glance: no shame, just life.

### 🏆 A social step leaderboard
Friends compete on today's steps. Every profile shows their steps, water level, and a **miniaturised version of their garden**: the garden *is* the profile picture of your progress.

### 👟 Steps & 💧 Water, without the friction
A daily step goal (8,000) and hydration goal (2L) with one-tap logging. Step data syncs toward the phone's motion sensors where the browser supports them, and stays manual everywhere else: honest about what's measured and what's entered.

### 🤖 An AI day-agent that adapts to *you*
The heart of Cuore. A fully on-device agent re-plans your day as **new stream data, changing priorities, or corrected assumptions arrive**:

| The moment | What Cuore does |
|---|---|
| Your water is behind pace by the afternoon | Inserts a *hydration catch-up* into today's plan |
| Your steps are behind pace | Adds a *step catch-up walk* at 17:30 |
| Rain is forecast | Physically moves your walk earlier: *"the plan adapts before the weather does"* |
| A calendar event lands | Adds prep time: *your calendar takes priority, the routine shifts around it* |
| You correct an entry (delete a water log, fix a step count) | Re-checks your pace and cancels plans made on stale assumptions |
| You un-tick a completed task | Respects it: and adds a *"gentle 5-min version"* instead of pretending it never happened |

Every decision appears in a visible **"🤖 Adaptations today"** feed with its reason: the agent never silently changes your plan. It's deterministic, auditable, needs no API keys, and works offline.

### 📅 Calendar with month & week views
Timetable screenshot? Import real .ics files (university systems export these), add your own events, set reminder lead-times, and switch to the expandable **week view** when a day is busy.

### 💊 Daily habits (presets & streaks)
One-tap habit presets: take vitamins, 8-h sleep, morning stretch, no phone before bed, journal, tidy study space. Each habit builds a 🔥 streak that's honestly broken by a missed day.

### ➕ Log (voice or text) & 📔 Logbook
Log moods, meals, activity, study or sleep by typing or speaking. Entry types become a diary view, tagged by day. The **Pattern Mirror** reads your week back as one sentence: e.g. *"You feel better on days you move your body."*

### 📁 My files
Scan or upload GP letters (ready for uni extenuating-circumstances forms), lab reports, and lecture notes. Stored on-device only.

### ♿ Accessibility built in
Voice input & read-aloud (toggleable in Settings), large tap targets, calm high-contrast mint palette.

---

## 🧠 How we meet the brief

- **Real problem, personally experienced**: managing wellbeing during the university transition: drawn straight from our own first-year experience.
- **Adaptive AI agent**: the day-agent answers the "adapts intelligently" challenge directly, with the feed as proof.
- **Honest by design**: we label device-demo over fake cloud claims, determinism over hand-waving, and never claim medical advice.

---

## 🛠 Stack

- **Vite + React**: fast build, minimal footprint
- **Tailwind CSS v3**: the mint/cream calm design system
- **localStorage + IndexedDB**: all personal data stays on-device (IndexedDB for documents/images)
- **Open-Meteo**: free, keyless weather for the adaptive rules
- **Web Speech API**: browser-native voice input & read-aloud, the default
- **ElevenLabs (optional)**: studio voices and Scribe transcription when you paste your own key in Settings (free plans can use Sarah, Adam and Daniel; library voices such as Rachel need credits)
- **Generic Sensor API**: best-effort step motion detection on phones

## 🏃 Run it

```bash
npm install
npm run dev
```

Start it in Chrome (voice features need Chromium or local HTTPS), open the printed URL: usually `http://localhost:5173`.

### Optional: ElevenLabs by default

Cuore works with no configuration: voice input and read-aloud use the browser's built-in Web Speech API, and nobody is asked for a key to use the app.

If you want ElevenLabs active out of the box (for a demo, say), copy the example file and paste a key:

```bash
cp .env.example .env
# then edit .env and set VITE_ELEVENLABS_API_KEY
```

Restart the dev server after editing `.env` (it is read at startup, not hot-reloaded). Anyone can still override that default by pasting their own key in **Settings → AI voice**, which is stored in their browser only and wins over the default.

Two warnings. `.env` is gitignored, so the key stays off GitHub. But `.env` values are baked into the JavaScript bundle at build time, so a deployed build exposes whatever key it was built with: for a public deployment, ship with an empty key and let each visitor paste their own.

## 📂 Project layout

```
src/
  App.jsx              : app shell & navigation
  components/          : Today, Habits, Log, Calendar, Profile, AgentFeed, …
  lib/
    agent.js           : the adaptive day agent (6 rules + feed events)
    habits.js          : habit streaks
    leaderboard.js     : device-social step ranking
    storage.js         : localStorage keys & helpers
    weather.js         : Open-Meteo fetch/caching
    insights.js        : weekly patterns & Pattern Mirror
    speech.js          : voice in/out, picks ElevenLabs or the browser voice
    elevenlabs.js      : optional ElevenLabs voices + Scribe (key pasted in Settings)
  data/
    studentDay.js      : default student schedule
    habitPresets.js    : one-tap habit library
```

See `DECISIONS.md` for the full scope and every design decision we made.

## ⚠️ Honest limitations

- **Leaderboard** runs on-device: profiles live on the same machine for demo (a server version is architecture-ready, not built).
- **Steps** are manual-entry with a motion-sensor probe where the browser allows; phone-native step sync (HealthKit / Google Fit) needs a native wrapper.
- **The agent** is rules-based, not a large language model: deterministic by choice so it never hallucinates a plan at you and works without internet.
- **Voice is the one optional cloud touch**: with no key the browser speaks and listens locally; with a key (pasted in Settings, or supplied as a build default through `.env`) voice notes are transcribed by ElevenLabs Scribe. A key pasted inside the app lives in that browser only and is never committed.
- **A build-time key is public**: if `.env` holds a key when you run `npm run build`, that key is readable inside the bundle. Deploy with an empty key and let visitors paste their own.
