import React, { useState } from 'react';
import { ExternalLink, Heart, Share2, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { GiftSuggestion } from '../types/gift';
import { useAuth } from '../contexts/AuthContext';
import { useSavedGifts } from '../contexts/SavedGiftsContext';
import SaveGiftDialog from './SaveGiftDialog';
import ShareGiftDialog from './ShareGiftDialog';
import SimilarGiftsDialog from './SimilarGiftsDialog';

interface GiftCardProps extends GiftSuggestion {
  onTopicClick: (topic: string) => void;
  onRemove?: () => void;
}

const GiftCard: React.FC<GiftCardProps> = ({
  emoji,
  title,
  price,
  description,
  topics,
  buyLink,
  source,
  onTopicClick,
  onRemove
}) => {
  const { user } = useAuth();
  const { savedGifts } = useSavedGifts();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSimilarDialog, setShowSimilarDialog] = useState(false);
  const isSaved = savedGifts.has(buyLink);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSaveDialog(true);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareDialog(true);
  };

  const handleSimilarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      setShowSimilarDialog(true);
    } else {
      toast.error('Please sign in to find similar gifts');
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="text-4xl">{emoji}</div>
          <div className="flex items-center gap-3">
            {source === 'Amazon' ? (
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" 
                alt="Amazon"
                className="h-5 opacity-60 dark:invert"
              />
            ) : (
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg" 
                alt="Etsy"
                className="h-5 opacity-60 dark:invert"
              />
            )}
            {onRemove ? (
              <button
                onClick={onRemove}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                title="Remove from list"
              >
                <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSimilarClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  title="Find similar gifts"
                >
                  <Sparkles className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                </button>
                <button
                  onClick={handleShareClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  title="Share gift idea"
                >
                  <Share2 className="w-5 h-5 text-gray-400 group-hover:text-rose-500" />
                </button>
                <button
                  onClick={handleSaveClick}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  title={isSaved ? 'Remove from saved' : 'Save gift idea'}
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isSaved 
                        ? 'fill-rose-500 text-rose-500' 
                        : 'text-gray-400 group-hover:text-rose-500'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="text-left">
          <h3 className="text-lg font-medium mb-2 dark:text-white">{title}</h3>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-semibold text-rose-500 dark:text-rose-400">€{price}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">estimated price</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-4">{description}</p>
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, index) => (
              <button
                key={index}
                onClick={() => onTopicClick(topic)}
                className="text-sm px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors touch-manipulation"
              >
                {topic}
              </button>
            ))}
          </div>

          <a
            href={buyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 w-full justify-center text-sm px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-colors"
          >
            View options
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <SaveGiftDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        gift={{
          emoji,
          title,
          price,
          description,
          topics,
          buyLink,
          source
        }}
      />

      <ShareGiftDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        gift={{
          emoji,
          title,
          price,
          description,
          topics,
          buyLink,
          source
        }}
      />

      <SimilarGiftsDialog
        isOpen={showSimilarDialog}
        onClose={() => setShowSimilarDialog(false)}
        gift={{
          emoji,
          title,
          price,
          description,
          topics,
          buyLink,
          source
        }}
        onTopicClick={onTopicClick}
      />
    </>
  );
};

export default GiftCard;