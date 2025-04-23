import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface GenerationLimitContextType {
  canGenerate: boolean;
  incrementCount: () => void;
  remainingGenerations: number;
  showLimitModal: boolean;
  setShowLimitModal: (show: boolean) => void;
}

const GenerationLimitContext = createContext<GenerationLimitContextType>({
  canGenerate: true,
  incrementCount: () => {},
  remainingGenerations: 6,
  showLimitModal: false,
  setShowLimitModal: () => {},
});

const DAILY_LIMIT = 6;
const STORAGE_KEY = 'giftGenerations';

interface StoredData {
  count: number;
  date: string;
}

export const GenerationLimitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [generationCount, setGenerationCount] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Load stored generation count on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      const data: StoredData = JSON.parse(storedData);
      const today = new Date().toDateString();
      
      // Reset count if it's a new day
      if (data.date !== today) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, date: today }));
        setGenerationCount(0);
      } else {
        setGenerationCount(data.count);
      }
    }
  }, []);

  const incrementCount = () => {
    if (user) return; // Don't track for authenticated users

    const newCount = generationCount + 1;
    const today = new Date().toDateString();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      count: newCount,
      date: today
    }));
    
    setGenerationCount(newCount);
    
    if (newCount >= DAILY_LIMIT) {
      setShowLimitModal(true);
    }
  };

  const canGenerate = user || generationCount < DAILY_LIMIT;
  const remainingGenerations = DAILY_LIMIT - generationCount;

  return (
    <GenerationLimitContext.Provider value={{
      canGenerate,
      incrementCount,
      remainingGenerations,
      showLimitModal,
      setShowLimitModal
    }}>
      {children}
    </GenerationLimitContext.Provider>
  );
};

export const useGenerationLimit = () => {
  const context = useContext(GenerationLimitContext);
  if (context === undefined) {
    throw new Error('useGenerationLimit must be used within a GenerationLimitProvider');
  }
  return context;
};