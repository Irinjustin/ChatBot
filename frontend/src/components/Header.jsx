import { useAuth } from '../hooks/useAuth';
import { LogOut, Bell, User as UserIcon, Menu } from 'lucide-react';

const Header = ({ toggleMobileMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center">
        <button 
          onClick={toggleMobileMenu}
          className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-700 leading-tight">
              {user?.username || 'Admin'}
            </span>
            <span className="text-xs text-slate-500 leading-tight">
              {user?.role || 'Admin'}
            </span>
          </div>
          
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
            <UserIcon className="w-5 h-5" />
          </div>
          
          <button 
            onClick={logout}
            className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
            title="Sign out"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
