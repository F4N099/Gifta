import React from 'react';
import { Sparkles } from 'lucide-react';
import { GiftSuggestion } from '../types/gift';
import GiftCard from './GiftCard';

interface SurpriseGiftCardProps extends GiftSuggestion {
  onTopicClick: (topic: string) => void;
  onRemove?: () => void;
}

const SurpriseGiftCard: React.FC<SurpriseGiftCardProps> = (props) => {
  return (
    <div className="relative">
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 shadow-md animate-in fade-in zoom-in-95 duration-300">
          <Sparkles className="w-4 h-4" />
          <span>Surprise Pick</span>
        </div>
      </div>
      <div className="relative border-2 border-rose-200 dark:border-rose-500/20 rounded-2xl animate-in fade-in zoom-in-95 duration-300">
        <GiftCard {...props} />
      </div>
    </div>
  );
};

export default SurpriseGiftCard;