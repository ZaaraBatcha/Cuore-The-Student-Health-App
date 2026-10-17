import { useEffect, useState } from 'react';
import { storage, todayKey } from '../lib/storage';
import { DAILY_STEP_GOAL, getStepProgress, tryNativeStepSensor } from '../lib/steps';
import { setProfileSteps } from '../lib/leaderboard';

export default function StepsTracker() {
  const [steps, setSteps] = useState(() => storage.getSteps());
  const [input, setInput] = useState('');
  const [sensorStatus, setSensorStatus] = useState('checking'); // 'checking' | 'native' | 'unavailable'

  const today = todayKey();
  const todaySteps = steps[today] || 0;
  const pct = getStepProgress(steps, today);

  // Try to detect native sensor once on mount.
  useEffect(() => {
    let cancelled = false;
    tryNativeStepSensor().then((sensor) => {
      if (cancelled) return;
      setSensorStatus(sensor ? 'native' : 'unavailable');
    });
    return () => { cancelled = true; };
  }, []);

  function handleAdd(delta) {
    const next = todaySteps + delta;
    storage.setSteps(today, next);
    setProfileSteps('you', today, next);
    setSteps(storage.getSteps());
  }

  function handleSet() {
    const n = parseInt(input, 10);
    if (!isNaN(n) && n >= 0) {
      storage.setSteps(today, n);
      setProfileSteps('you', today, n);
      setSteps(storage.getSteps());
      setInput('');
    }
  }

  const progressColor =
    pct >= 100 ? 'from-mint-400 via-mint-500 to-mint-700' :
    pct >= 50  ? 'from-mint-400 to-mint-600' :
                  'from-mint-300 to-mint-500';

  return (
    <div className="card-mint mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">👟</div>
          <div>
            <div className="font-bold text-mint-900">Steps</div>
            <div className="text-xs text-mint-700">
              Goal: {DAILY_STEP_GOAL.toLocaleString()}
              {sensorStatus === 'checking' && ' · checking sensor…'}
              {sensorStatus === 'native' && ' · 🏃 motion sensor available'}
              {sensorStatus === 'unavailable' && ' · enter manually'}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-mint-800">{todaySteps.toLocaleString()}</div>
          <div className="text-xs text-mint-600">{pct}% of goal</div>
        </div>
      </div>

      <div className="h-3 bg-white/70 rounded-full overflow-hidden shadow-inner mb-3">
        <div
          className={`h-full bg-gradient-to-r ${progressColor} transition-all duration-700 rounded-full`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          <button onClick={() => handleAdd(500)} className="btn-secondary text-xs px-3 py-2">+500</button>
          <button onClick={() => handleAdd(1000)} className="btn-secondary text-xs px-3 py-2">+1k</button>
          <button onClick={() => handleAdd(2500)} className="btn-secondary text-xs px-3 py-2">+2.5k</button>
        </div>
        <div className="flex-1 flex gap-1">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSet()}
            placeholder="Or type exact…"
            className="input text-sm py-2"
            min="0"
          />
          <button onClick={handleSet} disabled={input === ''} className="btn-primary text-sm px-4">Set</button>
        </div>
      </div>
    </div>
  );
}