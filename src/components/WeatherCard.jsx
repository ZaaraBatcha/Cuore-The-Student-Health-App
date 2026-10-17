import { useEffect, useState } from 'react';
import { fetchWeather, weatherSuggestion } from '../lib/weather';

export default function WeatherCard() {
  const [state, setState] = useState({ loading: true, weather: null, suggestion: null });

  useEffect(() => {
    let cancelled = false;
    fetchWeather().then((weather) => {
      if (cancelled) return;
      const suggestion = weatherSuggestion(weather);
      setState({ loading: false, weather, suggestion });
    });
    return () => { cancelled = true; };
  }, []);

  if (state.loading) {
    return (
      <div className="card-leaf mb-4 animate-pulse">
        <div className="h-4 bg-white rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-white rounded w-2/3"></div>
      </div>
    );
  }

  if (!state.weather) return null;
  const { today, suggestion } = state;
  if (!today) return null;

  return (
    <div className="card-leaf mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center text-base">☀️</span>
            <div className="text-xs uppercase tracking-wide font-semibold text-mint-700">
              Today's weather
            </div>
          </div>
          <div className="flex items-center gap-2 text-mint-900 text-base font-medium">
            <span>{today.label}</span>
            <span className="text-mint-700">·</span>
            <span>{today.high}° / {today.low}°</span>
            {today.rainProb >= 30 && (
              <span className="chip-leaf text-xs">💧 {today.rainProb}%</span>
            )}
          </div>
          {suggestion && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-white/70 border border-mint-200">
              <p className="text-sm text-mint-800 leading-relaxed">
                <span className="mr-1.5">{suggestion.icon}</span>
                {suggestion.text}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}