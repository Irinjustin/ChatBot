import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Agent Configuration', path: '/agent-config', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-10">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI
        </h1>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <Icon
                className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
            Need Help?
          </p>
          <p className="text-xs text-slate-600 mb-3">
            Check out our documentation or contact support.
          </p>
          <button className="w-full text-xs bg-white text-blue-600 font-medium py-2 rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            View Docs
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
