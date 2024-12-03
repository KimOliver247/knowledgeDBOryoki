import React from 'react';
import { Moon, Sun, ExternalLink } from 'lucide-react';
import { useDarkMode } from './DarkModeContext';

export function Settings() {
    const { isDarkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Settings</h2>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isDarkMode ? (
                            <Moon className="w-5 h-5 text-gray-400" />
                        ) : (
                            <Sun className="w-5 h-5 text-gray-400" />
                        )}
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Switch between light and dark theme
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleDarkMode}
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#59140b] focus:ring-offset-2"
                        style={{ backgroundColor: isDarkMode ? '#59140b' : '#d1d5db' }}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isDarkMode ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                    <div className="space-y-1">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Chatbot</h3>
                    </div>
                    <button
                        onClick={() => window.open('https://effulgent-fairy-6cef82.netlify.app/', '_blank')}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#59140b]"
                    >
                        Talk to Orybot
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}