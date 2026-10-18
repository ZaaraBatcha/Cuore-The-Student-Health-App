import { useState } from 'react';
import { storage, todayKey } from '../lib/storage';
import { DAILY_STEP_GOAL, getStepProgress, tryNativeStepSensor } from '../lib/steps';
import { setProfileSteps } from '../lib/leaderboard';

// Compact step card: one line for value+goal, one thin bar, two quick
// buttons, and manual entry tucked behind a small "Exact" toggle.
export default function StepsTracker() {
  const [steps, setSteps] = useState(() => storage.getSteps());
  const [showExact, setShowExact] = useState(false);
  const [input, setInput] = useState('');

  const today = todayKey();
  const todaySteps = steps[today] || 0;
  const pct = getStepProgress(steps, today);

  // Probe for a native motion sensor quietly (no busy text, keeps UI calm).
  useState(() => { tryNativeStepSensor(); });

  function apply(next) {
    storage.setSteps(today, next);
    setProfileSteps('you', today, next);
    setSteps(storage.getSteps());
  }

  function handleAdd(delta) {
    apply(todaySteps + delta);
  }

  function handleSet() {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n >= 0) {
      apply(n);
      setInput('');
      setShowExact(false);
    }
  }

  return (
    <div className="card bg-white border-mint-200 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-mint-900">👟 Steps</span>
        <span className="text-sm text-mint-700">
          <span className="font-bold text-mint-900">{todaySteps.toLocaleString()}</span>
          <span className="text-mint-600"> / {DAILY_STEP_GOAL.toLocaleString()}</span>
        </span>
      </div>

      <div className="h-2 bg-mint-100 rounded-full overflow-hidden mb-2.5">
        <div
          className="h-full bg-gradient-to-r from-mint-400 to-mint-600 transition-all duration-500 rounded-full"
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
            placeholder="Exact steps"
            className="input text-xs py-1.5"
            min="0"
            autoFocus
          />
          <button onClick={handleSet} className="btn-primary text-xs px-3">Save</button>
          <button onClick={() => setShowExact(false)} className="btn-secondary text-xs px-2">✕</button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <button onClick={() => handleAdd(500)} className="btn-secondary flex-1 text-xs py-1.5">+500</button>
          <button onClick={() => setShowExact(true)} className="text-xs text-mint-700 font-medium px-2 py-1.5 hover:underline">Exact</button>
        </div>
      )}
    </div>
  );
}
