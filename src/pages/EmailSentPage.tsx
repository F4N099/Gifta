import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import Logo from '../components/Logo';

const EmailSentPage: React.FC = () => {
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
                <Mail className="w-8 h-8 text-rose-500" />
              </div>
            </div>

            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Controlla la tua email
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Ti abbiamo inviato un'email di conferma. Clicca sul link per attivare il tuo account.
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Non hai ricevuto nulla? Controlla la cartella spam oppure
              </p>

              <button
                className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 transition-colors"
                onClick={() => {
                  // TODO: Implement resend functionality
                  console.log('Resend verification email');
                }}
              >
                <span>Reinvia email</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSentPage;