import { useState } from 'react';
import { storage } from '../lib/storage';
import { FITNESS_LEVELS } from '../data/profileOptions';
import { plantsInGarden, levelFromPoints } from '../lib/xp';
import { Header } from './Layout';
import LevelBar from './LevelBar';
import FlowerGarden from './FlowerGarden';

export default function ProfilePage({ profile, onOpenSettings, onOpenInsights }) {
  const [xp, setXP] = useState(() => storage.getXP());
  const points = xp.points;
  const level = levelFromPoints(points);
  const flowers = plantsInGarden(points);

  const fitnessLabel = profile.fitnessLevel ? (FITNESS_LEVELS.find((f) => f.id === profile.fitnessLevel)?.label || profile.fitnessLevel) : null;
  const goalLabels = {
    steps: '👟 Daily step goal',
    water: '💧 Drink enough water',
    sleep: '🌙 Sleep on schedule',
    stress: '🌿 Manage stress',
    study: '📚 Protect focus time',
    social: '🤝 Stay connected',
  };

  return (
    <div>
      <Header
        title={`Hi, ${profile.name}`}
        subtitle="Your progress, garden, and goals."
        action={
          <button onClick={onOpenSettings} className="btn-ghost text-base" aria-label="Settings">
            ⚙️
          </button>
        }
      />

      {/* Level card */}
      <div className="card-fresh mb-4">
        <LevelBar points={points} />
      </div>

      {/* Flower garden */}
      <div className="mb-4">
        <FlowerGarden totalPoints={points} currentLevel={level} plantsCount={flowers} />
      </div>

      {/* Profile details */}
      <div className="card-mint">
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-bold text-mint-900">Profile</div>
          <div className="chip-soft text-xs">All on this device</div>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="👋 Name" value={profile.name} />
          {profile.weight && <Row label="⚖️ Weight" value={`${profile.weight} ${profile.weightUnit || 'kg'}`} />}
          {profile.heightCm && <Row label="📏 Height" value={`${profile.heightCm} cm`} />}
          {fitnessLabel && <Row label="💪 Activity" value={fitnessLabel} />}
        </div>
        {profile.goals && profile.goals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-mint-200">
            <div className="text-xs font-medium text-mint-700 mb-2">Your priorities</div>
            <div className="flex flex-wrap gap-1.5">
              {profile.goals.map((g) => (
                <span key={g} className="chip text-xs">{goalLabels[g] || g}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What earns points */}
      <div className="card mt-4">
        <div className="font-bold text-mint-900 mb-3">How to earn points</div>
        <div className="space-y-2 text-sm text-mint-700">
          <EarnRow action="Complete a schedule item" points={10} icon="✅" />
          <EarnRow action="Reach your daily step goal" points={5} icon="👟" />
          <EarnRow action="Hit your daily water goal" points={5} icon="💧" />
          <EarnRow action="Log a note or mood" points={3} icon="📝" />
        </div>
        <p className="text-xs text-mint-500 mt-3 leading-relaxed">
          Every 100 points grows a new plant in your garden.
        </p>
      </div>

      {/* Quick links */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {onOpenInsights && (
          <button onClick={onOpenInsights} className="card text-left hover:border-mint-300 transition-colors">
            <div className="text-2xl mb-1">🌱</div>
            <div className="font-medium text-mint-900 text-sm">Insights & logbook</div>
          </button>
        )}
        <button onClick={onOpenSettings} className="card text-left hover:border-mint-300 transition-colors">
          <div className="text-2xl mb-1">⚙️</div>
          <div className="font-medium text-mint-900 text-sm">Settings & data</div>
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mint-600">{label}</span>
      <span className="font-medium text-mint-900">{value}</span>
    </div>
  );
}

function EarnRow({ action, points, icon }) {
  return (
    <div className="flex items-center justify-between">
      <span><span className="mr-2">{icon}</span>{action}</span>
      <span className="font-semibold text-mint-700">+{points}</span>
    </div>
  );
}