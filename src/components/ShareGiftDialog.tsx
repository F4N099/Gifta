import React, { useState } from 'react';
import { X, Copy, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { GiftSuggestion } from '../types/gift';
import { useAuth } from '../contexts/AuthContext';

interface ShareGiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gift: GiftSuggestion;
}

const ShareGiftDialog: React.FC<ShareGiftDialogProps> = ({
  isOpen,
  onClose,
  gift
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share gifts');
      return;
    }

    setIsLoading(true);
    try {
      // First check if the gift already exists
      const { data: existingGift, error: fetchError } = await supabase
        .from('saved_gifts')
        .select('id')
        .eq('buy_link', gift.buyLink)
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        throw fetchError;
      }

      // Get the gift ID either from existing or new gift
      const giftId = existingGift?.id || (await saveNewGift()).id;

      // Create share token
      const { data: share, error: shareError } = await supabase
        .from('shared_gifts')
        .insert({
          gift_id: giftId
        })
        .select('share_token')
        .single();

      if (shareError) throw shareError;

      const shareUrl = `${window.location.origin}/share/${share.share_token}`;
      setShareUrl(shareUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing gift:', error);
      toast.error('Failed to share gift');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNewGift = async () => {
    const { data, error } = await supabase
      .from('saved_gifts')
      .insert({
        user_id: user?.id,
        title: gift.title,
        emoji: gift.emoji,
        price: gift.price,
        description: gift.description,
        topics: gift.topics,
        buy_link: gift.buyLink,
        source: gift.source
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Share Gift
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{gift.emoji}</span>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {gift.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                €{gift.price}
              </p>
            </div>
          </div>

          {shareUrl ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-600 dark:text-gray-300 text-sm"
                />
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied!');
                  }}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
              >
                <span>Preview Share</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <button
              onClick={handleShare}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating link...</span>
                </>
              ) : (
                <span>Generate Share Link</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareGiftDialog;