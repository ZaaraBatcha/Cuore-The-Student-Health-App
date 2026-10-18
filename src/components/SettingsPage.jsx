import { useState } from 'react';
import { storage } from '../lib/storage';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
} from '../lib/speech';
import { FITNESS_LEVELS } from '../data/profileOptions';
import { Header } from './Layout';

export default function SettingsPage({ profile, onProfileSave }) {
  const [settings, setSettings] = useState(() => storage.getSettings());
  const speechRecognitionSupported = isSpeechRecognitionSupported();
  const speechSynthesisSupported = isSpeechSynthesisSupported();

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

      {profile && <ProfileEditor profile={profile} onProfileSave={onProfileSave} />}

      <div className="card mb-4">
        <div className="font-semibold text-mint-900 mb-3">Accessibility</div>

        <ToggleRow
          label="🎙️ Speech-to-text"
          description={
            speechRecognitionSupported
              ? 'Enable voice input when adding a log. Your browser may ask for microphone permission.'
              : 'Speech recognition is not supported by this browser. Try a browser such as Chrome.'
          }
          checked={settings.voiceInput}
          onChange={(v) => update('voiceInput', v)}
        />

        <div className="my-3 border-t border-mint-100" />

        <ToggleRow
          label="🔊 Text-to-speech"
          description="Read log confirmations and supported insights aloud."
          checked={settings.readAloud}
          onChange={(v) => update('readAloud', v)}
        />
        {settings.readAloud && (
          <button
            type="button"
            onClick={() => speak('Text to speech is on. Cuore can read supported content aloud.')}
            disabled={!speechSynthesisSupported}
            className="btn-secondary w-full text-sm disabled:cursor-not-allowed"
          >
            {speechSynthesisSupported ? '🔊 Test speech' : 'Text-to-speech is not supported in this browser'}
          </button>
        )}
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
        Cuore is a personal wellbeing tool, not a substitute for medical or professional advice.
      </p>
    </div>
  );
}

function ProfileEditor({ profile, onProfileSave }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [weight, setWeight] = useState(profile.weight ?? '');
  const [heightCm, setHeightCm] = useState(profile.heightCm ?? '');
  const [fitnessLevel, setFitnessLevel] = useState(profile.fitnessLevel || 'moderate');

  function save(e) {
    e.preventDefault();
    const w = parseFloat(weight);
    const h = parseFloat(heightCm);
    const updated = {
      ...profile,
      name: name.trim() || profile.name,
      weight: isNaN(w) ? (profile.weight ?? null) : w,
      heightCm: isNaN(h) ? (profile.heightCm ?? null) : h,
      fitnessLevel,
    };
    storage.setProfile(updated);
    if (onProfileSave) onProfileSave(updated);
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="card mb-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-semibold text-mint-900">Profile</div>
          <button onClick={() => setEditing(true)} className="text-sm text-mint-600 font-medium hover:underline">
            Edit
          </button>
        </div>
        <div className="text-sm text-mint-700 space-y-1">
          <div>👋 <strong>{profile.name}</strong></div>
          {profile.weight && <div>⚖️ Weight: {profile.weight} {profile.weightUnit || 'kg'}</div>}
          {profile.heightCm && <div>📏 Height: {profile.heightCm} cm</div>}
          {profile.fitnessLevel && (
            <div>💪 Activity: {(FITNESS_LEVELS.find((f) => f.id === profile.fitnessLevel) || {}).label || profile.fitnessLevel}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="card mb-4">
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-semibold text-mint-900">Edit profile</div>
        <button type="button" onClick={() => setEditing(false)} className="text-sm text-mint-600 font-medium">
          Cancel
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Weight (kg)</label>
            <input
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Height (cm)</label>
            <input
              type="number"
              min="0"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Activity level</label>
          <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} className="input">
            {FITNESS_LEVELS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn-primary w-full mt-4">Save changes</button>
    </form>
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
        className={`relative w-12 h-7 rounded-full shadow-inner transition-all duration-200 flex-shrink-0 mt-1 min-h-0 ${
          checked ? 'bg-gradient-to-r from-mint-400 to-mint-600' : 'bg-mint-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}