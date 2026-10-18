import { useState } from 'react';
import { rankedToday } from '../lib/leaderboard';
import { DAILY_STEP_GOAL } from '../lib/steps';

// Compact social card: collapsed shows one summary line; tapping expands
// the top three plus your own row (per design review).
export default function Leaderboard() {
  const [expanded, setExpanded] = useState(false);
  const ranked = rankedToday();
  const me = ranked.find((p) => p.isMe);
  const ahead = ranked.filter((p) => p.rank < (me ? me.rank : Infinity));
  const gapToNext = me && ahead.length > 0 ? ahead[ahead.length - 1].todaySteps - me.todaySteps : null;

  return (
    <div className="card-mint mb-4 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left px-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🏆</span>
          <div>
            <div className="font-bold text-mint-900 text-sm">Leaderboard</div>
            <div className="text-xs text-mint-700">See how you're doing against friends</div>
          </div>
        </div>
        <span className={`text-mint-600 transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
      </button>

      {/* Collapsed: one honest summary line */}
      {!expanded && me && (
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-1.5 text-sm">
          <span className="font-bold text-mint-800">#{me.rank}</span>
          <span className="text-mint-700 font-medium">{me.name}</span>
          <span className="text-mint-600">
            · {me.todaySteps.toLocaleString()} steps
            {gapToNext !== null && gapToNext > 0 && ` · ${(gapToNext + 1).toLocaleString()} to climb`}
          </span>
        </div>
      )}

      {/* Expanded: top three + your row, mini gardens included */}
      {expanded && (
        <div className="space-y-2 mt-3">
          {ranked.map((p) => <Row key={p.id} profile={p} />)}
          <p className="text-xs text-mint-600 mt-2 text-center leading-relaxed">
            Profiles share this device for now. A server version comes next.
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ profile }) {
  const pct = Math.min(100, Math.round((profile.todaySteps / DAILY_STEP_GOAL) * 100));
  const medal = profile.rank === 1 ? '🥇' : profile.rank === 2 ? '🥈' : profile.rank === 3 ? '🥉' : '#';
  return (
    <div className={`rounded-2xl border px-3 py-2.5 ${profile.isMe ? 'bg-gradient-to-r from-mint-100 to-white border-mint-300' : 'bg-white border-mint-200'}`}>
      <div className="flex items-center gap-2.5">
        <div className="w-7 text-center text-sm font-bold text-mint-700 flex-shrink-0">{medal}{profile.rank === 1 || profile.rank === 2 || profile.rank === 3 ? '' : profile.rank}</div>
        <div className="text-lg flex-shrink-0" aria-hidden="true">{profile.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-mint-900 truncate">
            {profile.name}{profile.isMe && <span className="text-xs text-mint-600 font-normal"> (you)</span>}
          </div>
          <div className="h-1.5 bg-mint-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-gradient-to-r from-mint-400 to-mint-600 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="text-xs text-mint-700 text-right flex-shrink-0">
          <div className="font-bold text-mint-800">{profile.todaySteps.toLocaleString()}</div>
          <div>{(profile.todayWater / 1000).toFixed(1)}L · {profile.plants} 🌱</div>
        </div>
      </div>
    </div>
  );
}
