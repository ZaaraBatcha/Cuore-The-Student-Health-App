import { useEffect, useState } from 'react';
import { rankedToday, getLeaderboard } from '../lib/leaderboard';
import { DAILY_STEP_GOAL } from '../lib/steps';

export default function Leaderboard() {
  const [ranked, setRanked] = useState(() => rankedToday());

  // Refresh when other components might have updated profile data
  useEffect(() => {
    const id = setInterval(() => setRanked(rankedToday()), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card-mint mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">🏆</div>
          <div>
            <div className="font-bold text-mint-900">Leaderboard</div>
            <div className="text-xs text-mint-700">Today's steps · this device</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {ranked.map((p) => (
          <LeaderboardRow key={p.id} profile={p} />
        ))}
      </div>

      <p className="text-xs text-mint-500 mt-3 text-center leading-relaxed">
        Demo leaderboard · profiles share this device. In a full version, profiles would sync to a server.
      </p>
    </div>
  );
}

function LeaderboardRow({ profile }) {
  const pct = Math.min(100, Math.round((profile.todaySteps / DAILY_STEP_GOAL) * 100));
  const waterPct = Math.min(100, Math.round((profile.todayWater / 2000) * 100));
  const rankEmoji = profile.rank === 1 ? '🥇' : profile.rank === 2 ? '🥈' : profile.rank === 3 ? '🥉' : '  ';

  return (
    <div className={`relative rounded-full border-2 pl-4 pr-5 py-2.5 overflow-hidden shadow-sm ${
      profile.isMe ? 'bg-gradient-to-r from-mint-100 to-white border-mint-400' : 'bg-white border-mint-200'
    }`}>
      {/* Water level fill — fills from bottom, capped by today's water % */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-700 pointer-events-none"
        style={{ height: `${waterPct}%`, background: 'linear-gradient(180deg, #bfdbfe 0%, #7bb392 100%)', opacity: 0.35 }}
      />

      <div className="relative flex items-center gap-3">
        {/* Rank */}
        <div className="w-8 text-center font-bold text-mint-700 text-sm flex-shrink-0">
          {rankEmoji.trim() ? rankEmoji : `#${profile.rank}`}
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
            style={{ backgroundColor: profile.color + '33' }}
          >
            {profile.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-mint-900 text-sm truncate">
              {profile.name}
              {profile.isMe && <span className="ml-1 text-xs text-mint-600">(you)</span>}
            </div>
            <div className="text-xs text-mint-600">
              <span className="font-semibold">{profile.todaySteps.toLocaleString()}</span> steps ·{' '}
              <span className="font-semibold">{(profile.todayWater / 1000).toFixed(1)}L</span> water
            </div>
          </div>
        </div>

        {/* Mini garden */}
        <MiniGarden plants={profile.plants} />
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 bg-white/70 rounded-full overflow-hidden mt-2">
        <div
          className="h-full bg-gradient-to-r from-mint-400 to-mint-600 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MiniGarden({ plants }) {
  // Tiny ground with up to 5 small plants
  const visible = Math.min(plants, 5);
  const slotW = 8;
  const startX = 100;
  return (
    <svg width="60" height="32" viewBox="0 0 120 32" className="flex-shrink-0" aria-hidden="true">
      {/* Sky */}
      <rect x="0" y="0" width="120" height="22" fill="#eaf4ec" />
      {/* Ground */}
      <rect x="0" y="22" width="120" height="10" fill="#7bb392" />
      <ellipse cx="60" cy="24" rx="60" ry="3" fill="#5a9a78" opacity="0.4" />
      {/* Plants */}
      {Array.from({ length: visible }).map((_, i) => {
        const x = startX - (visible - 1 - i) * slotW;
        return (
          <g key={i} transform={`translate(${x} 0)`}>
            <line x1="0" y1="22" x2="0" y2="14" stroke="#5a9a78" strokeWidth="1" />
            <circle cx="0" cy="13" r="2.5" fill={i % 2 === 0 ? '#fdfcf8' : '#f9a8d4'} />
          </g>
        );
      })}
      {/* Empty plots */}
      {Array.from({ length: Math.max(0, 5 - visible) }).map((_, i) => {
        const x = startX - (Math.max(0, 5 - 1) - i) * slotW - (visible * slotW);
        return (
          <g key={`empty-${i}`} transform={`translate(${x} 0)`} opacity="0.4">
            <rect x="-2" y="20" width="4" height="3" fill="#a4cdb5" rx="1" stroke="#7bb392" strokeWidth="0.5" strokeDasharray="1 1" />
          </g>
        );
      })}
    </svg>
  );
}