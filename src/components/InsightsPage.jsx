import { useMemo } from 'react';
import { storage } from '../lib/storage';
import { getWeeklyInsights } from '../lib/insights';
import { Header } from './Layout';
import { speak, isSpeechSynthesisSupported } from '../lib/speech';

export default function InsightsPage() {
  const logs = storage.getLogs();
  const settings = storage.getSettings();
  const canSpeak = settings.readAloud && isSpeechSynthesisSupported();
  const { summary, patterns, count, mirror } = useMemo(
    () => getWeeklyInsights(logs),
    [logs]
  );

  function readAloud() {
    const mirrorText = mirror ? `Your pattern mirror says: ${mirror.text}. ` : '';
    const text = `${mirrorText}Weekly summary. ${summary}. ${patterns.map((p) => `${p.title}. ${p.detail}`).join('. ')}`;
    speak(text, { rate: 0.95 });
  }

  return (
    <div>
      <Header
        title="🌱 Weekly insights"
        subtitle="Patterns from your last 7 days."
        action={
          canSpeak ? (
            <button onClick={readAloud} className="btn-ghost text-sm" aria-label="Read insights aloud">
              🔊
            </button>
          ) : null
        }
      />

      <div className="card-fresh mb-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="text-sm font-medium text-mint-500">This week</div>
            <div className="text-3xl font-bold text-mint-700">{count}</div>
            <div className="text-sm text-mint-600">entries logged</div>
          </div>
          <span className="text-4xl">🌱</span>
        </div>
        <p className="text-mint-700 mt-3 leading-relaxed">{summary}</p>
      </div>

      {mirror && (
        <div className="card mb-6 bg-mint-50 border-mint-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🪞</span>
            <div className="text-xs uppercase tracking-wide font-semibold text-mint-600">Pattern mirror</div>
          </div>
          <p className="text-lg text-mint-800 leading-relaxed font-medium">
            {mirror.text}
          </p>
          <p className="text-xs text-mint-500 mt-3 leading-relaxed">
            A reflection of the past week, drawn from your own logs.
          </p>
        </div>
      )}

      {patterns.length > 0 && (
        <h2 className="text-sm font-semibold text-mint-500 uppercase tracking-wide mb-2 px-1">
          What we noticed
        </h2>
      )}

      <div className="space-y-3">
        {patterns.map((p, i) => (
          <div key={i} className="card">
            <div className="text-sm font-medium text-mint-500 mb-1">{p.title}</div>
            <div className="text-mint-900 leading-relaxed">{p.detail}</div>
          </div>
        ))}
      </div>

      {count === 0 && (
        <div className="card-mint text-center mt-6">
          <div className="text-5xl mb-3">🌱</div>
          <div className="font-medium text-mint-900 mb-1">Nothing here yet</div>
          <p className="text-sm text-mint-600">
            Log a few entries this week and we will start to spot patterns for you.
          </p>
        </div>
      )}

      <div className="text-center mt-8 text-xs text-mint-500">
        Insights stay on your device. They improve as you log more.
      </div>
    </div>
  );
}