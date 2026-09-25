import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOffers } from '../hooks/useOffers';
import { useFavorites } from '../context/FavoritesContext';
import { PageHeader } from '../components/PageHeader';
import { OfferCard } from '../components/OfferCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { Heart, ArrowRight } from 'lucide-react';

export function FavoritesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { favoriteIds } = useFavorites();

  // Query only favorites
  const { data, isLoading } = useOffers({
    onlyFavorites: true,
    search: searchTerm,
  });

  const favorites = data?.offers || [];

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Ofertas Favoritas"
        subtitle="Coleção pessoal de ofertas salvas para acompanhamento contínuo e benchmarking de criativos."
      >
        <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 flex items-center gap-1.5 font-mono">
          <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
          {favoriteIds.length} salvas
        </span>
      </PageHeader>

      {/* Filter inside favorites if user has items */}
      {favoriteIds.length > 0 && (
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar dentro das suas ofertas favoritas..."
        />
      )}

      {/* Loading state */}
      {isLoading ? (
        <CardGridSkeleton count={4} />
      ) : favoriteIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0f1422]/50 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-100">Nenhuma oferta favoritada ainda</h3>
          <p className="text-sm text-slate-400 mt-2 mb-6 leading-relaxed max-w-sm">
            Clique no ícone de coração nos cards de ofertas para salvar oportunidades interessantes e acessá-las rapidamente aqui.
          </p>
          <Link
            to="/ofertas"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 transition-all"
          >
            <span>Explorar catálogo de ofertas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Nenhum favorito encontrado"
          description="Nenhuma oferta na sua lista de favoritos corresponde ao termo de busca digitado."
          icon="search"
          actionLabel="Limpar busca"
          onAction={() => setSearchTerm('')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
          {favorites.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  );
}
