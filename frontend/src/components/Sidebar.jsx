import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Settings2, BarChart2, X, Bot, LogOut } from 'lucide-react';

const navMain = [
  { label: 'Dashboard',      path: '/',             icon: LayoutDashboard },
  { label: 'Agent',          path: '/agent-config',  icon: Settings2 },
];

const navGeneral = [
  { label: 'Analytics', icon: BarChart2, disabled: true },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-[216px] flex flex-col
        transition-transform duration-200 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      style={{
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center justify-between h-[62px] px-5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #7C6AF5, #9B8DF8)',
              boxShadow: '0 2px 10px rgba(124,106,245,0.35)',
            }}
          >
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)', letterSpacing: '-0.01em' }}>
            AI Chatbot
          </span>
        </div>
        <button onClick={onClose} className="md:hidden p-1 rounded-md" style={{ color: 'var(--text-dim)' }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
          Menu
        </p>

        {navMain.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                background: isActive
                  ? 'rgba(124,106,245,0.16)'
                  : 'transparent',
                borderLeft: `2px solid ${isActive ? 'rgba(124,106,245,0.7)' : 'transparent'}`,
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#9B8DF8' : 'var(--text-dim)' }} />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-6 pb-1">
          <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-dim)' }}>
            General
          </p>
          {navGeneral.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium opacity-30 cursor-not-allowed select-none"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-dim)' }} />
                {item.label}
                <span
                  className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'var(--text-dim)' }}
                >
                  Soon
                </span>
              </div>
            );
          })}
        </div>
      </nav>

      {/* User footer */}
      <div
        className="flex items-center justify-between px-4 py-4 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #7C6AF5, #9B8DF8)' }}
          >
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
              {user?.username || 'Admin'}
            </p>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-dim)' }}>
              {user?.role || 'Admin'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg flex-shrink-0 transition-all"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.09)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
