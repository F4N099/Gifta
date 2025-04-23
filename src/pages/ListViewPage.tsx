import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookmarkX } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { SavedGift } from '../types/gift';
import Navbar from '../components/Navbar';
import GiftCard from '../components/GiftCard';

const ListViewPage: React.FC = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listName, setListName] = useState('');
  const [gifts, setGifts] = useState<SavedGift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchListGifts();
  }, [user, listId, navigate]);

  const fetchListGifts = async () => {
    try {
      // First get the list name and verify ownership
      const { data: listData, error: listError } = await supabase
        .from('gift_lists')
        .select('name')
        .eq('id', listId)
        .eq('user_id', user?.id)
        .single();

      if (listError) throw listError;
      if (!listData) {
        toast.error('Lista non trovata');
        navigate('/lists');
        return;
      }

      setListName(listData.name);

      // Then get all gifts in this list
      const { data: giftsData, error: giftsError } = await supabase
        .from('list_gifts')
        .select(`
          gift_id,
          saved_gifts (
            id,
            title,
            emoji,
            price,
            description,
            topics,
            buy_link,
            source
          )
        `)
        .eq('list_id', listId)
        .order('saved_at', { ascending: false });

      if (giftsError) throw giftsError;

      setGifts(giftsData.map(item => item.saved_gifts));
    } catch (error) {
      console.error('Error fetching list gifts:', error);
      toast.error('Errore nel caricamento dei regali');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveGift = async (giftId: string) => {
    try {
      const { error } = await supabase
        .from('list_gifts')
        .delete()
        .eq('list_id', listId)
        .eq('gift_id', giftId);

      if (error) throw error;

      setGifts(gifts.filter(gift => gift.id !== giftId));
      toast.success('Regalo rimosso dalla lista');
    } catch (error) {
      console.error('Error removing gift:', error);
      toast.error('Errore nella rimozione del regalo');
    }
  };

  const handleTopicClick = (topic: string) => {
    navigate('/', { state: { selectedTopic: topic } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-24">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-24">
        <header className="mb-12">
          <button
            onClick={() => navigate('/lists')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Torna alle liste</span>
          </button>

          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
            {listName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {gifts.length} {gifts.length === 1 ? 'regalo' : 'regali'} in questa lista
          </p>
        </header>

        {gifts.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center mb-4">
              <BookmarkX className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Nessun regalo in questa lista
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Inizia a salvare regali in questa lista
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts.map((gift) => (
              <GiftCard
                key={gift.id}
                {...gift}
                onTopicClick={handleTopicClick}
                onRemove={() => handleRemoveGift(gift.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ListViewPage;