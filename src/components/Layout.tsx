import React from 'react';
import { BookOpen, Users, Settings, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: string | null;
  isAdmin: boolean;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Layout({ children, currentUser, isAdmin, activeView, onNavigate, onLogout }: LayoutProps) {
  const menuItems = [
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
    ...(isAdmin ? [{ id: 'user-admin', label: 'User Administration', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6">
            <img
              src="https://oryoki.de/bilder/intern/shoplogo/oryoki-logo.png"
              alt="ORYOKI Logo"
              className="h-8"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeView === item.id
                      ? 'bg-[#59140b] text-white'
                      : 'text-gray-700 hover:bg-stone-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4 text-sm font-medium text-gray-700">
              {currentUser}
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 py-12 px-8">
          {children}
        </main>
      </div>
    </div>
  );
}