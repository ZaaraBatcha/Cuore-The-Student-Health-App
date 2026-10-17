import { useState } from 'react';
import { conditions } from '../data/conditions';

export default function Onboarding({ onChoose }) {
  const [selected, setSelected] = useState(null);
  const conditionList = Object.values(conditions);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-12 pb-8">
        <div className="text-center mb-8">
          <div className="inline-block text-5xl mb-4">🌿</div>
          <h1 className="text-3xl font-bold text-mint-900 mb-2">Wise Track</h1>
          <p className="text-mint-600">A calmer way to manage your daily health.</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-mint-900 mb-1">What are you managing?</h2>
          <p className="text-mint-600 text-sm mb-4">You can change this anytime. We will set up a plan that fits you.</p>
          <div className="space-y-3">
            {conditionList.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected === c.id
                    ? 'border-mint-500 bg-mint-50'
                    : 'border-mint-100 hover:border-mint-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <div className="font-semibold text-mint-900">{c.name}</div>
                    <div className="text-sm text-mint-600 mt-0.5">{c.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary w-full"
          disabled={!selected}
          onClick={() => selected && onChoose(selected)}
        >
          Start my day →
        </button>

        <p className="text-xs text-mint-500 text-center mt-4 leading-relaxed">
          Your data stays on this device. No account, no cloud. You can clear it anytime from settings.
        </p>
      </div>
    </div>
  );
}