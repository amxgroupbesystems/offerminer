import React, { useState } from 'react';
import { Offer } from '../types/offer';
import { OfferCard } from './OfferCard';
import { EmptyState } from './EmptyState';
import { CardGridSkeleton } from './LoadingSkeleton';
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';

interface OfferGridProps {
  offers: Offer[];
  isLoading: boolean;
  onResetFilters?: () => void;
  pageSize?: number;
}

export function OfferGrid({ offers, isLoading, onResetFilters, pageSize = 12 }: OfferGridProps) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  if (isLoading) {
    return <CardGridSkeleton count={8} />;
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        title="Nenhuma oferta encontrada"
        description="Tente ajustar sua busca por outros termos, diminuir filtros ou limpar todos os parâmetros ativos."
        icon="search"
        actionLabel="Limpar todos os filtros"
        onAction={onResetFilters}
      />
    );
  }

  const visibleOffers = offers.slice(0, visibleCount);
  const hasMore = visibleCount < offers.length;

  return (
    <div className="space-y-8">
      {/* 4 columns on large screens, 3 on medium, 1 on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        {visibleOffers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setVisibleCount((prev) => prev + pageSize)}
            className="gap-2 px-8"
          >
            <span>Carregar mais ofertas</span>
            <ChevronDown className="w-4 h-4" />
            <span className="text-xs text-slate-400">
              ({visibleOffers.length} de {offers.length})
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
