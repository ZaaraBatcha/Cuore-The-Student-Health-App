import { useState } from 'react';
import { storage } from '../lib/storage';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speak,
} from '../lib/speech';
import {
  clearKey,
  getVoiceId,
  hasBuiltInKey,
  hasKey,
  hasUserKey,
  listVoices,
  saveKey,
  saveVoiceId,
  elevenSpeak,
} from '../lib/elevenlabs';
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
        clearKey();
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
            speechRecognitionSupported || hasKey()
              ? 'Enable voice input when adding a log. Uses your ElevenLabs key when one is saved, otherwise your browser speech engine. Your browser may ask for microphone permission.'
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
            disabled={!speechSynthesisSupported && !hasKey()}
            className="btn-secondary w-full text-sm disabled:cursor-not-allowed"
          >
            {speechSynthesisSupported || hasKey() ? '🔊 Test speech' : 'Text-to-speech is not supported in this browser'}
          </button>
        )}
      </div>

      <VoiceCard />

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

function VoiceCard() {
  const [keyInput, setKeyInput] = useState('');
  const [saved, setSaved] = useState(() => hasUserKey());
  // When this build ships a default key, the voice controls are usable with no setup.
  const builtIn = hasBuiltInKey();
  const active = saved || builtIn;
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState(() => getVoiceId());
  const [manualId, setManualId] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  function persist(e) {
    e.preventDefault();
    const trimmed = keyInput.trim();
    if (trimmed.length <= 20) {
      setStatus({ kind: 'error', text: 'That does not look like a full ElevenLabs key.' });
      return;
    }
    saveKey(trimmed);
    setKeyInput('');
    setSaved(true);
    setStatus({ kind: 'ok', text: 'Key saved on this device only. Try the voice test below.' });
  }

  function forget() {
    clearKey();
    setSaved(false);
    setVoices([]);
    setStatus({
      kind: 'ok',
      text: hasBuiltInKey()
        ? 'Your key was removed. The demo key built into this app is back in use.'
        : 'Key removed. Cuore is back to the browser voice.',
    });
  }

  async function loadVoices() {
    setBusy(true);
    setStatus(null);
    try {
      const list = await listVoices();
      setVoices(list);
      if (list.length && !list.some((v) => v.id === voiceId)) {
        saveVoiceId(list[0].id);
        setVoiceId(list[0].id);
      }
      setStatus({ kind: 'ok', text: `Loaded ${list.length} voices from your account.` });
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  async function testVoice() {
    setBusy(true);
    setStatus(null);
    try {
      await elevenSpeak('Hi, this is your Cuore voice. Logs and reminders can read like this.', { silent: false });
      setStatus({ kind: 'ok', text: 'That was the ElevenLabs voice.' });
    } catch (e) {
      setStatus({ kind: 'error', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  function pickVoice(id) {
    saveVoiceId(id);
    setVoiceId(id);
  }

  // Fallback for keys that cannot list voices, or for a voice the user already knows.
  function useManualId() {
    const id = manualId.trim();
    if (!id) return;
    saveVoiceId(id);
    setVoiceId(id);
    setManualId('');
    setStatus({ kind: 'ok', text: 'Voice ID saved. Press "Test ElevenLabs voice" to hear it.' });
  }

  return (
    <div className="card mb-4">
      <div className="flex items-baseline justify-between mb-2">
        <div className="font-semibold text-mint-900">🎧 AI voice</div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-mint-100 text-mint-700">OPTIONAL</span>
      </div>
      <p className="text-sm text-mint-600 mb-3 leading-relaxed">
        Add your own ElevenLabs key to use studio voices for read-aloud and Scribe for voice notes.
        Without a key Cuore uses the browser speech engine, so everything still works offline.
      </p>

      {status && (
        <div className={`text-sm mb-3 px-3 py-2 rounded-lg ${status.kind === 'error' ? 'text-clay-600 bg-clay-400/10' : 'text-mint-700 bg-mint-100'}`}>
          {status.text}
        </div>
      )}

      {active ? (
        <div className="space-y-3">
          <div className="text-sm text-mint-800 flex items-start gap-2">
            <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">✓</span>
            <span>
              {saved
                ? 'Your key is saved. It stays in this browser and is left out of backups.'
                : 'Using the demo key built into this app. Paste your own key below to override it.'}
            </span>
          </div>

          <div>
            <label className="label">Voice</label>
            <div className="flex gap-2">
              <select
                value={voiceId}
                onChange={(e) => pickVoice(e.target.value)}
                disabled={voices.length === 0}
                className="input flex-1"
              >
                {voices.length === 0 ? (
                  <option value={voiceId}>Load voices to choose one</option>
                ) : (
                  voices.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))
                )}
              </select>
              <button type="button" onClick={loadVoices} disabled={busy} className="btn-secondary text-sm whitespace-nowrap">
                {busy ? 'Working...' : 'Load voices'}
              </button>
            </div>
          </div>

          <button type="button" onClick={testVoice} disabled={busy} className="btn-primary w-full text-sm">
            🔊 Test ElevenLabs voice
          </button>

          <div>
            <label className="label">Or paste a voice ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="EXAVITQu4vr4xnSDxMaL"
                className="input flex-1"
                autoComplete="off"
              />
              <button type="button" onClick={useManualId} disabled={!manualId.trim()} className="btn-secondary text-sm whitespace-nowrap">
                Use
              </button>
            </div>
            <p className="text-[11px] text-mint-500 mt-1 leading-relaxed">
              Useful when the key cannot list voices. On a free plan Sarah, Adam and Daniel work; library voices such as Rachel need credits.
            </p>
          </div>

          {saved ? (
            <button type="button" onClick={forget} className="btn-secondary w-full text-sm text-clay-600">
              Remove key
            </button>
          ) : (
            <form onSubmit={persist} className="space-y-2 border-t border-mint-100 pt-3">
              <label className="label">Use your own key instead</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="sk_..."
                className="input"
                autoComplete="off"
              />
              <button type="submit" className="btn-primary w-full text-sm">Save key</button>
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={persist} className="space-y-2">
          <label className="label">ElevenLabs API key</label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk_..."
            className="input"
            autoComplete="off"
          />
          <button type="submit" className="btn-primary w-full text-sm">Save key</button>
          <p className="text-[11px] text-mint-500 leading-relaxed">
            Voice notes are sent to ElevenLabs to be transcribed. Everything else in Cuore, including the
            day-agent, stays on this device.
          </p>
        </form>
      )}
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