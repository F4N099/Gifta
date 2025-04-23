import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Download, Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import DeleteAccountDialog from '../components/DeleteAccountDialog';
import { toast } from 'sonner';

const languages = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const;

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDownloadData = () => {
    // This is a placeholder for the data download functionality
    const data = {
      email: user.email,
      createdAt: user.created_at,
      // Add more user data as needed
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-gifta-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error('No user found');
      return;
    }

    setIsDeletingAccount(true);
    try {
      const { error } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      }).then(res => res.json());

      if (error) throw new Error(error);

      // Sign out and redirect
      await signOut();
      toast.success(t('account.delete.success'));
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(t('account.delete.error'));
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-24">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Settings
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your preferences and account settings
          </p>
        </header>

        <div className="space-y-6">
          {/* Preferences Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Preferences
            </h2>

            <div className="space-y-6">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5 text-gray-500" /> : <Sun className="w-5 h-5 text-gray-500" />}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Tema</p>
                    <p className="text-sm text-gray-500">Scegli il tema chiaro o scuro</p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20 bg-gray-200 dark:bg-rose-500"
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Data Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
              Privacy & Data
            </h2>

            <div className="space-y-6">
              {/* Download Data */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Download Your Data</p>
                    <p className="text-sm text-gray-500">Get a copy of your personal data</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadData}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Download
                </button>
              </div>

              {/* Delete Account */}
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  className="w-full px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  Delete Account
                </button>
                <p className="mt-2 text-sm text-gray-500 text-center">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>
        </div>

        <DeleteAccountDialog
          isOpen={showDeleteDialog}
          isLoading={isDeletingAccount}
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      </main>
    </div>
  );
};

export default SettingsPage;