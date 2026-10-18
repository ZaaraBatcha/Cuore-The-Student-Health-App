import { useState } from 'react';
import { storage } from '../lib/storage';
import { XP_RULES, levelFromPoints } from '../lib/xp';
import { Header } from './Layout';
import { createSpeechRecognition, isSpeechRecognitionSupported, speak } from '../lib/speech';

const TRACK_TYPES = [
  { id: 'mood',     label: 'Mood',      icon: '💭' },
  { id: 'meal',     label: 'Meal',      icon: '🍽️' },
  { id: 'activity', label: 'Activity',  icon: '🚶' },
  { id: 'study',    label: 'Study',     icon: '📚' },
  { id: 'sleep',    label: 'Sleep',     icon: '😴' },
  { id: 'note',     label: 'Note',      icon: '📝' },
];

const MOOD_TAGS = ['energized', 'tired', 'stressed', 'calm', 'happy', 'anxious', 'focused', 'great'];

export default function LogPage({ onLogged, onOpenLogbook }) {
  const settings = storage.getSettings();
  const voiceEnabled = settings.voiceInput;
  const [type, setType] = useState(TRACK_TYPES[0].id);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [voiceError, setVoiceError] = useState(null);
  const [listening, setListening] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [recognition, setRecognition] = useState(null);

  function startListening() {
    setVoiceError(null);
    const rec = createSpeechRecognition({
      onResult: (text) => {
        setNote(text);
        if (settings.readAloud) speak('Saved your note.');
      },
      onError: (err) => {
        setVoiceError(`Couldn't hear that: ${err}. Try again.`);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });
    if (!rec) {
      setVoiceError('Voice input not supported in this browser. Try Chrome.');
      return;
    }
    setRecognition(rec);
    setListening(true);
    rec.start();
  }

  function stopListening() {
    if (recognition) recognition.stop();
    setListening(false);
  }

  function submit(e) {
    e?.preventDefault?.();
    const entry = {
      type,
      value: null,
      note: note || null,
      tags: type === 'mood' ? tags : null,
      timestamp: new Date().toISOString(),
    };
    storage.addLog(entry);
    const before = levelFromPoints(storage.getXP().points);
    storage.addXP(XP_RULES.LOG_ENTRY);
    const after = levelFromPoints(storage.getXP().points);
    if (after > before) storage.markLevelSeen(after);
    if (onLogged) onLogged();
    if (settings.readAloud) speak(`Logged ${type}.`);
    setNote('');
    setTags([]);
    setConfirmation(entry);
    setTimeout(() => setConfirmation(null), 4000);
  }

  return (
    <div>
      <Header title="➕ Log something" subtitle="Voice or text: your choice." />

      {confirmation && (
        <div className="card-leaf mb-4">
          <div className="font-bold text-mint-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">✓</span>
            <span>Logged {confirmation.type}{confirmation.note ? `: "${confirmation.note.slice(0, 40)}${confirmation.note.length > 40 ? '…' : ''}"` : ''}</span>
          </div>
        </div>
      )}

      {voiceEnabled && (
        <div className="card-leaf">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-mint-900">🎙️ Voice input</div>
            {!isSpeechRecognitionSupported() && (
              <span className="text-xs text-mint-600">Not supported here</span>
            )}
          </div>
          <p className="text-sm text-mint-700 mb-3">Speak freely. We'll save it as a note.</p>
          {voiceError && (
            <div className="text-sm text-clay-600 mb-3 bg-clay-400/10 px-3 py-2 rounded-lg">{voiceError}</div>
          )}
          {listening ? (
            <button onClick={stopListening} className="btn-secondary w-full animate-pulse">
              🔴 Listening: tap to stop
            </button>
          ) : (
            <button onClick={startListening} disabled={!isSpeechRecognitionSupported()} className="btn-primary w-full">
              🎙️ Tap to speak
            </button>
          )}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4 mt-4">
        <div>
          <label className="label">What are you logging?</label>
          <div className="grid grid-cols-2 gap-2">
            {TRACK_TYPES.map((t) => (
              <button type="button" key={t.id} onClick={() => setType(t.id)} className={`p-3 rounded-xl border-2 text-left transition-all shadow-sm ${type === t.id ? 'bg-white border-mint-500' : 'bg-mint-50 border-mint-200 hover:border-mint-300'}`}>
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="text-sm font-medium text-mint-900">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {type === 'mood' && (
          <div>
            <label className="label">How are you feeling?</label>
            <div className="flex flex-wrap gap-2">
              {MOOD_TAGS.map((tag) => (
                <button type="button" key={tag} onClick={() => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])} className={`chip-soft ${tags.includes(tag) ? 'bg-mint-500 text-white border-mint-500' : ''}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="label">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              type === 'meal' ? 'What did you eat?' :
              type === 'activity' ? 'What did you do?' :
              type === 'study' ? 'What did you study?' :
              type === 'sleep' ? 'How long did you sleep?' :
              type === 'mood' ? 'Anything you want to remember?' :
              'Anything important'
            }
            rows={3}
            className="input resize-none"
          />
        </div>

        <button type="submit" className="btn-primary w-full">
          Save log
        </button>
      </form>

      <button
        onClick={onOpenLogbook}
        className="btn-secondary w-full mt-3"
        aria-label="View logbook"
      >
        📖 View logbook
      </button>
    </div>
  );
}