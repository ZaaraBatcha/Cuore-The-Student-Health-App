import { levelFromPoints, levelPercent, progressInLevel, XP_PER_LEVEL } from '../lib/xp';

export default function LevelBar({ points }) {
  const level = levelFromPoints(points);
  const pct = levelPercent(points);
  const progress = progressInLevel(points);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-400 to-mint-700 text-white flex items-center justify-center font-bold text-lg shadow-md">
            {level}
          </div>
          <div>
            <div className="text-sm font-bold text-mint-900">Level {level}</div>
            <div className="text-xs text-mint-700 font-medium">{points} total points</div>
          </div>
        </div>
        <div className="chip-leaf text-xs">
          {progress}/{XP_PER_LEVEL} to next
        </div>
      </div>
      <div className="h-3 bg-white/80 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-mint-400 via-mint-500 to-mint-600 transition-all duration-700 rounded-full shadow-sm"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}