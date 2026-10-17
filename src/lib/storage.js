// LocalStorage helpers — all data lives in the browser for the hackathon

const KEYS = {
  LOGS: 'wisetrack.logs',
  COMPLETIONS: 'wisetrack.completions',
  PROFILE: 'wisetrack.profile',
  MEDICATIONS: 'wisetrack.medications',
  MED_LOGS: 'wisetrack.medicationLogs',
  APPOINTMENTS: 'wisetrack.appointments',
  SETTINGS: 'wisetrack.settings',
  XP: 'wisetrack.xp',
  STEPS: 'wisetrack.steps',
  WATER: 'wisetrack.water',
  LEADERBOARD: 'wisetrack.leaderboard',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write failed', e);
  }
}

export const storage = {
  getLogs() {
    return read(KEYS.LOGS, []);
  },
  addLog(entry) {
    const logs = storage.getLogs();
    const withId = { id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...entry };
    logs.push(withId);
    write(KEYS.LOGS, logs);
    return logs;
  },

  getCompletions() {
    return read(KEYS.COMPLETIONS, {});
  },
  toggleCompletion(dateKey, scheduleItemId) {
    const all = storage.getCompletions();
    const day = all[dateKey] || {};
    day[scheduleItemId] = !day[scheduleItemId];
    all[dateKey] = day;
    write(KEYS.COMPLETIONS, all);
    return all;
  },

  getProfile() {
    return read(KEYS.PROFILE, null);
  },
  setProfile(profile) {
    write(KEYS.PROFILE, profile);
  },
  clearProfile() {
    localStorage.removeItem(KEYS.PROFILE);
  },

  getMedications() {
    return read(KEYS.MEDICATIONS, []);
  },
  setMedications(meds) {
    write(KEYS.MEDICATIONS, meds);
  },
  addMedication(med) {
    const meds = storage.getMedications();
    const next = { id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ...med };
    meds.push(next);
    storage.setMedications(meds);
    return meds;
  },
  removeMedication(id) {
    const meds = storage.getMedications().filter((m) => m.id !== id);
    storage.setMedications(meds);
    return meds;
  },

  getMedLogs() {
    return read(KEYS.MED_LOGS, {});
  },
  setMedLog(dateKey, medId, taken) {
    const logs = storage.getMedLogs();
    const day = logs[dateKey] || {};
    day[medId] = taken;
    logs[dateKey] = day;
    write(KEYS.MED_LOGS, logs);
    return logs;
  },

  getAppointments() {
    return read(KEYS.APPOINTMENTS, []);
  },
  setAppointments(apps) {
    write(KEYS.APPOINTMENTS, apps);
  },
  addAppointment(app) {
    const apps = storage.getAppointments();
    const next = { id: `app_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, reminders: [], ...app };
    apps.push(next);
    storage.setAppointments(apps);
    return apps;
  },
  updateAppointment(id, patch) {
    const apps = storage.getAppointments().map((a) => (a.id === id ? { ...a, ...patch } : a));
    storage.setAppointments(apps);
    return apps;
  },
  removeAppointment(id) {
    const apps = storage.getAppointments().filter((a) => a.id !== id);
    storage.setAppointments(apps);
    return apps;
  },

  getSettings() {
    return read(KEYS.SETTINGS, { voiceInput: true, readAloud: true });
  },
  setSettings(patch) {
    const cur = storage.getSettings();
    write(KEYS.SETTINGS, { ...cur, ...patch });
  },

  getXP() {
    return read(KEYS.XP, { points: 0, lastSeenLevel: 1 });
  },
  addXP(amount) {
    const cur = storage.getXP();
    write(KEYS.XP, { points: cur.points + amount, lastSeenLevel: cur.lastSeenLevel });
    return storage.getXP();
  },
  markLevelSeen(level) {
    const cur = storage.getXP();
    write(KEYS.XP, { ...cur, lastSeenLevel: level });
  },

  // Steps tracking: { 'YYYY-MM-DD': count }
  getSteps() {
    return read(KEYS.STEPS, {});
  },
  setSteps(date, count) {
    const all = storage.getSteps();
    all[date] = Math.max(0, parseInt(count) || 0);
    write(KEYS.STEPS, all);
    return all;
  },
  addSteps(date, delta) {
    const all = storage.getSteps();
    all[date] = Math.max(0, (all[date] || 0) + delta);
    write(KEYS.STEPS, all);
    return all;
  },

  // Water tracking: { 'YYYY-MM-DD': [{ time, ml }, ...] }
  getWater() {
    return read(KEYS.WATER, {});
  },
  addWater(date, ml) {
    const all = storage.getWater();
    if (!all[date]) all[date] = [];
    all[date].push({ time: new Date().toISOString(), ml });
    write(KEYS.WATER, all);
    return all;
  },
  removeWater(date, index) {
    const all = storage.getWater();
    if (all[date]) {
      all[date].splice(index, 1);
      write(KEYS.WATER, all);
    }
    return all;
  },
  getWaterTotal(date) {
    const day = storage.getWater()[date] || [];
    return day.reduce((sum, e) => sum + e.ml, 0);
  },

  // Leaderboard — multi-profile on this device (demo)
  getLeaderboard() {
    return read(KEYS.LEADERBOARD, []);
  },
  saveLeaderboard(profiles) {
    write(KEYS.LEADERBOARD, profiles);
  },

  clearAll() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}