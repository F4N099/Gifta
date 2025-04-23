import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { GiftSuggestion } from '../types/gift';

interface GiftDetailModalProps {
  gift: GiftSuggestion;
  onClose: () => void;
}

const GiftDetailModal: React.FC<GiftDetailModalProps> = ({ gift, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{gift.emoji}</span>
            <h2 className="text-xl font-medium dark:text-white">{gift.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-6">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-rose-500 dark:text-rose-400">€{gift.price}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">estimated price</span>
            </div>
            
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {gift.longDescription || gift.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-4">
            {gift.matches.map((match, index) => (
              <span
                key={index}
                className="text-sm px-3 py-1 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full"
              >
                {match}
              </span>
            ))}
          </div>

          <a
            href={gift.buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-[0.45rem] w-full bg-rose-500 text-white text-center py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors mt-8"
          >
            View on Store
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default GiftDetailModal;