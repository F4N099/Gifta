import React, { useState } from 'react';
import { X, Copy, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ShareListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  list: {
    id: string;
    name: string;
    cover_image?: string | null;
    icon?: string | null;
  };
}

const ShareListDialog: React.FC<ShareListDialogProps> = ({
  isOpen,
  onClose,
  list
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share lists');
      return;
    }

    setIsLoading(true);
    try {
      const { data: share, error: shareError } = await supabase
        .from('shared_lists')
        .insert({
          list_id: list.id
        })
        .select('share_token')
        .single();

      if (shareError) throw shareError;

      const shareUrl = `${window.location.origin}/share/list/${share.share_token}`;
      setShareUrl(shareUrl);

      // Copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing list:', error);
      toast.error('Failed to share list');
    } finally {
      setIsLoading(false);
    }
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
            Share List
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
            {list.cover_image ? (
              <img
                src={list.cover_image}
                alt={list.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : list.icon ? (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
                {list.icon}
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-3xl">
                🎁
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {list.name}
              </h3>
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

export default ShareListDialog;