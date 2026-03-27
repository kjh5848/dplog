'use client';

import React, { createContext, useContext } from 'react';
import useAuthStoreLocal from "../useAuthStoreLocal";
import useSearchStoreLocal from "../useSearchStoreLocal";

interface StoreContextType {
  authStore: ReturnType<typeof useAuthStoreLocal>;
  searchStore: ReturnType<typeof useSearchStoreLocal>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const authStore = useAuthStoreLocal();
  const searchStore = useSearchStoreLocal();

  return (
    <StoreContext.Provider value={{ authStore, searchStore }}>
      {children}
    </StoreContext.Provider>
  );
}

// 전역 인증 스토어 사용 훅
export function useAuthStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useAuthStore must be used within StoreProvider');
  }
  return context.authStore;
}

// 전역 검색 스토어 사용 훅
export function useSearchStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useSearchStore must be used within StoreProvider');
  }
  return context.searchStore;
}