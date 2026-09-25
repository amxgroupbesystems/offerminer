import React from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { cn } from '../lib/utils';

interface FavoriteButtonProps {
  offerId: string;
  offerName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ offerId, offerName, className, size = 'md' }: FavoriteButtonProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(offerId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(offerId, offerName);
  };

  const sizes = {
    sm: 'p-1.5 w-7 h-7',
    md: 'p-2 w-9 h-9',
    lg: 'p-2.5 w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      className={cn(
        'rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm',
        active
          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
          : 'bg-black/50 hover:bg-black/70 text-slate-400 hover:text-rose-400 border border-white/10 hover:border-rose-500/30 backdrop-blur-sm',
        sizes[size],
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-transform duration-150 active:scale-125',
          active ? 'fill-rose-500 text-rose-500' : ''
        )}
      />
    </button>
  );
}
