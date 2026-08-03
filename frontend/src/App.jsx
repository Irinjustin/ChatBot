import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';
import ChatWidget from './components/ChatWidget';

function AppContent() {
  const { user } = useAuth();
  const agentId = user?.id || 1;

  return (
    <>
      <AppRoutes />
      <ChatWidget agentId={agentId} botName="AI Assistant" />
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


