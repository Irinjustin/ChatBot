import { useAuth } from '../hooks/useAuth';
import { Sparkles, Bot, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.username || 'Admin'}! 👋
            </h1>
            <p className="text-slate-500 text-lg">
              Here is what is happening with your AI Agent today.
            </p>
          </div>
          <div className="hidden sm:flex h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl items-center justify-center">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Configure Your Agent</h2>
          <p className="text-slate-600 mb-6">
            Customize your chatbot's behavior, tone, and knowledge base to perfectly match your brand identity.
          </p>
          <Link 
            to="/agent-config" 
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Go to Configuration
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Quick Test</h2>
          <p className="text-slate-600 mb-6">
            Test your agent's responses in real-time in the sandbox environment before deploying to production.
          </p>
          <Link 
            to="/agent-config" 
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Try it out
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
