import React from 'react';
import { Sparkles } from 'lucide-react';
import { useSurpriseGift } from '../contexts/SurpriseGiftContext';
import { useTranslation } from 'react-i18next';

const SurpriseToggle: React.FC = () => {
  const { isSurpriseEnabled, toggleSurprise } = useSurpriseGift();
  const { t } = useTranslation();

  const handleToggle = (e: React.MouseEvent) => {
    // Prevent form submission
    e.preventDefault();
    toggleSurprise();
  };

  return (
    <button
      type="button" // Explicitly set type to prevent form submission
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-500/30 transition-colors"
      aria-pressed={isSurpriseEnabled}
      role="switch"
    >
      <div className="flex items-center gap-2">
        <Sparkles className={`w-4 h-4 ${isSurpriseEnabled ? 'text-rose-500' : 'text-gray-400'}`} />
        <span className={`text-sm ${isSurpriseEnabled ? 'text-rose-500 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
          {t('form.surprise.toggle')}
        </span>
      </div>
      <div className={`relative ml-2 w-10 h-5 rounded-full transition-colors ${isSurpriseEnabled ? 'bg-rose-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isSurpriseEnabled ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
};

export default SurpriseToggle