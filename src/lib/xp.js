// XP & Level system
// Every action grants points. Crossing a level boundary grows a plant in the garden.

export const XP_RULES = {
  SCHEDULE_ITEM: 10,
  MED_TAKEN: 5,
  LOG_ENTRY: 3,
};

export const XP_PER_LEVEL = 100;

// Total points → level number (1, 2, 3, ...)
export function levelFromPoints(points) {
  return Math.floor(points / XP_PER_LEVEL) + 1;
}

// Points into the current level (0..XP_PER_LEVEL-1)
export function progressInLevel(points) {
  return points % XP_PER_LEVEL;
}

// Percentage toward the next level (0..100)
export function levelPercent(points) {
  return Math.round((progressInLevel(points) / XP_PER_LEVEL) * 100);
}

// Number of plants in the garden = level - 1
export function plantsInGarden(points) {
  return Math.max(0, levelFromPoints(points) - 1);
}

// Plant species picker: deterministic so each "slot" gets a consistent plant
// Flowers first: the first plant a student ever grows should look like a flower.
const SPECIES = ['daisy', 'tulip', 'sunflower', 'sprout', 'bush', 'tree', 'mushroom', 'bluebell'];

export function plantSpecies(slotIndex) {
  return SPECIES[slotIndex % SPECIES.length];
}

// Palette for a plant species
export function plantPalette(species) {
  switch (species) {
    case 'sprout':
      return { name: 'Sprout', emoji: '🌱', stem: '#427d60', accent: '#427d60' };
    case 'daisy':
      return { name: 'Daisy', emoji: '🌼', stem: '#7bb392', petal: '#fdfcf8', center: '#fde68a', accent: '#fbcfe8' };
    case 'tulip':
      return { name: 'Tulip', emoji: '🌷', stem: '#7bb392', petal: '#f9a8d4', center: '#f9a8d4', accent: '#bfdbfe' };
    case 'sunflower':
      return { name: 'Sunflower', emoji: '🌻', stem: '#7bb392', petal: '#fde68a', center: '#9a5d44', accent: '#fde68a' };
    case 'bush':
      return { name: 'Bush', emoji: '🌳', stem: '#5a9a78', accent: '#7bb392' };
    case 'tree':
      return { name: 'Tree', emoji: '🌳', stem: '#5a9a78', accent: '#427d60' };
    case 'mushroom':
      return { name: 'Mushroom', emoji: '🍄', stem: '#fdfcf8', accent: '#c98a6f' };
    case 'bluebell':
      return { name: 'Bluebell', emoji: '🔵', stem: '#7bb392', petal: '#bfdbfe', center: '#c4b5fd', accent: '#bfdbfe' };
    default:
      return { name: 'Plant', stem: '#7bb392', accent: '#5a9a78' };
  }
}