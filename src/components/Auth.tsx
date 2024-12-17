import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { authenticateUser, updateLastLogin, verifyLastLogin } from '../lib/auth';
import { log, LogLevel } from '../lib/logger';
import toast from 'react-hot-toast';

interface AuthProps {
  onAuth: (authenticated: boolean, isAdmin: boolean) => void;
}

export function Auth({ onAuth }: AuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await log(LogLevel.INFO, 'Login attempt started', { username });
      const { authenticated, is_admin } = await authenticateUser(username, password);

      if (authenticated) {
        localStorage.setItem('currentUser', username);
        console.log('About to update last login for:', username);
        try {
          await updateLastLogin(username);
          // Add verification step
          await verifyLastLogin(username);
        } catch (updateError) {
          console.error('Failed to update last login:', updateError);
        }
        await log(LogLevel.INFO, 'Login successful', { username, is_admin });
        onAuth(true, is_admin);
        toast.success('Successfully authenticated!');
      } else {
        await log(LogLevel.WARN, 'Login failed - invalid credentials', { username });
        toast.error('Invalid credentials');
      }
    } catch (error) {
      await log(LogLevel.ERROR, 'Login error', {
        username,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('Authentication error:', error);
      toast.error('Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#59140b]/5 to-[#59140b]/10 flex flex-col items-center justify-center p-4">
      <img
        src="https://oryoki.de/bilder/intern/shoplogo/oryoki-logo.png"
        alt="ORYOKI Logo"
        className="w-48 mb-12"
      />
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[#59140b]/10 p-3 rounded-full mb-4">
            <Shield className="w-8 h-8 text-[#59140b]" />
          </div>
          <h2 className="text-2xl font-light text-gray-900">Knowledge Base Zugang</h2>
          <p className="text-gray-500 mt-2 text-center">Geben Sie Ihre Anmeldeinformationen ein, um auf das Wissensdatenbank-System zuzugreifen</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
              placeholder="Benutzername eingeben"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200 input-focus transition-colors"
              placeholder="Passwort eingeben"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium btn-primary transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Anmelden'}
          </button>
        </form>
      </div>
    </div>
  );
}