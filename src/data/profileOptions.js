// Profile option sets — used in the survey and stored alongside the user profile

export const AGE_RANGES = [
  { id: 'under_18', label: 'Under 18', min: 0, max: 17 },
  { id: '18_29', label: '18 – 29', min: 18, max: 29 },
  { id: '30_44', label: '30 – 44', min: 30, max: 44 },
  { id: '45_64', label: '45 – 64', min: 45, max: 64 },
  { id: '65_plus', label: '65 and over', min: 65, max: 120 },
];

export const FITNESS_LEVELS = [
  {
    id: 'low',
    label: 'Low',
    description: 'I spend most of my day sitting. Walking is hard for me.',
    walkMinutes: 5,
    activityLabel: 'Gentle movement',
  },
  {
    id: 'moderate',
    label: 'Moderate',
    description: 'I walk or move regularly. A short walk is easy.',
    walkMinutes: 10,
    activityLabel: 'Brisk walk',
  },
  {
    id: 'active',
    label: 'Active',
    description: 'I exercise most days. I can sustain activity for 20+ minutes.',
    walkMinutes: 20,
    activityLabel: 'Active session',
  },
];

export function getFitnessLevel(id) {
  return FITNESS_LEVELS.find((l) => l.id === id) || FITNESS_LEVELS[1];
}

export function getAgeRange(id) {
  return AGE_RANGES.find((r) => r.id === id) || AGE_RANGES[2];
}