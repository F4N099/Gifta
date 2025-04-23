import React, { useState, useCallback, memo } from 'react';
import { Menu, Moon, Sun, UserRoundPlus, CircleUserRound, LogOut, ListTodo, Users, Settings, HelpCircle, Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const ProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logout successful');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Error during logout');
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-full pl-3 pr-3 py-2 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
      >
        <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <CircleUserRound className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={handleClose} />
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-20 py-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="block px-4 py-2 border-b border-gray-100 dark:border-gray-700"
                  onClick={handleClose}
                >
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-lg text-gray-500 dark:text-gray-400">
                          {profile?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {profile?.name || 'User'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Main Features */}
                <div className="py-2">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Cerca regali</span>
                  </Link>

                  <Link
                    to="/lists"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <ListTodo className="w-4 h-4" />
                    <span>Liste Regalo</span>
                  </Link>

                  <Link
                    to="/people"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <Users className="w-4 h-4" />
                    <span>Persone</span>
                  </Link>
                </div>

                {/* Settings & Support */}
                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Impostazioni</span>
                  </Link>

                  <Link
                    to="/support"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Supporto</span>
                  </Link>
                </div>

                {/* Theme Toggle */}
                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span>{theme === 'dark' ? 'Modalità Scura' : 'Modalità Chiara'}</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-rose-500' : 'bg-gray-200'} relative`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Esci</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Authentication Section */}
                <div className="py-2">
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Cerca regali</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <UserRoundPlus className="w-4 h-4" />
                    <span>Registrati</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={handleClose}
                  >
                    <CircleUserRound className="w-4 h-4" />
                    <span>Accedi</span>
                  </Link>
                </div>

                {/* Theme Toggle */}
                <div className="py-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-between px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      <span>{theme === 'dark' ? 'Modalità Scura' : 'Modalità Chiara'}</span>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-rose-500' : 'bg-gray-200'} relative`}>
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`} />
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(ProfileMenu);