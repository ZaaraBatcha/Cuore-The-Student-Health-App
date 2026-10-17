import { useMemo } from 'react';
import { storage } from '../lib/storage';

// Expandable week view: each day is a column with appointments stacked vertically.
export default function WeekCalendar({ weekStart, appointments, onSelectDate }) {
  const days = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [weekStart]);

  const grouped = useMemo(() => {
    const map = {};
    appointments.forEach((app) => {
      const d = new Date(app.start);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = [];
      map[key].push(app);
    });
    return map;
  }, [appointments]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-1.5">
      {days.map((date, i) => {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayAppts = (grouped[key] || []).sort((a, b) => new Date(a.start) - new Date(b.start));
        const isToday = sameDay(date, today);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;

        return (
          <button
            key={i}
            onClick={() => onSelectDate && onSelectDate(date)}
            className={`w-full text-left rounded-xl p-2.5 border transition-all ${
              isToday
                ? 'bg-mint-100 border-mint-400 shadow-sm'
                : isWeekend
                ? 'bg-white/60 border-mint-100'
                : 'bg-white border-mint-200 hover:border-mint-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 text-center flex-shrink-0 ${isToday ? 'text-mint-700' : 'text-mint-600'}`}>
                <div className="text-xs font-medium uppercase tracking-wide">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-xl font-bold ${isToday ? 'text-mint-800' : 'text-mint-700'}`}>
                  {date.getDate()}
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                {dayAppts.length === 0 ? (
                  <div className="text-xs text-mint-400 italic py-2">Nothing scheduled</div>
                ) : (
                  dayAppts.map((app) => (
                    <div key={app.id} className="flex items-center gap-2 text-sm">
                      <div className="w-1 h-1 rounded-full bg-mint-500 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-mint-900 truncate">{app.title}</div>
                        <div className="text-xs text-mint-600">
                          {new Date(app.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}