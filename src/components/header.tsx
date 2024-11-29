import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
    username: string;
    onLogout: () => void;
}

export function Header({ username, onLogout }: HeaderProps) {
    return (
        <div className="flex items-center gap-4">
            <span className="text-gray-700">Welcome, {username}</span>
            <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors"
            >
                <LogOut size={16} />
                Logout
            </button>
        </div>
    );
}