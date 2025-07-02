import React, { createContext, useContext } from 'react';
import { useRevenueCat } from './RevenueCatProvider';

interface AdsContext {
  showAd: () => void;
}

const AdsContext = createContext<AdsContext | undefined>(undefined);

export const AdsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { subscriber } = useRevenueCat();

  const showAd = () => {
    if (!subscriber) {
      console.log('Showing interstitial ad...');
    }
  };

  return <AdsContext.Provider value={{ showAd }}>{children}</AdsContext.Provider>;
};

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error('useAds must be used within AdsProvider');
  return ctx;
}
