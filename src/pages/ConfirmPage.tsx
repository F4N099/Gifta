import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PartyPopper } from 'lucide-react';
import Logo from '../components/Logo';

const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Logo />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-center mb-6">
              <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-4">
                <PartyPopper className="w-8 h-8 text-rose-500" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              🎉 Account confermato!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Ora puoi accedere con il tuo account.
            </p>

            <Link
              to="/login"
              className="block w-full bg-rose-500 text-white py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Vai al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPage;