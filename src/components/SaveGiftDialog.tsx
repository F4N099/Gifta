import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { GiftSuggestion } from '../types/gift';
import { toast } from 'sonner';

interface SaveGiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gift?: GiftSuggestion;
}

interface GiftList {
  id: string;
  name: string;
  count: number;
}

const SaveGiftDialog: React.FC<SaveGiftDialogProps> = ({ isOpen, onClose, gift }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lists, setLists] = useState<GiftList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewListInput, setShowNewListInput] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchLists();
    }
  }, [isOpen, user]);

  const fetchLists = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .select(`
          id,
          name,
          list_gifts (count)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLists(data.map(list => ({
        id: list.id,
        name: list.name,
        count: list.list_gifts?.[0]?.count || 0
      })));

      if (data.length > 0) {
        setSelectedList(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Errore nel caricamento delle liste');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) return;

    setIsCreatingList(true);
    try {
      const { data, error } = await supabase
        .from('gift_lists')
        .insert({
          user_id: user?.id,
          name: newListName.trim()
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Esiste già una lista con questo nome');
        }
        throw error;
      }

      setLists([...lists, { id: data.id, name: data.name, count: 0 }]);
      setSelectedList(data.id);
      setNewListName('');
      setShowNewListInput(false);
      toast.success('Lista creata con successo');
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error(error instanceof Error ? error.message : 'Errore nella creazione della lista');
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleSaveGift = async () => {
    if (!gift || !selectedList) return;

    setIsLoading(true);
    try {
      // First save the gift
      const { data: savedGift, error: saveError } = await supabase
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

      if (saveError) throw saveError;

      // Then add it to the selected list
      const { error: listError } = await supabase
        .from('list_gifts')
        .insert({
          list_id: selectedList,
          gift_id: savedGift.id
        });

      if (listError) throw listError;

      toast.success(`Regalo aggiunto a "${lists.find(l => l.id === selectedList)?.name}"`);
      onClose();
    } catch (error) {
      console.error('Error saving gift:', error);
      toast.error('Errore nel salvataggio del regalo');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3">
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-3">
              <Heart className="w-6 h-6 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Vuoi salvare questo regalo?
            </h2>
          </div>

          <p className="text-gray-600 dark:text-gray-300">
            Per salvare e organizzare i tuoi regali preferiti, devi creare un account gratuito.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/register');
              }}
              className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors"
            >
              Registrati
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="bg-rose-50 dark:bg-rose-500/10 rounded-full p-3">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Salva questo regalo
          </h2>
        </div>

        {showNewListInput ? (
          <div className="space-y-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nome della lista"
              maxLength={50}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 dark:focus:border-rose-500 focus:outline-none transition-all"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewListInput(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim() || isCreatingList}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isCreatingList ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creazione...</span>
                  </>
                ) : (
                  <span>Crea Lista</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {lists.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Non hai ancora creato nessuna lista
                </p>
              ) : (
                <div className="space-y-2">
                  {lists.map(list => (
                    <button
                      key={list.id}
                      onClick={() => setSelectedList(list.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                        selectedList === list.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-rose-500'
                      }`}
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {list.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {list.count} regali
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {lists.length < 10 && (
                <button
                  onClick={() => setShowNewListInput(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-rose-500 dark:hover:border-rose-500 transition-colors text-gray-600 dark:text-gray-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crea nuova lista</span>
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveGift}
                disabled={!selectedList || isLoading}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  <span>Salva Regalo</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SaveGiftDialog;