import { useMemo, useState } from 'react';
import { STUDENT_DAY, timeBucket } from '../data/studentDay';
import { todayKey, storage } from '../lib/storage';
import { getFitnessLevel } from '../data/profileOptions';
import { XP_RULES, levelFromPoints } from '../lib/xp';
import { Header } from './Layout';
import WeatherCard from './WeatherCard';
import FlowerGarden from './FlowerGarden';
import StepsTracker from './StepsTracker';
import WaterTracker from './WaterTracker';
import Leaderboard from './Leaderboard';

export default function TodayPage({ profile, onLogClick, onChangeCondition, onOpenMeds, onOpenSettings, onOpenProfile }) {
  const today = todayKey();
  const [completions, setCompletions] = useState(() => storage.getCompletions());
  const [xpVersion, setXPVersion] = useState(0);
  const doneToday = completions[today] || {};
  const xp = xpVersion >= 0 ? storage.getXP() : { points: 0 };
  const currentLevel = levelFromPoints(xp.points);

  const fitness = profile?.fitnessLevel ? getFitnessLevel(profile.fitnessLevel) : null;

  // Personalised schedule — activity labels/durations reflect fitness level
  const schedule = useMemo(() => {
    if (!fitness) return STUDENT_DAY;
    return STUDENT_DAY.map((item) => {
      if (item.type === 'activity') {
        return { ...item, label: `${fitness.activityLabel} (${fitness.walkMinutes} min)` };
      }
      return item;
    });
  }, [fitness]);

  const buckets = useMemo(() => {
    const groups = { Morning: [], Afternoon: [], Evening: [], Night: [] };
    schedule.forEach((item) => {
      groups[timeBucket(item.time)].push(item);
    });
    return groups;
  }, [schedule]);

  const completedCount = Object.keys(doneToday).filter((id) => schedule.some((s) => s.id === id)).length;
  const totalCount = schedule.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 21 ? 'evening' : 'night';
    const name = profile?.name ? `, ${profile.name}` : '';
    return `Hi${name} — good ${tod}`;
  }, [profile]);

  function handleToggle(itemId) {
    const wasDone = !!doneToday[itemId];
    storage.toggleCompletion(today, itemId);
    setCompletions(storage.getCompletions());
    if (!wasDone) {
      const before = levelFromPoints(storage.getXP().points);
      storage.addXP(XP_RULES.SCHEDULE_ITEM);
      const after = levelFromPoints(storage.getXP().points);
      if (after > before) storage.markLevelSeen(after);
      setXPVersion((v) => v + 1);
    }
  }

  return (
    <div>
      <Header
        title={greeting}
        subtitle={`${completedCount} of ${totalCount} done today`}
        action={
          <div className="flex flex-col items-end gap-2">
            <XPChip version={xpVersion} />
            <div className="flex gap-1">
              <button onClick={onOpenProfile} className="btn-ghost text-base" aria-label="Profile">👤</button>
              <button onClick={onOpenSettings} className="btn-ghost text-base" aria-label="Settings">⚙️</button>
            </div>
          </div>
        }
      />

      <WeatherCard />

      <StepsTracker />

      <WaterTracker />

      <FlowerGarden
        totalPoints={xp.points}
        currentLevel={currentLevel}
        plantsCount={Math.max(0, currentLevel - 1)}
      />

      <div className="card-mint mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-mint-800">Today's progress</span>
          <span className="text-2xl font-bold text-mint-700">{progressPct}%</span>
        </div>
        <div className="h-3 bg-white/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-mint-400 to-mint-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <button onClick={onLogClick} className="btn-primary w-full mb-6 text-lg">
        ➕ Log something
      </button>

      <Leaderboard />

      {Object.entries(buckets).map(([bucketName, items]) =>
        items.length === 0 ? null : (
          <section key={bucketName} className="mb-6">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="w-1.5 h-5 rounded-full bg-mint-500" aria-hidden="true"></span>
              <h2 className="text-sm font-bold text-mint-800 uppercase tracking-wide">{bucketName}</h2>
            </div>
            <div className="space-y-2">
              {items.map((item) => {
                const done = !!doneToday[item.id];
                const tintClass =
                  item.type === 'meal' ? 'bg-mint-50 border-mint-200' :
                  item.type === 'activity' ? 'bg-gradient-to-br from-mint-50 to-white border-mint-200' :
                  item.type === 'check' ? 'bg-white border-mint-200' :
                  'bg-mint-100/60 border-mint-300';
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`w-full rounded-2xl border shadow-sm flex items-center gap-4 text-left transition-all p-4 ${
                      done ? 'bg-mint-100/80 border-mint-300 opacity-70' : `${tintClass} hover:shadow-md`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      done ? 'bg-mint-300/50' : 'bg-white shadow-sm'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${done ? 'line-through text-mint-500' : 'text-mint-900'}`}>
                        {item.label}
                      </div>
                      <div className="text-sm text-mint-500 mt-0.5">{item.time}</div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        done ? 'bg-mint-500 border-mint-500' : 'border-mint-300'
                      }`}
                    >
                      {done && <span className="text-white text-sm">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )
      )}

      <div className="text-center text-sm text-mint-500 mt-8">
        Tap any item to mark it done.
      </div>
    </div>
  );
}

function XPChip({ version }) {
  const xp = version >= 0 ? storage.getXP() : { points: 0 };
  const level = levelFromPoints(xp.points);
  return (
    <div className="chip text-xs" key={version}>
      ✨ {xp.points} pts · Lvl {level}
    </div>
  );
}