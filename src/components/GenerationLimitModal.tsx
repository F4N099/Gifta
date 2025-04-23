import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useGenerationLimit } from '../contexts/GenerationLimitContext';

const GenerationLimitModal: React.FC = () => {
  const navigate = useNavigate();
  const { showLimitModal, setShowLimitModal } = useGenerationLimit();

  if (!showLimitModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-3">
            <Gift className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Vuoi generare altre idee regalo? Registrati ora per continuare 🎁
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLimitModal(false)}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Chiudi
          </button>
          <button
            onClick={() => {
              setShowLimitModal(false);
              navigate('/register');
            }}
            className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            Registrati ora
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerationLimitModal;