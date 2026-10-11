import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Settings2, Bot, LogOut } from 'lucide-react';

const navMain = [
  { label: 'Dashboard',      path: '/',             icon: LayoutDashboard },
  { label: 'Agent',          path: '/agent-config',  icon: Settings2 },
];

export default function TopNav() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <header
      className="w-full h-16 px-6 flex items-center justify-between border-b flex-shrink-0 relative z-20"
      style={{
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(24px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {/* Brand & Main Nav */}
      <div className="flex items-center gap-8">
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

        <nav className="flex items-center gap-1">
          {navMain.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  color: isActive ? 'var(--text)' : 'var(--text-muted)',
                  background: isActive ? 'rgba(124,106,245,0.16)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(124,106,245,0.3)' : 'transparent'}`,
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: isActive ? '#9B8DF8' : 'var(--text-dim)' }} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7C6AF5, #9B8DF8)' }}
          >
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
            {user?.username || 'Admin'}
          </span>
        </div>
        <button
          onClick={logout}
          title="Sign out"
          className="p-1.5 rounded-lg transition-all"
          style={{ color: 'var(--text-dim)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(248,113,113,0.09)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
