// Default daily schedule for student wellbeing
// Replaces the previous chronic-illness schedules.

export const STUDENT_DAY = [
  { id: 'wake',      time: '07:30', label: 'Wake up & drink water',   icon: '☀️', type: 'check' },
  { id: 'breakfast', time: '08:00', label: 'Breakfast',               icon: '🥣', type: 'meal'  },
  { id: 'focus1',    time: '09:00', label: 'Morning focus session',   icon: '📚', type: 'check' },
  { id: 'water1',    time: '10:30', label: 'Water break',             icon: '💧', type: 'check' },
  { id: 'walk1',     time: '12:00', label: 'Lunchtime walk',          icon: '🚶', type: 'activity' },
  { id: 'lunch',     time: '12:30', label: 'Lunch',                   icon: '🥗', type: 'meal' },
  { id: 'focus2',    time: '14:00', label: 'Afternoon focus session', icon: '✏️', type: 'check' },
  { id: 'water2',    time: '15:30', label: 'Water break',             icon: '💧', type: 'check' },
  { id: 'exercise',  time: '17:00', label: 'Move your body',          icon: '🏃', type: 'activity' },
  { id: 'dinner',    time: '19:00', label: 'Dinner',                  icon: '🍲', type: 'meal' },
  { id: 'wind',      time: '21:30', label: 'Wind down',               icon: '📵', type: 'check' },
  { id: 'sleep',     time: '22:30', label: 'Bedtime',                 icon: '🌙', type: 'check' },
];

export function timeBucket(time) {
  const hour = parseInt(time.split(':')[0], 10);
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}