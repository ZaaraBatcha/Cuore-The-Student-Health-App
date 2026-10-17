import { useMemo } from 'react';
import { storage } from '../lib/storage';
import { Header } from './Layout';

const TYPE_META = {
  mood: { label: 'Mood', icon: '💭' },
  meal: { label: 'Meal', icon: '🍽️' },
  activity: { label: 'Activity', icon: '🚶' },
  study: { label: 'Study', icon: '📚' },
  sleep: { label: 'Sleep', icon: '😴' },
  note: { label: 'Note', icon: '📝' },
};

export default function LogbookPage() {
  const logs = storage.getLogs();

  const grouped = useMemo(() => groupByDate(logs), [logs]);

  if (logs.length === 0) {
    return (
      <div>
        <Header
          title="Logbook"
          subtitle="Every entry you've recorded, by day."
        />
        <div className="card text-center mt-6">
          <div className="text-5xl mb-3">📔</div>
          <div className="font-medium text-mint-900 mb-1">Your logbook is empty</div>
          <p className="text-sm text-mint-600">
            Once you log a mood, meal, activity, study session, or sleep, it will appear here like a diary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Logbook"
        subtitle={`${logs.length} ${logs.length === 1 ? 'entry' : 'entries'} recorded`}
      />

      <div className="space-y-6">
        {Object.entries(grouped).map(([key, group]) => (
          <DayGroup key={key} dayKey={key} entries={group} conditionId={conditionId} />
        ))}
      </div>

      <p className="text-xs text-mint-500 text-center mt-8">
        Everything stays on this device. Tap a day to see it like a diary.
      </p>
    </div>
  );
}

function DayGroup({ dayKey, entries, conditionId }) {
  const condition = conditions[conditionId];
  return (
    <section>
      <h2 className="text-sm font-semibold text-mint-500 uppercase tracking-wide mb-2 px-1">
        {formatDayHeading(dayKey)}
      </h2>
      <div className="space-y-2">
        {entries.map((entry) => (
          <LogEntry key={entry.id || `${entry.timestamp}-${entry.type}`} entry={entry} />
        ))}
      </div>
    </section>
  );
}

function LogEntry({ entry }) {
  const meta = TYPE_META[entry.type] || { label: entry.type, icon: '📝' };
  const time = new Date(entry.timestamp);

  // Different card tints per entry type — visual rhythm
  const tintClass =
    entry.type === 'meal'    ? 'bg-mint-50 border-mint-200' :
    entry.type === 'mood'    ? 'bg-mint-100/40 border-mint-200' :
    entry.type === 'activity' ? 'bg-white border-mint-200' :
    entry.type === 'study'   ? 'bg-gradient-to-br from-mint-50 to-white border-mint-200' :
    entry.type === 'sleep'   ? 'bg-mint-100/30 border-mint-200' :
    'bg-white border-mint-100';

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${tintClass}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0">{meta.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="font-bold text-mint-900">{meta.label}</div>
            <div className="text-xs text-mint-500 flex-shrink-0">
              {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </div>
          </div>

          {entry.value && (
            <div className="text-lg font-medium text-mint-700 mb-1">
              {entry.value}{meta.unit && <span className="text-sm text-mint-500 ml-1">{meta.unit}</span>}
            </div>
          )}

          {entry.tags && entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {entry.tags.map((tag) => (
                <span key={tag} className="chip">{tag}</span>
              ))}
            </div>
          )}

          {entry.note && (
            <p className="text-sm text-mint-700 leading-relaxed">{entry.note}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function groupByDate(logs) {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const groups = {};
  sorted.forEach((entry) => {
    const d = new Date(entry.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
}

function formatDayHeading(key) {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';

  const diffDays = Math.round((today - date) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
  return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
}