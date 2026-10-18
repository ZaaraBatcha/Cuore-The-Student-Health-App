// The visible face of the day agent: every decision it made today, with
// the reason. This card is the proof that the plan is adapting to data.
export default function AgentFeed({ events }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="card-fresh mb-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <div>
            <div className="font-bold text-mint-900">Adaptations today</div>
            <div className="text-xs text-mint-700">Your day agent re-plans as data changes</div>
          </div>
        </div>
        <div className="chip text-xs">{events.length}</div>
      </div>

      <div className="space-y-3 mt-3">
        {events.map((e) => (
          <div key={e.id} className="flex items-start gap-3 pl-1">
            <div className="chip text-[10px] w-12 text-center flex-shrink-0 mt-0.5">{e.at}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-mint-900 leading-snug">{e.action}</div>
              <div className="text-xs text-mint-600 leading-relaxed mt-0.5">{e.reason}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-mint-500 mt-3 leading-relaxed">
        Runs entirely on your device: no cloud, no API keys. The plan re-checks itself every time your steps,
        water, tasks, weather or calendar change.
      </p>
    </div>
  );
}
