export default function Layout({ children, currentPage, onNavigate }) {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-6 pb-28">
        {children}
      </main>
      <BottomNav current={currentPage} onNavigate={onNavigate} />
    </div>
  );
}

function BottomNav({ current, onNavigate }) {
  const items = [
    { id: 'today', label: 'Today', icon: '🏠' },
    { id: 'meds', label: 'Habits', icon: '💊' },
    { id: 'log', label: 'Log', icon: '➕' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-gradient-to-t from-mint-100 via-mint-50 to-white border-t border-mint-200 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {items.map((item) => {
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`nav-pill ${active ? 'nav-pill-active' : ''}`}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function Header({ title, subtitle, action }) {
  return (
    <header className="mb-4 relative">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-mint-900">{title}</h1>
          {subtitle && <p className="text-sm text-mint-600 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">{action}</div>}
      </div>
    </header>
  );
}