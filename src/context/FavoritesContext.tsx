import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toggleFavorite as toggleFavoriteService } from '../services/offersService';
import { useToast } from './ToastContext';

interface FavoritesContextValue {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string, offerName?: string) => Promise<boolean>;
  count: number;
}

const FAVORITES_STORAGE_KEY = 'offerminer_favorites_v1';

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (e) {
      console.error(e);
    }
  }, [favoriteIds]);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const toggle = useCallback(
    async (id: string, offerName?: string): Promise<boolean> => {
      const res = await toggleFavoriteService(id);
      setFavoriteIds((prev) => {
        if (res.isFavorite) {
          return [...prev, id];
        } else {
          return prev.filter((item) => item !== id);
        }
      });

      if (res.isFavorite) {
        showToast(
          'Adicionado aos favoritos',
          offerName ? `"${offerName}" foi salva na sua lista.` : 'Oferta salva com sucesso.',
          'success'
        );
      } else {
        showToast(
          'Removido dos favoritos',
          offerName ? `"${offerName}" foi removida da sua lista.` : 'Oferta removida da lista.',
          'info'
        );
      }

      return res.isFavorite;
    },
    [showToast]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        isFavorite,
        toggle,
        count: favoriteIds.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
