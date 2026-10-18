// Leaderboard: multi-profile on a single device.
// This is a demo of how a social layer would work; in production it would
// talk to a backend. Each profile keeps its own step/water data locally
// so you can compare with friends who use the same device.

import { storage } from './storage';
import { todayKey } from './storage';

const DEFAULT_PROFILES = [
  { id: 'you',     name: 'You',         emoji: '🌱', isMe: true,  color: '#5a9a78' },
  { id: 'alex',    name: 'Aisha',       emoji: '🌻', isMe: false, color: '#f59e0b' },
  { id: 'priya',   name: 'Clarice',     emoji: '🌼', isMe: false, color: '#ec4899' },
  { id: 'jordan',  name: 'Alhaam',      emoji: '🌳', isMe: false, color: '#7c3aed' },
];

// Synthesize realistic step data for demo profiles (so the leaderboard isn't empty
// on first run). Uses deterministic pseudo-random based on profile id + day so
// numbers are stable day-to-day.
function seedStepsForProfile(profileId, dateKey) {
  let seed = 0;
  for (let i = 0; i < profileId.length; i++) seed = (seed * 31 + profileId.charCodeAt(i)) | 0;
  for (let i = 0; i < dateKey.length; i++) seed = (seed * 17 + dateKey.charCodeAt(i)) | 0;
  const rng = (n) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return ((seed >> 16) % n);
  };
  // 70% chance of being "active" today, varying 3k–12k steps
  const active = rng(100) > 30;
  if (!active) return 800 + rng(2000);
  return 4500 + rng(7500);
}

function ensureLeaderboardSeeded() {
  // The "you" row always mirrors the name the student gave in the survey,
  // so a fresh install never shows someone else's name.
  const userProfile = storage.getProfile();
  const myName = (userProfile && userProfile.name && userProfile.name.trim()) || 'You';

  const existing = storage.getLeaderboard();
  if (existing.length > 0) {
    const namesById = new Map(DEFAULT_PROFILES.map(({ id, name }) => [id, name]));
    namesById.set('you', myName);
    let changed = false;
    const updated = existing.map((profile) => {
      const name = namesById.get(profile.id);
      if (name && profile.name !== name) {
        changed = true;
        return { ...profile, name };
      }
      return profile;
    });
    if (changed) storage.saveLeaderboard(updated);
    return updated;
  }

  const today = todayKey();
  const seeded = DEFAULT_PROFILES.map((p) => ({
    ...p,
    name: p.id === 'you' ? myName : p.name,
    // Your own row starts empty and fills from your real steps. Only the
    // friends get synthesized numbers so the board is not blank.
    stepsByDate: { [today]: p.id === 'you' ? 0 : seedStepsForProfile(p.id, today) },
  }));
  storage.saveLeaderboard(seeded);
  return seeded;
}

export function getLeaderboard() {
  return ensureLeaderboardSeeded();
}

export function getProfile(id) {
  return getLeaderboard().find((p) => p.id === id);
}

// Update a profile's step count for a given date.
export function setProfileSteps(profileId, dateKey, count) {
  const profiles = getLeaderboard();
  const p = profiles.find((x) => x.id === profileId);
  if (!p) return profiles;
  if (!p.stepsByDate) p.stepsByDate = {};
  p.stepsByDate[dateKey] = Math.max(0, parseInt(count) || 0);
  storage.saveLeaderboard(profiles);
  return profiles;
}

// Update water for a profile. Water totals are derived from logs.
export function setProfileWaterTotal(profileId, dateKey, totalMl) {
  const profiles = getLeaderboard();
  const p = profiles.find((x) => x.id === profileId);
  if (!p) return profiles;
  if (!p.waterByDate) p.waterByDate = {};
  p.waterByDate[dateKey] = Math.max(0, parseInt(totalMl) || 0);
  storage.saveLeaderboard(profiles);
  return profiles;
}

// Compute plant count for a profile based on their lifetime XP (steps + water).
// 1 plant per 2000 lifetime step-equivalents. Pure deterministic for fairness.
export function plantsForProfile(profile) {
  if (!profile.stepsByDate) return 0;
  const totalSteps = Object.values(profile.stepsByDate).reduce((a, b) => a + b, 0);
  const totalWater = Object.values(profile.waterByDate || {}).reduce((a, b) => a + b, 0);
  const stepEquiv = totalSteps + totalWater * 10; // water counts a bit less
  return Math.floor(stepEquiv / 2000);
}

// Rank profiles by today's steps. Returns array sorted highest-first
// with rank, formatted name, steps, plant count, and a water level (0..1).
export function rankedToday() {
  const profiles = getLeaderboard();
  const today = todayKey();
  return profiles
    .map((p) => ({
      ...p,
      todaySteps: (p.stepsByDate && p.stepsByDate[today]) || 0,
      todayWater: (p.waterByDate && p.waterByDate[today]) || 0,
      plants: plantsForProfile(p),
    }))
    .sort((a, b) => b.todaySteps - a.todaySteps)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}