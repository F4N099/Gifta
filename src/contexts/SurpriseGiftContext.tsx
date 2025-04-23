import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

interface SurpriseGiftContextType {
  isSurpriseEnabled: boolean;
  toggleSurprise: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const SurpriseGiftContext = createContext<SurpriseGiftContextType>({
  isSurpriseEnabled: false,
  toggleSurprise: () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
});

export const SurpriseGiftProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isSurpriseEnabled, setIsSurpriseEnabled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleSurprise = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setIsSurpriseEnabled(prev => !prev);
  };

  return (
    <SurpriseGiftContext.Provider value={{
      isSurpriseEnabled,
      toggleSurprise,
      showAuthModal,
      setShowAuthModal,
    }}>
      {children}
    </SurpriseGiftContext.Provider>
  );
};

export const useSurpriseGift = () => {
  const context = useContext(SurpriseGiftContext);
  if (context === undefined) {
    throw new Error('useSurpriseGift must be used within a SurpriseGiftProvider');
  }
  return context;
};