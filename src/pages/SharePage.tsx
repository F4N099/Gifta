import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ExternalLink, Gift, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GiftSuggestion } from '../types/gift';

const SharePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [gift, setGift] = useState<GiftSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedGift = async () => {
      try {
        const { data: share, error: shareError } = await supabase
          .from('shared_gifts')
          .select(`
            gift_id,
            saved_gifts (
              title,
              emoji,
              price,
              description,
              topics,
              buy_link,
              source
            )
          `)
          .eq('share_token', token)
          .single();

        if (shareError) throw shareError;
        if (!share?.saved_gifts) throw new Error('Gift not found');

        setGift({
          title: share.saved_gifts.title,
          emoji: share.saved_gifts.emoji,
          price: share.saved_gifts.price,
          description: share.saved_gifts.description,
          topics: share.saved_gifts.topics,
          buyLink: share.saved_gifts.buy_link,
          source: share.saved_gifts.source
        });
      } catch (error) {
        console.error('Error fetching shared gift:', error);
        setError('Gift not found or link has expired');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedGift();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
          >
            <Gift className="w-4 h-4" />
            <span>Find Gift Ideas</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="text-4xl">{gift.emoji}</div>
            {gift.source === 'Amazon' ? (
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
          </div>

          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {gift.title}
          </h1>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-semibold text-rose-500 dark:text-rose-400">
              €{gift.price}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              estimated price
            </span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {gift.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-8">
            {gift.topics.map((topic, index) => (
              <span
                key={index}
                className="text-sm px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>

          <div className="space-y-4">
            <a
              href={gift.buyLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-rose-500 text-white text-center py-3 px-6 rounded-xl hover:bg-rose-600 transition-colors"
            >
              View on Store
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              to="/"
              className="flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-center py-3 px-6 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Gift className="w-4 h-4" />
              <span>Find More Gift Ideas</span>
            </Link>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-rose-500 dark:hover:text-rose-400"
          >
            <Gift className="w-4 h-4" />
            <span>Powered by Gifta</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharePage;