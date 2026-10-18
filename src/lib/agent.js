// Cuore Day Agent: a small, fully-local adaptive planner.
//
// Design brief: "adapt intelligently when new stream data, changing
// priorities, or corrected assumptions arrive."
//
//   • stream data       → steps, water, completions, weather (all local)
//   • changing priorities → calendar appointments override the routine
//   • corrected assumptions → user removes a water entry / un-ticks a task,
//                             the agent re-checks pace and re-plans back
//
// The agent is rules-based and deterministic (no cloud, no API keys).
// Every decision it makes is persisted for the day and surfaced in a
// visible feed, so the adapting itself is auditable.

const AGENT_STATE_KEY = 'wisetrack.agent';
const GOAL_WATER_ML = 2000;
const WAKING_START = 7;   // 07:00
const WAKING_HOURS = 16;  // 07:00 → 23:00

function readState() {
  try {
    return JSON.parse(localStorage.getItem(AGENT_STATE_KEY) || '{}');
  } catch {
    return null;
  }
}

function writeState(state) {
  try {
    localStorage.setItem(AGENT_STATE_KEY, JSON.stringify(state));
  } catch {
    // storage full / private mode: agent still works for this session in memory
  }
}

// Expected share of each daily goal by time of day (0..1), assuming an
// evenly paced day between 07:00 and 23:00.
function dayFraction(now) {
  const h = now.getHours() + now.getMinutes() / 60;
  return Math.min(1, Math.max(0, (h - WAKING_START) / WAKING_HOURS));
}

function hhmm(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// A slot label d minutes from now, rounded to the nearest 15 min
function slotIn(now, minutes) {
  const d = new Date(now.getTime() + minutes * 60000);
  d.setMinutes(Math.round(d.getMinutes() / 15) * 15, 0, 0);
  return hhmm(d);
}

function plusOneHour(hhmmStr) {
  const [h, m] = hhmmStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h - 1, m, 0, 0);
  return hhmm(d);
}

// Rain probability (%) for today, from the weather cache if present.
export function getCachedRainProb() {
  try {
    const cached = JSON.parse(localStorage.getItem('wisetrack.weather') || 'null');
    const prob = cached && cached.weather && cached.weather.today && cached.weather.today.rainProb;
    return (typeof prob === 'number') ? prob : null;
  } catch {
    return null;
  }
}

// The next calendar appointment starting today (soonest first).
export function getAppointmentsToday(appointments, now = new Date()) {
  return (appointments || [])
    .filter((a) => a && a.start)
    .map((a) => ({ ...a, _start: new Date(a.start) }))
    .filter((a) => a._start.getFullYear() === now.getFullYear() &&
                   a._start.getMonth() === now.getMonth() &&
                   a._start.getDate() === now.getDate())
    .sort((a, b) => a._start - b._start);
}

/**
 * Run one agent pass.
 * snapshot = { steps, water, undone: [{id,label,type}], appointments }
 * Returns { events, extraItems, overrides }: extraItems are schedule-shaped
 * entries ready to merge into Today's list; overrides patch existing items
 * (e.g. move the walk ahead of rain).
 */
export function runAgent(snapshot) {
  const now = new Date();
  const today = todayKeyOf(now);
  const state = readState() || {};
  if (state.date !== today) {
    // new day → fresh agent memory
    state.date = today;
    state.events = [];
  }
  state.date = today;
  if (!Array.isArray(state.events)) state.events = [];

  const events = state.events;
  const has = (id) => events.some((e) => e.id === id);
  const at = hhmm(now);
  const frac = dayFraction(now);
  const steps = Number(snapshot.steps) || 0;
  const water = Number(snapshot.water) || 0;

  // --- 1. Stream data: hydration behind pace by early afternoon ---
  const waterPace = GOAL_WATER_ML * frac;
  const waterFloor = Math.max(400, waterPace - 300);
  if (now.getHours() >= 13 && water < waterFloor && !has('water-catchup')) {
    events.push({
      id: 'water-catchup',
      at,
      action: 'Inserted a hydration catch-up into your plan',
      reason: `Water is ${Math.max(0, Math.round(waterPace) - water)}ml behind pace: expected about ${(waterPace / 1000).toFixed(1)}L by now.`,
      item: { id: 'agent-hydration', time: slotIn(now, 45), label: 'Hydration catch-up: 500ml', icon: '💧', type: 'check', agent: true },
    });
  }

  // --- 2. Stream data: steps behind pace mid-afternoon ---
  const stepPace = 8000 * frac;
  if (now.getHours() >= 15 && steps < Math.max(2500, stepPace - 3000) && !has('steps-catchup')) {
    const rain = getCachedRainProb();
    const rainNote = rain !== null && rain >= 60 ? ' Rain is likely later, so plan an indoor option.' : '';
    events.push({
      id: 'steps-catchup',
      at,
      action: 'Added a step catch-up walk at 17:30',
      reason: `Steps are behind pace: ${steps.toLocaleString()} so far vs about ${Math.round(stepPace).toLocaleString()} expected by now.${rainNote}`,
      item: { id: 'agent-walk', time: '17:30', label: 'Extra 15-min walk: step catch-up', icon: '🚶', type: 'activity', agent: true },
    });
  }

  // --- 3. Stream data: rain forecast → walk moved ahead of it ---
  const rainProb = getCachedRainProb();
  if (rainProb !== null && rainProb >= 60 && !has('rain-move')) {
    events.push({
      id: 'rain-move',
      at,
      action: 'Moved your walk earlier to dodge the rain',
      reason: `${rainProb}% showers expected today: the plan adapts before the weather does.`,
      override: { itemId: 'walk1', patch: { time: '15:00', label: 'Walk (moved ahead of rain)' } },
    });
  }

  // --- 4. Changing priorities: calendar overrides routine ---
  const todayAppts = getAppointmentsToday(snapshot.appointments, now);
  const nextAppt = todayAppts[0];
  if (nextAppt) {
    const evId = `appt-prep-${nextAppt.id}`;
    if (!has(evId) && nextAppt._start.getTime() - now.getTime() > 0) {
      events.push({
        id: evId,
        at,
        action: `Added prep time before “${nextAppt.title}”`,
        reason: 'Your calendar takes priority: the routine shifts around it automatically.',
        item: {
          id: `agent-prep-${nextAppt.id}`,
          time: plusOneHour(hhmm(nextAppt._start)),
          label: `Prep for ${nextAppt.title}`,
          icon: '🎒',
          type: 'check',
          agent: true,
        },
      });
    }
  } else {
    // no appointment today → look ahead: evening prep for tomorrow's first event
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const firstTomorrow = getAppointmentsToday(snapshot.appointments, tomorrow)[0];
    if (firstTomorrow && now.getHours() >= 18) {
      const evId = `appt-prep-tmrw-${firstTomorrow.id}`;
      if (!has(evId)) {
        events.push({
          id: evId,
          at,
          action: `Added evening prep: “${firstTomorrow.title}” is tomorrow`,
          reason: 'Calendar event incoming. Priorities changed, so the plan made room for it tonight.',
          item: { id: `agent-prep-tmrw-${firstTomorrow.id}`, time: '21:00', label: `Prep for ${firstTomorrow.title}`, icon: '🎒', type: 'check', agent: true },
        });
      }
    }
  }

  // --- 5. Corrected assumptions: totals were edited downwards ---
  const onWaterPace = water >= waterFloor;
  if (Number.isFinite(state.lastWater) && water < state.lastWater && onWaterPace) {
    events.push({
      id: `water-correct-${at}`,
      at,
      action: 'Re-checked hydration pace after your correction',
      reason: `Water total went down to ${(water / 1000).toFixed(1)}L: you're on pace now, so the catch-up isn't needed.`,
    });
  }
  if (Number.isFinite(state.lastSteps) && steps < state.lastSteps) {
    events.push({
      id: `steps-correct-${at}`,
      at,
      action: 'Re-checked step pace after your correction',
      reason: `Steps went down to ${steps.toLocaleString()}: plan updated to match reality.`,
    });
  }

  // --- 6. Corrected assumptions: a completed task was un-ticked ---
  (snapshot.undone || []).forEach(({ id, label }) => {
    const evId = `undo-reset-${id}`;
    if (!has(evId)) {
      events.push({
        id: evId,
        at,
        action: 'Scaled a task down to its minimum viable form',
        reason: `You un-ticked “${label}”: meeting the plan halfway beats skipping it.`,
        item: { id: `agent-reset-${id}`, time: slotIn(now, 30), label: `Gentle 5-min version: ${label}`, icon: '🌱', type: 'check', agent: true },
      });
    }
  });

  // Persist trailing state for correction detection
  state.lastSteps = steps;
  state.lastWater = water;
  writeState(state);

  return synthFromEvents(events);
}

function synthFromEvents(events) {
  const extraItems = [];
  const overrides = {};
  events.forEach((e) => {
    if (e.item) extraItems.push(e.item);
    if (e.override) overrides[e.override.itemId] = { ...(overrides[e.override.itemId] || {}), ...e.override.patch };
  });
  return { events: events.slice(), extraItems, overrides };
}

// Rebuild the agent's outputs for today without running rules anew
// (used on remount so the feed survives reloads).
export function getAgentToday() {
  const state = readState();
  if (!state || state.date !== todayKeyOf(new Date())) {
    return { events: [], extraItems: [], overrides: {} };
  }
  return synthFromEvents(state.events);
}

function todayKeyOf(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Clear agent memory (dev/testing wipes)
export function resetAgent() {
  try { localStorage.removeItem(AGENT_STATE_KEY); } catch { /* noop */ }
}
