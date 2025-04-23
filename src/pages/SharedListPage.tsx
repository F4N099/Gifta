import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Gift, Loader2, UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SavedGift } from '../types/gift';
import GiftCard from '../components/GiftCard';
import { useAuth } from '../contexts/AuthContext';

interface SharedList {
  id: string;
  name: string;
  cover_image: string | null;
  icon: string | null;
  person: {
    id: string;
    name: string;
    relationship: string;
    avatar_url: string | null;
  } | null;
  user: {
    name: string | null;
  };
  gifts: SavedGift[];
}

const SharedListPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const [list, setList] = useState<SharedList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedList = async () => {
      try {
        const { data: share, error: shareError } = await supabase
          .from('shared_lists')
          .select(`
            list_id,
            gift_lists (
              id,
              name,
              cover_image,
              icon,
              user_id,
              person_id,
              people (
                id,
                name,
                relationship,
                avatar_url
              ),
              profiles (
                name
              )
            )
          `)
          .eq('share_token', token)
          .single();

        if (shareError) throw shareError;
        if (!share?.gift_lists) throw new Error('List not found');

        const { data: gifts, error: giftsError } = await supabase
          .from('list_gifts')
          .select(`
            gift_id,
            saved_gifts (*)
          `)
          .eq('list_id', share.list_id)
          .order('saved_at', { ascending: false });

        if (giftsError) throw giftsError;

        setList({
          id: share.gift_lists.id,
          name: share.gift_lists.name,
          cover_image: share.gift_lists.cover_image,
          icon: share.gift_lists.icon,
          person: share.gift_lists.people,
          user: {
            name: share.gift_lists.profiles?.name
          },
          gifts: gifts.map(item => item.saved_gifts)
        });
      } catch (error) {
        console.error('Error fetching shared list:', error);
        setError('List not found or link has expired');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSharedList();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (error || !list) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gifta</span>
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-4 mb-4">
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
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {list.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Shared by {list.user.name || 'Someone'}
              </p>
              {list.person && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {list.person.avatar_url ? (
                    <img
                      src={list.person.avatar_url}
                      alt={list.person.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-8 h-8 text-gray-400" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {list.person.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {list.person.relationship}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {list.gifts.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                No gifts in this list yet
              </h2>
            </div>
          ) : (
            list.gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                {...gift}
                onTopicClick={() => {}}
              />
            ))
          )}
        </div>

        {!user && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Not a Gifta user yet?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Find the perfect gift in seconds
                </p>
              </div>
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3 bg-rose-500 text-white text-center rounded-xl hover:bg-rose-600 transition-colors"
              >
                Register now
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default SharedListPage;