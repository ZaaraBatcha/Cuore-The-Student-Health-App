import { useEffect, useMemo, useRef, useState } from 'react';
// Today page: single source of truth for the adaptive day plan
import { STUDENT_DAY, timeBucket } from '../data/studentDay';
import { todayKey, storage } from '../lib/storage';
import { getFitnessLevel } from '../data/profileOptions';
import { XP_RULES, levelFromPoints } from '../lib/xp';
import { runAgent, getAgentToday } from '../lib/agent';
import { Header } from './Layout';
import WeatherCard from './WeatherCard';
import FlowerGarden from './FlowerGarden';
import StepsTracker from './StepsTracker';
import WaterTracker from './WaterTracker';
import Leaderboard from './Leaderboard';
import AgentFeed from './AgentFeed';

const BUCKETS = [
  { name: 'Morning',   hint: 'Start your day' },
  { name: 'Afternoon', hint: 'Keep going' },
  { name: 'Evening',   hint: 'Wind down' },
  { name: 'Night',     hint: 'Get ready for bed' },
];

export default function TodayPage({ profile, onLogClick, onChangeCondition, onOpenMeds, onOpenSettings, onOpenProfile }) {
  const today = todayKey();
  const [completions, setCompletions] = useState(() => storage.getCompletions());
  const [xpVersion, setXPVersion] = useState(0);
  const [gardenOpen, setGardenOpen] = useState(false);
  const doneToday = completions[today] || {};
  const xp = xpVersion >= 0 ? storage.getXP() : { points: 0 };
  const currentLevel = levelFromPoints(xp.points);

  const fitness = profile?.fitnessLevel ? getFitnessLevel(profile.fitnessLevel) : null;

  // Personalised schedule: activity labels reflect fitness level
  const schedule = useMemo(() => {
    if (!fitness) return STUDENT_DAY;
    return STUDENT_DAY.map((item) => {
      if (item.type === 'activity') {
        return { ...item, label: `${fitness.activityLabel} (${fitness.walkMinutes} min)` };
      }
      return item;
    });
  }, [fitness]);

  // Day Agent: re-plans whenever the data stream changes (lib/agent.js)
  const [agent, setAgent] = useState(() => getAgentToday());
  const itemsRef = useRef({});
  const prevDoneRef = useRef(null);

  useEffect(() => {
    function run() {
      const steps = (storage.getSteps()[today] || 0);
      const water = storage.getWaterTotal(today);
      const doneIds = Object.keys(storage.getCompletions()[today] || {});
      const doneSet = new Set(doneIds);
      // corrected assumptions: something done was un-ticked
      const undone = prevDoneRef.current
        ? [...prevDoneRef.current]
            .filter((id) => !doneSet.has(id) && itemsRef.current[id])
            .map((id) => itemsRef.current[id])
            .filter((i) => !i.agent)
        : [];
      prevDoneRef.current = doneSet;
      const outcome = runAgent({ steps, water, undone, appointments: storage.getAppointments() });
      setAgent(outcome);
    }
    run();
    const timer = setInterval(run, 2500);
    return () => clearInterval(timer);
  }, [today]);

  // Merged plan: base schedule + agent overrides + agent-added items
  const plan = useMemo(() => {
    const index = {};
    const items = schedule.map((it) => {
      const patch = agent.overrides && agent.overrides[it.id];
      const merged = patch ? { ...it, ...patch, agentOverride: true } : it;
      index[merged.id] = { id: merged.id, label: merged.label, agent: !!(merged.agent || merged.agentOverride) };
      return merged;
    });
    (agent.extraItems || []).forEach((extra) => {
      if (!index[extra.id]) {
        index[extra.id] = { id: extra.id, label: extra.label, agent: true };
        items.push(extra);
      }
    });
    itemsRef.current = index;
    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, agent]);

  const grouped = useMemo(() => {
    const groups = {};
    plan.forEach((item) => {
      const b = timeBucket(item.time);
      if (!groups[b]) groups[b] = [];
      groups[b].push(item);
    });
    return groups;
  }, [plan]);

  const completedCount = Object.keys(doneToday).filter((id) => plan.some((s) => s.id === id)).length;
  const totalCount = plan.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  // Auto-open the current time-of-day bucket
  const hour = new Date().getHours();
  const nowBucket = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : hour < 21 ? 'Evening' : 'Night';
  const [openBuckets, setOpenBuckets] = useState(() => new Set([nowBucket]));

  const greetingLabel = `Good ${nowBucket.toLowerCase()}${profile?.name ? ', ' + profile.name : ''}`;
  const dateLabel = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }),
    []
  );
  const nextPlantIn = Math.max(0, currentLevel * 100 - xp.points);

  function toggleBucket(name) {
    setOpenBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

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
        title={greetingLabel}
        subtitle={dateLabel}
        action={
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenSettings}
              aria-label="Open settings"
              title="Settings"
              className="flex items-center gap-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-mint-400 pr-2"
            >
              <img src="/cuore-logo.svg" alt="" className="w-8 h-8 rounded-lg shadow-sm" draggable="false" />
              <span className="text-sm font-bold text-mint-800 tracking-tight">Cuore</span>
            </button>
            <button onClick={onLogClick} className="btn-primary text-xs px-3 py-1.5">＋ Log</button>
          </div>
        }
      />

      {/* Today's progress: one bar, one number */}
      <div className="card bg-white border-mint-200 rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-mint-900">Today's progress</span>
          <span className="text-sm font-bold text-mint-700">{progressPct}%</span>
        </div>
        <div className="h-2 bg-mint-100 rounded-full overflow-hidden mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-mint-400 to-mint-600 transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-xs text-mint-600">{completedCount} of {totalCount} tasks completed</div>
      </div>

      <WeatherCard />

      {/* Steps & Water, side by side, compact */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StepsTracker />
        <WaterTracker />
      </div>

      {/* Garden: tappable, level & points live only here */}
      <div className="card-mint mb-4 overflow-hidden">
        <button
          onClick={() => setGardenOpen((v) => !v)}
          className="w-full flex items-center justify-between px-3 pt-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🌱</span>
            <div>
              <div className="font-bold text-mint-900 text-sm">Your garden</div>
              <div className="text-xs text-mint-700">Complete tasks to grow your garden</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-mint-600 transition-transform ${gardenOpen ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
          </div>
        </button>

        <button
          onClick={() => setGardenOpen((v) => !v)}
          className="w-full mt-2 rounded-2xl overflow-hidden border border-mint-300 shadow-inner block"
          style={{ aspectRatio: gardenOpen ? '3 / 2' : '5 / 2' }}
          aria-expanded={gardenOpen}
          aria-label="Toggle garden view"
        >
          <FlowerGarden totalPoints={xp.points} currentLevel={currentLevel} plantsCount={Math.max(0, currentLevel - 1)} compact />
        </button>

        <div className="flex items-center justify-between px-3 py-2.5 mt-1">
          <div className="text-sm font-semibold text-mint-900">
            Level {currentLevel} · {xp.points} points
            {nextPlantIn > 0 && (
              <span className="text-xs text-mint-600 font-normal"> · next plant in {nextPlantIn}</span>
            )}
          </div>
          <button
            onClick={() => setGardenOpen((v) => !v)}
            className="text-sm font-medium text-mint-600 hover:underline"
          >
            {gardenOpen ? 'Close' : 'View garden →'}
          </button>
        </div>
      </div>

      {/* Agent decisions, feed right above the plan it changed */}
      <AgentFeed events={agent.events} />

      {/* Routine: collapsible time-of-day sections, schedule above social */}
      <div className="card-mint mb-4 px-3 py-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="font-bold text-mint-900 text-sm">Your routine</div>
          <div className="text-xs text-mint-600">{completedCount}/{totalCount} done</div>
        </div>

        {BUCKETS.map(({ name, hint }) => {
          const items = grouped[name] || [];
          if (items.length === 0) return null;
          const open = openBuckets.has(name);
          const done = items.filter((it) => doneToday[it.id]).length;
          return (
            <div key={name} className="mb-2 last:mb-0">
              <button
                onClick={() => toggleBucket(name)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-mint-100 border border-mint-300 transition-colors hover:border-mint-400"
              >
                <div className="flex items-center gap-2.5">
                  <div className="text-lg" aria-hidden="true">
                    {name === 'Morning' ? '🌅' : name === 'Afternoon' ? '☀️' : name === 'Evening' ? '🌇' : '🌙'}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-mint-900">{name}</div>
                    <div className="text-xs text-mint-600">{hint}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-mint-600">{done}/{items.length}</span>
                  <span className={`text-mint-600 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>
                </div>
              </button>

              {open && (
                <div className="space-y-1.5 mt-1.5">
                  {items.map((item) => <TaskRow key={item.id} item={item} done={!!doneToday[item.id]} onToggle={() => handleToggle(item.id)} />)}
                </div>
              )}
            </div>
          );
        })}

        {plan.length === 0 && (
          <p className="text-sm text-mint-600 px-1 py-3">Nothing planned today.</p>
        )}
      </div>

      {/* Social at the bottom, collapsed by default */}
      <Leaderboard />
    </div>
  );
}

function TaskRow({ item, done, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`w-full rounded-xl border px-3 py-2.5 flex items-center gap-3 text-left shadow-sm transition-all ${
        done ? 'bg-mint-100/80 border-mint-300 opacity-70' : 'bg-white border-mint-200 hover:border-mint-300'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${done ? 'bg-mint-300/50' : 'bg-mint-50'}`}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium ${done ? 'line-through text-mint-500' : 'text-mint-900'}`}>
          {item.label}
          {(item.agent || item.agentOverride) && (
            <span className="ml-2 text-[10px] font-medium text-mint-700 bg-mint-100 border border-mint-300 rounded-full px-2 py-0.5 align-middle">🤖 agent</span>
          )}
        </div>
        <div className="text-xs text-mint-600 mt-0.5">{item.time}</div>
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? 'bg-mint-500 border-mint-500' : 'border-mint-300'}`}>
        {done && <span className="text-white text-xs">✓</span>}
      </div>
    </button>
  );
}
