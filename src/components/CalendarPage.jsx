import { useState, useRef, useEffect } from 'react';
import { storage } from '../lib/storage';
import { monthGrid, monthName, sameDay, groupByDate, upcomingReminders, REMINDER_OPTIONS, getReminderOption, formatTime } from '../lib/calendar';
import WeekCalendar, { getWeekStart } from './WeekCalendar';
import { Header } from './Layout';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [view, setView] = useState('month'); // 'month' | 'week'
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAdd, setShowAdd] = useState(false);
  const fileRef = useRef(null);

  const appointments = storage.getAppointments();
  const grouped = groupByDate(appointments);

  useEffect(() => {
    // Sync selectedDate with viewDate when in month view (jump to first of month)
  }, [viewDate]);

  function prev() {
    if (view === 'month') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else {
      const d = new Date(weekStart);
      d.setDate(d.getDate() - 7);
      setWeekStart(d);
    }
  }
  function next() {
    if (view === 'month') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + 7);
      setWeekStart(d);
    }
  }

  function selectedKey() {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }

  const selectedAppointments = grouped[selectedKey()] || [];
  const reminders = upcomingReminders(appointments);
  const grid = view === 'month' ? monthGrid(viewDate.getFullYear(), viewDate.getMonth()) : null;

  return (
    <div>
      <Header
        title="📅 Calendar"
        subtitle="Classes, events & reminders."
        action={
          <button onClick={() => setShowAdd(true)} className="btn-ghost text-sm">
            ➕
          </button>
        }
      />

      {/* View toggle */}
      <div className="flex gap-1 bg-mint-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setView('month')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'month' ? 'bg-white text-mint-700 shadow-sm' : 'text-mint-600'
          }`}
        >
          📅 Month
        </button>
        <button
          onClick={() => setView('week')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'week' ? 'bg-white text-mint-700 shadow-sm' : 'text-mint-600'
          }`}
        >
          📆 Week
        </button>
      </div>

      {reminders.length > 0 && (
        <div className="card mb-4 border-clay-400/40 bg-clay-400/5">
          <div className="text-sm font-medium text-clay-600 mb-2">⏰ Coming up</div>
          <div className="space-y-2">
            {reminders.slice(0, 3).map((r) => (
              <div key={r.appointment.id + r.reminderOption.id} className="text-sm">
                <div className="font-medium text-mint-900">{r.appointment.title}</div>
                <div className="text-xs text-mint-600">
                  {r.reminderOption.label} · {r.appointment.start && new Date(r.appointment.start).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card-mint mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prev} className="btn-ghost text-lg px-3">‹</button>
          <div className="font-bold text-mint-900">
            {view === 'month'
              ? `${monthName(viewDate.getMonth())} ${viewDate.getFullYear()}`
              : `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </div>
          <button onClick={next} className="btn-ghost text-lg px-3">›</button>
        </div>

        {view === 'month' ? (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-xs font-medium text-mint-600 text-center py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {grid.flat().map((cell, i) => {
                const key = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
                const hasEvents = (grouped[key] || []).length > 0;
                const isSelected = sameDay(cell.date, selectedDate);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(new Date(cell.date))}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative ${
                      isSelected ? 'bg-mint-500 text-white' :
                      cell.isToday ? 'bg-mint-100 text-mint-900 font-semibold' :
                      cell.inMonth ? 'text-mint-800 hover:bg-mint-50' : 'text-mint-300'
                    }`}
                  >
                    {cell.date.getDate()}
                    {hasEvents && (
                      <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-clay-500'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <WeekCalendar
            weekStart={weekStart}
            appointments={appointments}
            onSelectDate={setSelectedDate}
          />
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div className="font-bold text-mint-900">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <button onClick={() => setShowAdd(true)} className="text-mint-600 text-sm font-medium">
            + Add
          </button>
        </div>

        {selectedAppointments.length === 0 ? (
          <p className="text-sm text-mint-500">Nothing scheduled. Tap + Add to create one.</p>
        ) : (
          <div className="space-y-2">
            {selectedAppointments.map((app) => (
              <AppointmentRow key={app.id} appointment={app} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={() => fileRef.current?.click()} className="btn-secondary flex-1 text-sm">
          📥 Import .ics calendar
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".ics,text/calendar"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          const { parseICS } = await import('../lib/ics');
          const events = parseICS(text);
          events.forEach((ev) => {
            storage.addAppointment({
              title: ev.summary,
              start: ev.start.toISOString(),
              end: ev.end ? ev.end.toISOString() : null,
              notes: ev.description || ev.location || '',
              reminders: ['1_day'],
              source: 'imported',
            });
          });
          alert(`Imported ${events.length} event${events.length === 1 ? '' : 's'}.`);
          if (fileRef.current) fileRef.current.value = '';
          window.location.reload();
        }}
      />

      {showAdd && (
        <AppointmentForm
          defaultDate={selectedDate}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); window.location.reload(); }}
        />
      )}
    </div>
  );
}

function AppointmentRow({ appointment }) {
  const start = new Date(appointment.start);
  return (
    <div className="p-3 rounded-xl bg-mint-50 border border-mint-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-mint-900">{appointment.title}</div>
          <div className="text-sm text-mint-700">{formatTime(start)}</div>
        </div>
        <button
          onClick={() => {
            if (confirm('Remove this appointment?')) {
              storage.removeAppointment(appointment.id);
              window.location.reload();
            }
          }}
          className="text-mint-400 hover:text-clay-600 text-lg px-2"
          aria-label="Remove"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function AppointmentForm({ defaultDate, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(defaultDate.toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState(['1_day']);

  function toggleReminder(id) {
    setReminders((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const start = new Date(`${date}T${time}`);
    storage.addAppointment({
      title: title.trim(),
      start: start.toISOString(),
      notes: notes.trim() || null,
      reminders,
      source: 'manual',
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-mint-900">New event</h3>
          <button onClick={onClose} className="text-mint-400 text-2xl px-2">×</button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CS 101 lecture" className="input" autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Date</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" /></div>
            <div><label className="label">Time</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="input" /></div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input resize-none" placeholder="Room, prep needed, etc." />
          </div>
          <div>
            <label className="label">Remind me</label>
            <div className="flex flex-wrap gap-2">
              {REMINDER_OPTIONS.map((opt) => (
                <button type="button" key={opt.id} onClick={() => toggleReminder(opt.id)} className={`chip ${reminders.includes(opt.id) ? 'bg-mint-500 text-white' : ''}`}>
                  {opt.label}
                </button>
              ))}
            </div>
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