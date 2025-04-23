import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { GiftSuggestion } from '../types/gift';

interface SavedGiftsContextType {
  savedGifts: Set<string>;
  saveGift: (gift: GiftSuggestion) => Promise<void>;
  unsaveGift: (gift: GiftSuggestion) => Promise<void>;
  isLoading: boolean;
}

const SavedGiftsContext = createContext<SavedGiftsContextType>({
  savedGifts: new Set(),
  saveGift: async () => {},
  unsaveGift: async () => {},
  isLoading: true,
});

export const SavedGiftsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [savedGifts, setSavedGifts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchSavedGifts = async () => {
        try {
          const { data } = await supabase
            .from('saved_gifts')
            .select('buy_link');
          
          if (data) {
            setSavedGifts(new Set(data.map(item => item.buy_link)));
          }
        } catch (error) {
          console.error('Error fetching saved gifts:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchSavedGifts();
    } else {
      setSavedGifts(new Set());
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveGift = async (gift: GiftSuggestion) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_gifts')
        .insert({
          user_id: user.id,
          title: gift.title,
          emoji: gift.emoji,
          price: gift.price,
          description: gift.description,
          topics: gift.topics,
          buy_link: gift.buyLink,
          source: gift.source
        });

      if (error) throw error;

      setSavedGifts(prev => new Set([...prev, gift.buyLink]));
      toast.success('Gift saved successfully');
    } catch (error) {
      console.error('Error saving gift:', error);
      toast.error('Failed to save gift');
      throw error;
    }
  };

  const handleUnsaveGift = async (gift: GiftSuggestion) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_gifts')
        .delete()
        .eq('user_id', user.id)
        .eq('buy_link', gift.buyLink);

      if (error) throw error;

      setSavedGifts(prev => {
        const next = new Set(prev);
        next.delete(gift.buyLink);
        return next;
      });
      toast.success('Gift removed from saved items');
    } catch (error) {
      console.error('Error removing gift:', error);
      toast.error('Failed to remove gift');
      throw error;
    }
  };

  return (
    <SavedGiftsContext.Provider 
      value={{
        savedGifts,
        saveGift: handleSaveGift,
        unsaveGift: handleUnsaveGift,
        isLoading
      }}
    >
      {children}
    </SavedGiftsContext.Provider>
  );
};

export const useSavedGifts = () => {
  const context = useContext(SavedGiftsContext);
  if (context === undefined) {
    throw new Error('useSavedGifts must be used within a SavedGiftsProvider');
  }
  return context;
};