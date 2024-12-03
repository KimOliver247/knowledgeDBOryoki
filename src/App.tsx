import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { KnowledgeForm } from './components/KnowledgeForm';
import { UserAdmin } from './components/UserAdmin';
import { Settings } from './components/Settings';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('currentUser'));
  const [activeView, setActiveView] = useState('knowledge-base');

  const handleAuth = (authenticated: boolean, admin: boolean) => {
    setIsAuthenticated(authenticated);
    setIsAdmin(admin);
    setCurrentUser(localStorage.getItem('currentUser'));
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCurrentUser(null);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'knowledge-base':
        return <KnowledgeForm />;
      case 'user-admin':
        return isAdmin ? <UserAdmin /> : null;
      case 'settings':
        return <Settings />;
      default:
        return <KnowledgeForm />;
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      {!isAuthenticated ? (
        <Auth onAuth={handleAuth} />
      ) : (
        <Layout
          currentUser={currentUser}
          isAdmin={isAdmin}
          activeView={activeView}
          onNavigate={setActiveView}
          onLogout={handleLogout}
        >
          {renderContent()}
        </Layout>
      )}
    </>
  );
}

export default App;