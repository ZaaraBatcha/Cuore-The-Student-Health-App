import { useState } from 'react';
import { storage, todayKey } from '../lib/storage';

const DAILY_WATER_GOAL_ML = 2000;

// Compact water card, matching the Steps card: value+goal on one line,
// thin progress bar, two quick buttons, exact entry behind a toggle.
export default function WaterTracker() {
  const [tick, setTick] = useState(0);
  const [showExact, setShowExact] = useState(false);
  const [input, setInput] = useState('');

  const today = todayKey();
  const totalMl = storage.getWaterTotal(today);
  const pct = Math.min(100, Math.round((totalMl / DAILY_WATER_GOAL_ML) * 100));

  function add(ml) {
    storage.addWater(today, ml);
    setTick((n) => n + 1);
  }

  function handleSet() {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n >= 0) {
      storage.setWaterTotal(today, n);
      setInput('');
      setShowExact(false);
      setTick((n) => n + 1);
    }
  }

  return (
    <div className="card bg-white border-mint-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-mint-900">💧 Water</span>
        <span className="text-sm text-mint-700">
          <span className="font-bold text-mint-900">{(totalMl / 1000).toFixed(1)}L</span>
          <span className="text-mint-600"> / {(DAILY_WATER_GOAL_ML / 1000).toFixed(0)}L</span>
        </span>
      </div>

      <div className="h-2 bg-mint-100 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-gradient-to-r from-mint-300 via-mint-400 to-mint-600 transition-all duration-500 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      {showExact ? (
        <div className="flex gap-1.5">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSet()}
            placeholder="Exact ml"
            className="input text-xs py-1.5"
            min="0"
            autoFocus
          />
          <button onClick={handleSet} className="btn-primary text-xs px-3">Save</button>
          <button onClick={() => setShowExact(false)} className="btn-secondary text-xs px-2">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button onClick={() => add(250)} className="btn-secondary flex-1 text-xs py-1.5">+250ml</button>
          <button onClick={() => setShowExact(true)} className="text-xs text-mint-700 font-medium px-2 py-1.5 hover:underline">Exact</button>
        </div>
      )}
    </div>
  );
}
