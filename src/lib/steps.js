// Steps tracker — tries the experimental Generic Sensor API on phones,
// falls back to manual entry on desktop / unsupported browsers.
// Honest about what's a real measurement vs manual input.

import { todayKey } from './storage';

export const DAILY_STEP_GOAL = 8000;

// Check if the browser exposes a step-capable sensor.
// Most desktops return false; some mobile browsers (Chrome on Android, Safari on iOS)
// may expose 'linear-acceleration' but rarely a true pedometer.
export async function tryNativeStepSensor() {
  try {
    if (typeof window === 'undefined') return null;
    if (!('Permissions' in navigator)) return null;

    // Try permission API first to see if motion sensors are available
    try {
      const result = await navigator.permissions.query({ name: 'accelerometer' });
      if (result.state === 'denied') return null;
    } catch {
      // Permissions API doesn't know accelerometer — that's fine, try anyway
    }

    if ('LinearAccelerationSensor' in window) {
      return { type: 'linear-acceleration', name: 'LinearAccelerationSensor' };
    }
    if ('Accelerometer' in window) {
      return { type: 'accelerometer', name: 'Accelerometer' };
    }
    return null;
  } catch {
    return null;
  }
}

export function getTodaySteps(steps) {
  return steps[todayKey()] || 0;
}

export function getStepProgress(steps, date) {
  const count = steps[date] || 0;
  return Math.min(100, Math.round((count / DAILY_STEP_GOAL) * 100));
}