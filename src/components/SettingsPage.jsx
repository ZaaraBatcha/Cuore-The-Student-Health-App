import { useState } from 'react';
import { storage } from '../lib/storage';
import { Header } from './Layout';

export default function SettingsPage({ profile, onProfileUpdate }) {
  const [settings, setSettings] = useState(() => storage.getSettings());

  function update(key, value) {
    storage.setSettings({ [key]: value });
    setSettings(storage.getSettings());
  }

  function exportData() {
    const data = {
      profile: storage.getProfile(),
      logs: storage.getLogs(),
      completions: storage.getCompletions(),
      medications: storage.getMedications(),
      medicationLogs: storage.getMedLogs(),
      appointments: storage.getAppointments(),
      settings: storage.getSettings(),
      xp: storage.getXP(),
      steps: storage.getSteps(),
      water: storage.getWater(),
      leaderboard: storage.getLeaderboard(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wisetrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function wipeAll() {
    if (confirm('This will erase all your data. Are you sure?')) {
      if (confirm('Really sure? This cannot be undone.')) {
        storage.clearAll();
        window.location.reload();
      }
    }
  }

  return (
    <div>
      <Header title="⚙️ Settings" subtitle="Your data, your way." />

      {profile && (
        <div className="card mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="font-semibold text-mint-900">Profile</div>
            <button onClick={onProfileUpdate} className="text-sm text-mint-600 font-medium">
              Edit
            </button>
          </div>
          <div className="text-sm text-mint-700 space-y-1">
            <div>👋 <strong>{profile.name}</strong></div>
            {profile.weight && <div>⚖️ Weight: {profile.weight} {profile.weightUnit || 'kg'}</div>}
            {profile.heightCm && <div>📏 Height: {profile.heightCm} cm</div>}
            {profile.fitnessLevel && <div>💪 Activity: {profile.fitnessLevel}</div>}
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="font-semibold text-mint-900 mb-3">Accessibility</div>

        <ToggleRow
          label="🎙️ Voice input for logging"
          description="Speak instead of typing when you log entries or notes."
          checked={settings.voiceInput}
          onChange={(v) => update('voiceInput', v)}
        />

        <div className="my-3 border-t border-mint-100" />

        <ToggleRow
          label="🔊 Read-aloud on insights"
          description="Reads screen content out loud for accessibility."
          checked={settings.readAloud}
          onChange={(v) => update('readAloud', v)}
        />
      </div>

      <div className="card mb-4">
        <div className="font-semibold text-mint-900 mb-3">Your data</div>
        <p className="text-sm text-mint-600 mb-3">
          Everything is stored locally on this device. You can take a backup or erase everything.
        </p>
        <div className="space-y-2">
          <button onClick={exportData} className="btn-secondary w-full text-sm">
            📦 Download backup
          </button>
          <button onClick={wipeAll} className="btn-secondary w-full text-sm text-clay-600">
            🗑️ Erase all data
          </button>
        </div>
      </div>

      <p className="text-xs text-mint-500 text-center mt-6 leading-relaxed">
        Wise Track is a personal tool, not a substitute for medical or professional advice.
        Always follow your care team's guidance.
      </p>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-mint-900 text-sm">{label}</div>
        <div className="text-xs text-mint-600 mt-0.5 leading-relaxed">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`relative w-14 h-7 rounded-full transition-colors flex-shrink-0 mt-1 ${
          checked ? 'bg-mint-500' : 'bg-mint-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
            checked ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}