// Habit streaks: derived from the medicationLogs history.
// A streak counts consecutive days marked "taken", ending today.
// Today not being logged yet doesn't break a streak; today marked "missed" does.

import { todayKey } from './storage';

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Returns { medId: streakLength }
export function getHabitStreaks(medLogs) {
  const streaks = {};
  const medIds = new Set();
  Object.values(medLogs).forEach((day) => {
    Object.keys(day).forEach((id) => medIds.add(id));
  });

  const today = todayKey();
  medIds.forEach((id) => {
    const todayStatus = (medLogs[today] || {})[id];
    if (todayStatus === false) {
      streaks[id] = 0;
      return;
    }
    const cursor = new Date();
    if (todayStatus !== true) {
      cursor.setDate(cursor.getDate() - 1); // today pending: streak can still be alive
    }
    let streak = 0;
    for (let i = 0; i < 366; i++) {
      const status = (medLogs[dayKey(cursor)] || {})[id];
      if (status === true) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break; // missed or a gap in logs ends the streak
      }
    }
    streaks[id] = streak;
  });
  return streaks;
}
