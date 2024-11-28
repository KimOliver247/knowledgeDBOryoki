import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { KnowledgeForm } from './components/KnowledgeForm';
import { UserAdmin } from './components/UserAdmin';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserAdmin, setShowUserAdmin] = useState(false);

  const handleAuth = (authenticated: boolean, admin: boolean) => {
    setIsAuthenticated(authenticated);
    setIsAdmin(admin);
  };

  return (
    <>
      <Toaster position="top-right" />
      {!isAuthenticated ? (
        <Auth onAuth={handleAuth} />
      ) : (
        <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <img
                src="https://oryoki.de/bilder/intern/shoplogo/oryoki-logo.png"
                alt="ORYOKI Logo"
                className="h-12"
              />
              {isAdmin && (
                <button
                  onClick={() => setShowUserAdmin(!showUserAdmin)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg btn-secondary"
                >
                  {showUserAdmin ? 'View Knowledge Base' : 'User Administration'}
                </button>
              )}
            </div>

            {showUserAdmin && isAdmin ? (
              <UserAdmin />
            ) : (
              <KnowledgeForm />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;