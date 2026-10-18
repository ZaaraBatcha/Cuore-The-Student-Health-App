// Calendar helpers: month grid, event matching, reminder lead times

export const REMINDER_OPTIONS = [
  { id: 'same_day', label: 'Same day', days: 0 },
  { id: '1_day', label: '1 day before', days: 1 },
  { id: '3_days', label: '3 days before', days: 3 },
  { id: '1_week', label: '1 week before', days: 7 },
  { id: '2_weeks', label: '2 weeks before', days: 14 },
];

export function getReminderOption(id) {
  return REMINDER_OPTIONS.find((r) => r.id === id) || REMINDER_OPTIONS[1];
}

// Build a 6-row grid of dates for the month view.
// Returns { weeks: [[{date, inMonth, isToday}]] }
export function monthGrid(year, month /* 0-11 */) {
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // 0 = Sunday
  const grid = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday before (or on) the 1st
  const start = new Date(year, month, 1 - startDay);

  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      week.push({
        date,
        inMonth: date.getMonth() === month,
        isToday: sameDay(date, today),
      });
    }
    grid.push(week);
  }
  return grid;
}

export function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function monthName(month) {
  return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][month];
}

// Group appointments by date (YYYY-MM-DD)
export function groupByDate(appointments) {
  const map = {};
  appointments.forEach((app) => {
    const d = new Date(app.start);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(app);
  });
  return map;
}

// Returns upcoming reminders (within next 14 days) based on lead-time settings
export function upcomingReminders(appointments) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + 14);

  const out = [];
  appointments.forEach((app) => {
    const start = new Date(app.start);
    (app.reminders || []).forEach((rid) => {
      const opt = getReminderOption(rid);
      const remindAt = new Date(start);
      remindAt.setDate(remindAt.getDate() - opt.days);
      if (remindAt >= now && remindAt <= horizon) {
        out.push({
          appointment: app,
          reminderOption: opt,
          remindAt,
        });
      }
    });
  });
  out.sort((a, b) => a.remindAt - b.remindAt);
  return out;
}

// Pretty time like "Mon 3 Nov, 2:30 PM"
export function formatDateTime(date) {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(date) {
  return date.toLocaleString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}