// Weekly insights — find patterns from the last 7 days of logs
// Student-wellbeing focused: moods, activity, study, sleep patterns.

import { todayKey } from './storage';

export function getWeeklyInsights(logs) {
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const recent = logs.filter((l) => new Date(l.timestamp) >= weekAgo);

  if (recent.length === 0) {
    return {
      summary: 'No entries yet this week. Start logging to see patterns.',
      patterns: [],
      count: 0,
      mirror: null,
    };
  }

  const patterns = [];

  // Mood patterns
  const moods = recent.filter((l) => l.type === 'mood' && l.tags?.length);
  if (moods.length >= 2) {
    const tagCounts = {};
    moods.forEach((m) => m.tags.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    }));
    const top = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] >= 2) {
      patterns.push({
        kind: 'mood',
        title: 'Most common feeling',
        detail: `“${top[0]}” came up ${top[1]} time${top[1] > 1 ? 's' : ''} this week.`,
        tone: 'soft',
      });
    }
  }

  // Activity patterns
  const activities = recent.filter((l) => l.type === 'activity');
  if (activities.length >= 3) {
    const walkCount = activities.filter((a) => /walk/i.test(a.note || '')).length;
    if (walkCount >= 2) {
      patterns.push({
        kind: 'activity',
        title: 'Movement this week',
        detail: `You logged ${activities.length} activities, including ${walkCount} walk${walkCount === 1 ? '' : 's'}.`,
        tone: 'good',
      });
    }
  }

  // Logging streak
  const daysWithLogs = new Set(recent.map((l) => l.timestamp.slice(0, 10))).size;
  patterns.push({
    kind: 'streak',
    title: 'Logging streak',
    detail: `You logged on ${daysWithLogs} of the last 7 days.`,
    tone: daysWithLogs >= 5 ? 'good' : 'neutral',
  });

  // Best day of week
  const byDay = {};
  recent.forEach((l) => {
    const day = new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
    byDay[day] = (byDay[day] || 0) + 1;
  });
  const topDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
  if (topDay) {
    patterns.push({
      kind: 'day',
      title: 'You log most often on…',
      detail: `${topDay[0]}s, with ${topDay[1]} entries.`,
      tone: 'neutral',
    });
  }

  const summary = `${recent.length} entries logged this week. ${
    daysWithLogs >= 5 ? 'Strong consistency — keep it going.' : 'Try logging a little more often to see clearer patterns.'
  }`;

  // Pattern Mirror
  const mirror = computeMirror(recent);

  return { summary, patterns, count: recent.length, mirror };
}

function computeMirror(recent) {
  if (recent.length < 3) return null;

  // 1. Best day of week by mood tags
  const moodLogs = recent.filter((l) => l.type === 'mood' && l.tags?.length);
  if (moodLogs.length >= 2) {
    const dayMoods = {};
    moodLogs.forEach((l) => {
      const day = new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'long' });
      const positives = l.tags.filter((t) => ['energized', 'happy', 'great', 'calm', 'focused'].includes(t));
      if (positives.length && !dayMoods[day]) dayMoods[day] = 0;
      if (positives.length) dayMoods[day] += positives.length;
    });
    const best = Object.entries(dayMoods).sort((a, b) => b[1] - a[1])[0];
    if (best && best[1] >= 2) {
      return { kind: 'mood_day', text: `You feel best on ${best[0]}s.`, tone: 'good' };
    }
  }

  // 2. Activity & mood correlation
  const activities = recent.filter((l) => l.type === 'activity');
  if (activities.length >= 3 && moodLogs.length >= 3) {
    const activeDays = new Set(activities.map((a) => a.timestamp.slice(0, 10)));
    const positiveOnActive = moodLogs.filter((m) =>
      activeDays.has(m.timestamp.slice(0, 10)) &&
      m.tags.some((t) => ['energized', 'great', 'happy'].includes(t))
    );
    if (positiveOnActive.length >= 2) {
      return {
        kind: 'walk_mood',
        text: `You feel better on days you move your body.`,
        tone: 'good',
      };
    }
  }

  // 3. Logging gap (encouraging)
  const daysSinceLastLog = recent.length > 0
    ? Math.floor((Date.now() - new Date(recent[0].timestamp)) / (1000 * 60 * 60 * 24))
    : null;
  if (recent.length >= 3 && daysSinceLastLog !== null && daysSinceLastLog <= 7) {
    return {
      kind: 'gentle',
      text: `You're showing up for yourself this week. That's the hardest part.`,
      tone: 'good',
    };
  }

  return null;
}