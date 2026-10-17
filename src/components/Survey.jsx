import { useState } from 'react';
import { storage } from '../lib/storage';

export default function Survey({ onComplete }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '',
    weight: '',
    weightUnit: 'kg',
    heightCm: '',
    fitnessLevel: 'moderate',
    goals: [],
  });

  function update(patch) {
    setData((d) => ({ ...d, ...patch }));
  }

  function next() {
    if (step < 2) setStep(step + 1);
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }
  function finish() {
    const profile = {
      name: data.name.trim(),
      weight: data.weight ? Number(data.weight) : null,
      weightUnit: data.weightUnit,
      heightCm: data.heightCm ? Number(data.heightCm) : null,
      fitnessLevel: data.fitnessLevel,
      goals: data.goals,
      createdAt: new Date().toISOString(),
    };
    storage.setProfile(profile);
    onComplete({ profile });
  }

  const canNext = (() => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return true; // body is optional
    if (step === 2) return true; // goals is optional
    return true;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mint-50 via-white to-mint-100">
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-8 pb-32">
        <ProgressBar step={step} total={3} />

        {step === 0 && <NameStep data={data} update={update} />}
        {step === 1 && <BodyStep data={data} update={update} />}
        {step === 2 && <GoalsStep data={data} update={update} />}
      </div>

      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-mint-100 via-mint-50 to-white border-t border-mint-200 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-md mx-auto px-4 py-4 flex gap-3">
          {step > 0 && (
            <button onClick={back} className="btn-secondary flex-shrink-0">
              ← Back
            </button>
          )}
          {step < 2 ? (
            <button onClick={next} disabled={!canNext} className="btn-primary flex-1">
              Continue →
            </button>
          ) : (
            <button onClick={finish} className="btn-primary flex-1">
              Start my day 🌿
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }) {
  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-mint-500 mb-2">
        <span>Step {step + 1} of {total}</span>
        <span>{Math.round(((step + 1) / total) * 100)}%</span>
      </div>
      <div className="h-2 bg-mint-100 rounded-full overflow-hidden">
        <div className="h-full bg-mint-500 transition-all duration-300 rounded-full" style={{ width: `${((step + 1) / total) * 100}%` }} />
      </div>
    </div>
  );
}

function NameStep({ data, update }) {
  return (
    <div>
      <div className="text-5xl mb-4 text-center">👋</div>
      <h2 className="text-2xl font-bold text-mint-900 mb-2 text-center">Hi there!</h2>
      <p className="text-mint-600 text-center mb-8">What should we call you?</p>
      <input
        type="text"
        value={data.name}
        onChange={(e) => update({ name: e.target.value })}
        placeholder="Your first name"
        className="input text-lg text-center"
        autoFocus
      />
      <p className="text-xs text-mint-500 text-center mt-3">
        Just for the greeting — your name stays on your device.
      </p>
    </div>
  );
}

function BodyStep({ data, update }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-mint-900 mb-2">A bit about you</h2>
      <p className="text-mint-600 mb-6">Helps us personalise activity goals. Skip what you'd rather not enter.</p>
      <div className="space-y-5">
        <div>
          <label className="label">Weight</label>
          <div className="flex gap-2">
            <input type="number" inputMode="decimal" value={data.weight} onChange={(e) => update({ weight: e.target.value })} placeholder="70" className="input flex-1" />
            <div className="flex gap-1">
              {['kg', 'lb'].map((u) => (
                <button key={u} type="button" onClick={() => update({ weightUnit: u })} className={`px-4 rounded-xl font-medium ${data.weightUnit === u ? 'bg-mint-500 text-white' : 'bg-mint-100 text-mint-700'}`}>{u}</button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="label">Height (cm)</label>
          <input type="number" inputMode="decimal" value={data.heightCm} onChange={(e) => update({ heightCm: e.target.value })} placeholder="170" className="input" />
        </div>
        <div>
          <label className="label">How active are you usually?</label>
          <div className="space-y-2">
            {[
              { id: 'low',      label: 'Mostly sitting',           desc: 'Mostly classes, screen time, light walking.' },
              { id: 'moderate', label: 'A bit active',            desc: 'Some walking, occasional exercise.' },
              { id: 'high',     label: 'Very active',             desc: 'Sport, gym, long walks, or active commute.' },
            ].map((g) => (
              <button key={g.id} type="button" onClick={() => update({ fitnessLevel: g.id })} className={`w-full p-3 rounded-xl border-2 text-left transition-all ${data.fitnessLevel === g.id ? 'border-mint-500 bg-mint-50' : 'border-mint-100 hover:border-mint-300'}`}>
                <div className="font-semibold text-mint-900 text-sm">{g.label}</div>
                <div className="text-xs text-mint-600">{g.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const GOAL_OPTIONS = [
  { id: 'steps',   label: 'Hit daily step goal',     icon: '👟' },
  { id: 'water',   label: 'Drink enough water',      icon: '💧' },
  { id: 'sleep',   label: 'Sleep on a regular schedule', icon: '🌙' },
  { id: 'stress',  label: 'Manage stress better',    icon: '🌿' },
  { id: 'study',   label: 'Protect focus time',      icon: '📚' },
  { id: 'social',  label: 'Stay connected with people', icon: '🤝' },
];

function GoalsStep({ data, update }) {
  function toggle(goalId) {
    const next = data.goals.includes(goalId)
      ? data.goals.filter((g) => g !== goalId)
      : [...data.goals, goalId];
    update({ goals: next });
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-mint-900 mb-2">What matters most?</h2>
      <p className="text-mint-600 mb-6">Pick a few. We'll prioritise these in your day.</p>
      <div className="grid grid-cols-2 gap-2">
        {GOAL_OPTIONS.map((g) => (
          <button key={g.id} type="button" onClick={() => toggle(g.id)} className={`p-4 rounded-xl border-2 text-left transition-all ${data.goals.includes(g.id) ? 'border-mint-500 bg-mint-50' : 'border-mint-100 hover:border-mint-300'}`}>
            <div className="text-2xl mb-1">{g.icon}</div>
            <div className="font-medium text-mint-900 text-sm leading-tight">{g.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}