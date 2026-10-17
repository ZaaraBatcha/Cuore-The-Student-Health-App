// Weather — uses Open-Meteo (no API key, no signup, fully free).
// Falls back gracefully if geolocation is denied or network fails.

const WEATHER_CACHE_KEY = 'wisetrack.weather';
const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

// Map Open-Meteo weather codes to friendly labels
// https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODE_LABELS = {
  0: { label: 'Clear', emoji: '☀️' },
  1: { label: 'Mainly clear', emoji: '🌤️' },
  2: { label: 'Partly cloudy', emoji: '⛅' },
  3: { label: 'Overcast', emoji: '☁️' },
  45: { label: 'Fog', emoji: '🌫️' },
  48: { label: 'Rime fog', emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle', emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌧️' },
  61: { label: 'Light rain', emoji: '🌦️' },
  63: { label: 'Rain', emoji: '🌧️' },
  65: { label: 'Heavy rain', emoji: '🌧️' },
  71: { label: 'Light snow', emoji: '🌨️' },
  73: { label: 'Snow', emoji: '❄️' },
  75: { label: 'Heavy snow', emoji: '❄️' },
  80: { label: 'Showers', emoji: '🌦️' },
  81: { label: 'Heavy showers', emoji: '🌧️' },
  82: { label: 'Violent showers', emoji: '⛈️' },
  95: { label: 'Thunderstorm', emoji: '⛈️' },
};

export function describeWeatherCode(code) {
  return WEATHER_CODE_LABELS[code] || { label: 'Unknown', emoji: '🌥️' };
}

// Try to get coordinates: cached first, then geolocation, then IP fallback
export async function getCoordinates() {
  // 1. Cached
  const cached = readWeatherCache();
  if (cached?.latitude && cached?.longitude) {
    return { latitude: cached.latitude, longitude: cached.longitude, source: 'cache' };
  }

  // 2. Browser geolocation
  if (navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          maximumAge: 60 * 60 * 1000,
        });
      });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      writeWeatherCache({ ...coords, fetchedAt: Date.now() });
      return { ...coords, source: 'geolocation' };
    } catch {
      // Fall through to IP lookup
    }
  }

  // 3. IP-based (no permission needed)
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      if (data.latitude && data.longitude) {
        const coords = { latitude: data.latitude, longitude: data.longitude };
        writeWeatherCache({ ...coords, fetchedAt: Date.now() });
        return { ...coords, source: 'ip' };
      }
    }
  } catch {
    // ignore
  }

  // 4. Fallback: London. Better than nothing.
  return { latitude: 51.5074, longitude: -0.1278, source: 'fallback' };
}

// Fetch weather for the next day (today + tomorrow) at the user's location
export async function fetchWeather() {
  const cached = readWeatherCache();
  if (cached?.forecast && Date.now() - (cached.fetchedAt || 0) < CACHE_TTL_MS) {
    return cached.forecast;
  }

  const coords = await getCoordinates();
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max&current_weather=true&timezone=auto&forecast_days=2`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    const data = await res.json();
    const forecast = shape(data);
    writeWeatherCache({ ...coords, forecast, fetchedAt: Date.now() });
    return forecast;
  } catch {
    return null;
  }
}

function shape(data) {
  const today = data?.daily;
  const current = data?.current_weather;
  if (!today || !today.time?.length) return null;

  const tomorrowIdx = 1;
  const todayCode = today.weathercode[0];
  const tomorrowCode = today.weathercode[tomorrowIdx];

  // Merge description into the today object so it always has the required fields
  const todayDesc = describeWeatherCode(todayCode);
  const tomorrowDesc = describeWeatherCode(tomorrowCode);

  return {
    now: current ? {
      temperature: Math.round(current.temperature),
      code: current.weathercode,
      label: describeWeatherCode(current.weathercode).label,
      emoji: describeWeatherCode(current.weathercode).emoji,
    } : null,
    today: {
      high: Math.round(today.temperature_2m_max[0]),
      low: Math.round(today.temperature_2m_min[0]),
      rainProb: today.precipitation_probability_max[0] ?? 0,
      label: todayDesc.label,
      emoji: todayDesc.emoji,
    },
    tomorrow: {
      high: Math.round(today.temperature_2m_max[tomorrowIdx]),
      low: Math.round(today.temperature_2m_min[tomorrowIdx]),
      rainProb: today.precipitation_probability_max[tomorrowIdx] ?? 0,
      label: tomorrowDesc.label,
      emoji: tomorrowDesc.emoji,
    },
  };
}

// Generate a single gentle suggestion based on tomorrow's weather
// Student-wellbeing focused (no chronic-illness specifics).
export function weatherSuggestion(weather) {
  if (!weather) return null;
  const tomorrow = weather.tomorrow;

  if (tomorrow.high >= 30) {
    return {
      icon: '🥤',
      text: `Hot tomorrow (${tomorrow.high}°C). Hydrate well before any activity — heat dehydrates fast.`,
    };
  }
  if (tomorrow.high <= 5) {
    return {
      icon: '🧣',
      text: `Cold tomorrow (high ${tomorrow.high}°C). Layer up if you're walking outside.`,
    };
  }
  if (tomorrow.rainProb >= 60) {
    return {
      icon: '🌧️',
      text: `Wet weather tomorrow. A short indoor walk still counts — even 5 laps around your room.`,
    };
  }
  if (tomorrow.high >= 18 && tomorrow.high <= 26 && tomorrow.rainProb < 30) {
    return {
      icon: '🌤️',
      text: `Pleasant weather tomorrow. Good day to get your steps outside.`,
    };
  }
  return {
    icon: tomorrow.emoji,
    text: `${tomorrow.label} tomorrow, ${tomorrow.high}°. A good day to keep your routine steady.`,
  };
}

function readWeatherCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeWeatherCache(value) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}