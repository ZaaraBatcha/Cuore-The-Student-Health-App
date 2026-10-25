# Cuore - The Student Health App

A calm, social wellbeing web app designed for university students, built for the **Starting University** society track of the IKU Womxn in STEM Hackathon.

## Problem Definition

Starting university can make it difficult to balance academic responsibilities with personal wellbeing. Many health apps assume users already have established routines or specific health conditions, rather than addressing the challenges faced by students adjusting to university life.

Cuore makes wellbeing more engaging and social by allowing friends to track their steps, complete daily tasks, and grow virtual gardens together. It turns everyday activities such as walking, staying hydrated, and maintaining routines into simple, interactive experiences that fit around student life.

## Features

### Personal Garden

Daily goals contribute to the growth of a personal virtual garden. Flowers grow as goals are completed, providing a visual overview of progress throughout the week without penalising missed routines.

### Social Step Leaderboard

Users can compare daily step counts with friends. Each profile displays step progress, water intake, and a miniature version of their personal garden, connecting wellbeing achievements with social interaction.

### Step and Water Tracking

Users can track their daily steps against an 8,000-step goal and water intake against a 2-litre goal. Both can be logged manually, while step detection can use motion sensors where supported by the browser and device.

### Adaptive Day Agent

Cuore includes a deterministic, on-device day agent that adapts daily plans as new information, changing priorities, and corrected entries become available.

| Situation | Agent response |
|---|---|
| Water intake falls behind schedule | Adds a hydration catch-up task |
| Step count falls behind target | Schedules a catch-up walk for 17:30 |
| Rain is forecast | Moves the planned walk to an earlier time |
| A calendar event is added | Allocates preparation time and adjusts the routine |
| A logged entry is corrected or deleted | Recalculates progress and removes outdated recommendations |
| A completed task is unchecked | Suggests a shorter, more manageable version of the task |

All adaptations appear in a visible **Adaptations Today** feed, explaining why each change was made. The agent uses predefined rules rather than a large language model, making its decisions transparent, predictable, and usable offline.

### Calendar and Scheduling

Users can import university timetables through `.ics` files, create personal events, configure reminder lead times, and switch between monthly and expandable weekly calendar views.

### Daily Habits

Users can choose from preset habits, including taking vitamins, maintaining a consistent sleep routine, stretching, journaling, and organising their study space. Streaks track consecutive days of completion and reset when a day is missed.

### Voice and Text Logging

Users can record moods, meals, physical activity, study sessions, and sleep through text or voice input. Entries are organised by date in a personal logbook.

The Pattern Mirror summarises potential weekly trends in a single sentence, helping users reflect on connections between their routines and wellbeing.

### Personal File Storage

Users can upload or store documents such as GP letters, lab reports, and lecture notes. Files are stored locally on the device using IndexedDB, rather than being uploaded to a Cuore server.

### Accessibility

Cuore includes optional voice input and read-aloud functionality, large interactive elements, and a high-contrast mint and cream colour scheme.

## How Cuore Meets the Hackathon Brief

- **Relevant problem:** Addresses the challenges of maintaining wellbeing while adjusting to university life, informed by our own first-year experiences.
- **Adaptive agent:** Uses a responsive day-planning system that adjusts routines based on new information and changing circumstances.
- **Transparent decisions:** Explains each adaptation through a visible activity feed.
- **Privacy-conscious design:** Stores personal data locally and avoids unnecessary backend services.
- **Honest implementation:** Clearly distinguishes between implemented features, device-dependent capabilities, and features that would require further development.

## Technology Stack

- **React and Vite:** Frontend framework and development tooling.
- **Tailwind CSS v3:** Styling and consistent visual design.
- **localStorage and IndexedDB:** Local storage for application data and documents.
- **Open-Meteo:** Weather forecasts used by the adaptive day agent.
- **Web Speech API:** Browser-native speech recognition and text-to-speech where supported.
- **ElevenLabs (optional):** Alternative voice generation and Scribe transcription when a user supplies an API key.
- **Generic Sensor API:** Experimental, best-effort motion detection on supported devices and browsers.

## Getting Started

### Installation

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

`http://localhost:5173`

Chrome or another compatible browser is recommended. Voice functionality depends on browser support and may require a secure context, such as localhost or HTTPS.

### Optional ElevenLabs Configuration

Cuore works without an API key. By default, voice input and read-aloud use the browser's built-in Web Speech API.

To configure ElevenLabs as the default voice provider for a local demo, copy the example environment file:

```bash
cp .env.example .env
```

Add your API key to `.env`:

```bash
VITE_ELEVENLABS_API_KEY=your_api_key_here
```

Restart the development server after changing the environment file. Users can also provide their own key through **Settings → AI Voice**, which takes priority over the build-time default.

Cuore validates the expected key format before attempting to use it. Invalid keys are rejected or ignored rather than used for requests.

**Security note:** Environment variables prefixed with `VITE_` are included in the client-side JavaScript bundle during the build. Therefore, any key supplied through this method can be exposed in a deployed application. Keep `.env` out of version control, deploy public builds without a default API key, and let users supply their own keys where appropriate.

## Project Structure

```text
src/
  App.jsx                 # Application shell and navigation
  components/             # Main screens and reusable components
  lib/
    agent.js               # Adaptive planning rules and event feed
    habits.js              # Habit tracking and streaks
    leaderboard.js         # Local step leaderboard
    storage.js             # Local storage utilities
    weather.js              # Weather fetching and caching
    insights.js             # Weekly patterns and Pattern Mirror
    speech.js               # Voice input and output
    elevenlabs.js            # Optional ElevenLabs integration
  data/
    studentDay.js           # Default student schedule
    habitPresets.js          # Preset habit library
```

See `DECISIONS.md` for the project's design decisions and implementation scope.

## Limitations

- **Leaderboard:** Profiles and rankings are stored locally, so social competition is limited to the same device. A shared server-based leaderboard has not been implemented.
- **Step tracking:** Manual entry is supported, with best-effort motion detection on compatible devices. Direct integration with Apple Health or Google Fit would require additional platform-specific implementation.
- **Adaptive agent:** The agent uses deterministic rules rather than a large language model. This makes its behaviour predictable and transparent, but limits its ability to interpret complex situations.
- **Voice features:** Browser-native speech functionality depends on device and browser support. ElevenLabs provides optional cloud-based voice services when configured with a valid API key.
- **Data storage:** Personal data and documents are stored locally in the browser. They are not automatically synchronised across devices or backed up to a Cuore server.
- **API key security:** Any key embedded in a public client-side build can be extracted. Public deployments should not include a private API key.

Cuore aims to make everyday wellbeing more manageable, social, and adaptable for students starting university.
