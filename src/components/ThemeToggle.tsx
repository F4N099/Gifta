import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all"
      aria-label="Toggle theme"
    >
      <div className="w-16 h-8 bg-gray-100 dark:bg-gray-700 rounded-full p-1 flex items-center">
        <div className="flex-1 h-6 flex items-center justify-center">
          <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-rose-500' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 h-6 flex items-center justify-center">
          <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-rose-500' : 'text-gray-400'}`} />
        </div>
        <div
          className={`absolute w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-sm transform transition-transform duration-200 ${
            theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;