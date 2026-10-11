import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import ChatWidget from './components/ChatWidget';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const agentId = user?.id || 1;

  const isAuthPage = ['/login', '/register'].includes(location.pathname.toLowerCase());

  return (
    <>
      <AppRoutes />
      {user && !isAuthPage && <ChatWidget agentId={agentId} botName="AI Assistant" />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;


