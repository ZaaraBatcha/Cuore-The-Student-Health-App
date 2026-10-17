import { useState } from 'react';
import { storage, todayKey } from '../lib/storage';
import { XP_RULES, levelFromPoints } from '../lib/xp';
import { MEDICATION_LIBRARY, findMedication } from '../data/medicationLibrary';
import DocumentsSection from './DocumentsSection';
import { Header } from './Layout';

const PILL_SHAPES = [
  { id: 'round', label: 'Round', icon: '⚪' },
  { id: 'oval', label: 'Oval', icon: '⬭' },
  { id: 'capsule', label: 'Capsule', icon: '💊' },
  { id: 'square', label: 'Square', icon: '⬛' },
  { id: 'liquid', label: 'Liquid', icon: '🧴' },
];

const PILL_COLORS = [
  { id: 'white', label: 'White', hex: '#f8f8f8' },
  { id: 'yellow', label: 'Yellow', hex: '#fde68a' },
  { id: 'pink', label: 'Pink', hex: '#fbcfe8' },
  { id: 'blue', label: 'Blue', hex: '#bfdbfe' },
  { id: 'green', label: 'Green', hex: '#bbf7d0' },
  { id: 'orange', label: 'Orange', hex: '#fed7aa' },
];

export default function MedicationsPage() {
  const [, setRefresh] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const meds = storage.getMedications();
  const medLogs = storage.getMedLogs();
  const today = todayKey();
  const todayTaken = medLogs[today] || {};

  const missedToday = meds.filter((m) => todayTaken[m.id] === false);
  const missedHistory = getRecentMisses(meds, medLogs);

  function handleSearch(e) {
    e?.preventDefault?.();
    if (!search.trim()) {
      setSearchResult(null);
      return;
    }
    setSearchResult(findMedication(search));
  }

  function toggleTaken(medId, taken) {
    const prev = (medLogs[today] || {})[medId];
    storage.setMedLog(today, medId, taken);
    // Award XP only when transitioning to "taken" (not on toggling off)
    if (taken && prev !== true) {
      const before = levelFromPoints(storage.getXP().points);
      storage.addXP(XP_RULES.MED_TAKEN);
      const after = levelFromPoints(storage.getXP().points);
      if (after > before) storage.markLevelSeen(after);
    }
    setRefresh((n) => n + 1);
  }

  function remove(id) {
    if (confirm('Remove this medication?')) {
      storage.removeMedication(id);
      setRefresh((n) => n + 1);
    }
  }

  return (
    <div>
      <Header
        title="💊 Daily habits"
        subtitle="Vitamins, supplements, and routines."
        action={
          <button onClick={() => setShowAdd(true)} className="btn-ghost text-sm">
            ➕
          </button>
        }
      />

      {/* Documents vault — scan or upload notes and letters */}
      <DocumentsSection />

      {/* Habit lookup — search for a vitamin/supplement to see what it does */}
      <div className="card mb-4 bg-mint-50 border-mint-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📜</span>
          <div className="text-xs uppercase tracking-wide font-semibold text-mint-600">
            What does this do?
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (searchResult) setSearchResult(null); }}
            placeholder="Type a name (e.g. Vitamin D)"
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-5 flex-shrink-0">Look up</button>
        </form>

        {searchResult && <MedicationInfo med={searchResult} />}
        {search && searchResult === null && (
          <p className="text-sm text-mint-600 mt-3 leading-relaxed">
            We don't have plain-English info for "{search}" yet. Try another spelling, or check with your pharmacist.
          </p>
        )}
      </div>

      {missedToday.length > 0 && (
        <div className="card mb-4 border-clay-400/40 bg-clay-400/5">
          <div className="font-semibold text-clay-600 mb-2">⚠️ Missed today</div>
          <p className="text-sm text-mint-700 mb-3 leading-relaxed">
            You missed {missedToday.length} habit{missedToday.length === 1 ? '' : 's'} today. If this keeps happening, try setting a phone reminder.
          </p>
          <div className="flex gap-2">
            <a href="tel:000" className="btn-secondary text-sm flex-1">📞 Call GP</a>
            <a href="tel:000" className="btn-secondary text-sm flex-1">💊 Pharmacist</a>
          </div>
        </div>
      )}

      {missedHistory.length > 0 && missedToday.length === 0 && (
        <div className="card mb-4 bg-mint-50">
          <div className="text-sm font-medium text-mint-700 mb-1">📊 Pattern</div>
          <p className="text-sm text-mint-600">
            You've missed <strong>{missedHistory.length} doses</strong> in the last week. If this keeps happening, consider a pill organizer or a chat with your pharmacist.
          </p>
        </div>
      )}

      {meds.length === 0 ? (
        <div className="card text-center mt-6">
          <div className="text-5xl mb-3">💊</div>
          <div className="font-medium text-mint-900 mb-1">No daily habits yet</div>
          <p className="text-sm text-mint-600 mb-4">Add a vitamin, supplement, or routine to track it daily.</p>
          <button onClick={() => setShowAdd(true)} className="btn-primary">Add your first habit</button>
        </div>
      ) : (
        <div className="space-y-3">
          {meds.map((med) => (
              <MedCard
                key={med.id}
                med={med}
                taken={!!todayTaken[med.id]}
                onToggle={(v) => toggleTaken(med.id, v)}
                onRemove={() => remove(med.id)}
              />
            ))}
        </div>
      )}

      {showAdd && <MedForm onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); setRefresh((n) => n + 1); }} />}
    </div>
  );
}

function MedCard({ med, taken, onToggle, onRemove }) {
  const color = PILL_COLORS.find((c) => c.id === med.color) || PILL_COLORS[0];
  const tintClass =
    taken === true ? 'bg-gradient-to-br from-mint-100 to-mint-50 border-mint-300' :
    taken === false ? 'bg-gradient-to-br from-clay-400/10 to-white border-clay-400/40' :
    'bg-white border-mint-200';
  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${tintClass}`}>
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 border-2 shadow-sm"
          style={{ backgroundColor: color.hex, borderColor: color.hex }}
        >
          💊
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-mint-900">{med.name}</div>
          <div className="text-sm text-mint-700">{med.dosage} · {med.shape}</div>
          {med.schedule && (
            <div className="text-xs text-mint-600 mt-1">{med.schedule}</div>
          )}
        </div>
        <button onClick={onRemove} className="text-mint-400 hover:text-clay-600 text-lg px-2" aria-label="Remove">
          ×
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onToggle(true)}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
            taken ? 'bg-gradient-to-br from-mint-500 to-mint-600 text-white shadow-sm' : 'bg-mint-100 text-mint-700 hover:bg-mint-200'
          }`}
        >
          ✓ Taken
        </button>
        <button
          onClick={() => onToggle(false)}
          className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${
            taken === false ? 'bg-gradient-to-br from-clay-500 to-clay-600 text-white shadow-sm' : 'bg-mint-100 text-mint-700 hover:bg-mint-200'
          }`}
        >
          ✗ Missed
        </button>
      </div>
    </div>
  );
}

function MedicationInfo({ med }) {
  return (
    <div className="mt-4 pt-4 border-t border-mint-200">
      <div className="font-semibold text-mint-900 text-lg mb-1">{med.names[0]}</div>
      {med.names.length > 1 && (
        <div className="text-xs text-mint-500 mb-3">Also known as: {med.names.slice(1).join(', ')}</div>
      )}

      <div className="space-y-3 mt-3">
        <InfoRow icon="🎯" label="What it's for" text={med.for} />
        <InfoRow icon="⏰" label="How to take it" text={med.howToTake} />
        <InfoRow
          icon="🙂"
          label="Common side effects"
          items={med.commonEffects}
        />
        <InfoRow
          icon="📞"
          label="Call your doctor if"
          items={med.callDoctorIf}
          tone="clay"
        />
      </div>

      <p className="text-xs text-mint-500 mt-4 leading-relaxed">
        This is general info, not medical advice. Always follow your care team's instructions.
      </p>
    </div>
  );
}

function InfoRow({ icon, label, text, items, tone }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide font-semibold text-mint-600 mb-1">
        <span className="mr-1">{icon}</span>{label}
      </div>
      {text && <p className="text-sm text-mint-800 leading-relaxed">{text}</p>}
      {items && (
        <ul className="text-sm text-mint-800 leading-relaxed space-y-1">
          {items.map((item, i) => (
            <li key={i} className={`flex gap-2 ${tone === 'clay' ? 'text-clay-600' : ''}`}>
              <span className={tone === 'clay' ? 'text-clay-500' : 'text-mint-500'}>•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function getRecentMisses(meds, medLogs) {
  const dates = Object.keys(medLogs).sort().slice(0, 7);
  let count = 0;
  dates.forEach((d) => {
    const day = medLogs[d] || {};
    Object.entries(day).forEach(([medId, status]) => {
      if (status === false && meds.some((m) => m.id === medId)) count++;
    });
  });
  return count;
}

function MedForm({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [shape, setShape] = useState('round');
  const [color, setColor] = useState('white');
  const [schedule, setSchedule] = useState('Once daily');

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    storage.addMedication({
      name: name.trim(),
      dosage: dosage.trim() || '1 dose',
      shape: PILL_SHAPES.find((s) => s.id === shape)?.label || shape,
      color,
      schedule: schedule.trim(),
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-mint-900">New daily habit</h3>
          <button onClick={onClose} className="text-mint-400 text-2xl px-2">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Metformin"
              className="input"
              autoFocus
            />
          </div>

          <div>
            <label className="label">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 500 mg, 2 pills"
              className="input"
            />
          </div>

          <div>
            <label className="label">Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {PILL_SHAPES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setShape(s.id)}
                  className={`p-3 rounded-xl border-2 ${
                    shape === s.id ? 'border-mint-500 bg-mint-50' : 'border-mint-100'
                  }`}
                >
                  <div className="text-2xl">{s.icon}</div>
                  <div className="text-xs mt-1 text-mint-700">{s.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Colour</label>
            <div className="flex flex-wrap gap-2">
              {PILL_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    color === c.id ? 'ring-2 ring-mint-500 ring-offset-2' : 'border-mint-200'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="label">When to take</label>
            <input
              type="text"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Twice daily, with meals"
              className="input"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}