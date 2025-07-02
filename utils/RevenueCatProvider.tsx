import React, { createContext, useContext, useState } from 'react';

interface RevenueCatContext {
  subscriber: boolean;
  setSubscriber: (v: boolean) => void;
}

const RevenueCatContext = createContext<RevenueCatContext | undefined>(undefined);

export const RevenueCatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriber, setSubscriber] = useState(false); // placeholder for real status
  return (
    <RevenueCatContext.Provider value={{ subscriber, setSubscriber }}>
      {children}
    </RevenueCatContext.Provider>
  );
};

export function useRevenueCat() {
  const ctx = useContext(RevenueCatContext);
  if (!ctx) throw new Error('useRevenueCat must be used within RevenueCatProvider');
  return ctx;
}
