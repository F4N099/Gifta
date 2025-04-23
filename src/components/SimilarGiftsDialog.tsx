import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { GiftSuggestion } from '../types/gift';
import { getGiftSuggestions } from '../services/giftService';
import GiftCard from './GiftCard';

interface SimilarGiftsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftSuggestion;
  onTopicClick: (topic: string) => void;
}

const SimilarGiftsDialog: React.FC<SimilarGiftsDialogProps> = ({
  isOpen,
  onClose,
  gift,
  onTopicClick
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [similarGifts, setSimilarGifts] = useState<GiftSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSimilarGifts();
    }
  }, [isOpen]);

  const fetchSimilarGifts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const description = `Looking for gifts similar to: ${gift.title}. This is a ${gift.description} The gift has these features: ${gift.topics.join(', ')}`;

      const response = await getGiftSuggestions({
        description,
        interests: gift.topics,
        budget: Math.ceil(gift.price * 1.2) // Allow slightly higher budget for similar items
      });

      setSimilarGifts(response.suggestions.filter(g => g.buyLink !== gift.buyLink));
    } catch (error) {
      console.error('Error fetching similar gifts:', error);
      setError('Failed to load similar gifts');
      toast.error('Failed to load similar gifts');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Similar Gift Ideas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-8">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Original Gift
            </div>
            <GiftCard
              {...gift}
              onTopicClick={onTopicClick}
            />
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Similar Suggestions
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                <button
                  onClick={fetchSimilarGifts}
                  className="px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {similarGifts.map((gift, index) => (
                  <GiftCard
                    key={index}
                    {...gift}
                    onTopicClick={onTopicClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarGiftsDialog;