import { useState } from 'react';
import { storage, todayKey } from '../lib/storage';

const DAILY_WATER_GOAL_ML = 2000;
const QUICK_ADDS = [250, 330, 500, 750];

export default function WaterTracker() {
  const [water, setWater] = useState(() => storage.getWater());
  const today = todayKey();
  const entries = water[today] || [];
  const totalMl = entries.reduce((sum, e) => sum + e.ml, 0);
  const pct = Math.min(100, Math.round((totalMl / DAILY_WATER_GOAL_ML) * 100));

  function handleAdd(ml) {
    storage.addWater(today, ml);
    setWater(storage.getWater());
  }

  function handleRemove(idx) {
    storage.removeWater(today, idx);
    setWater(storage.getWater());
  }

  return (
    <div className="card-mint mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">💧</div>
          <div>
            <div className="font-bold text-mint-900">Water</div>
            <div className="text-xs text-mint-700">Goal: {(DAILY_WATER_GOAL_ML / 1000).toFixed(1)}L</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-mint-800">{(totalMl / 1000).toFixed(2)}L</div>
          <div className="text-xs text-mint-600">{pct}% of goal</div>
        </div>
      </div>

      <div className="h-3 bg-white/70 rounded-full overflow-hidden shadow-inner mb-3">
        <div
          className="h-full bg-gradient-to-r from-mint-300 via-mint-400 to-mint-600 transition-all duration-700 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex gap-2 mb-3">
        {QUICK_ADDS.map((ml) => (
          <button key={ml} onClick={() => handleAdd(ml)} className="btn-secondary flex-1 text-sm py-2">
            +{ml}ml
          </button>
        ))}
      </div>

      {entries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {entries.slice().reverse().map((e, i) => {
            const realIdx = entries.length - 1 - i;
            return (
              <button
                key={`${e.time}-${realIdx}`}
                onClick={() => handleRemove(realIdx)}
                title="Tap to remove"
                className="chip text-xs hover:bg-clay-400/20"
              >
                {e.ml}ml
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}