import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOffers } from '../hooks/useOffers';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { FilterPanel } from '../components/FilterPanel';
import { ActiveFilterChips } from '../components/ActiveFilterChips';
import { OfferGrid } from '../components/OfferGrid';
import { OfferFilterParams, OfferStatus, CreativeFormat, FunnelType } from '../types/offer';

export function OffersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<OfferFilterParams>(() => {
    const parseNumber = (val: string | null) => val ? Number(val) : undefined;
    return {
      search: searchParams.get('q') || searchParams.get('search') || '',
      status: (searchParams.get('status') as OfferStatus) || undefined,
      niche: searchParams.get('niche') || undefined,
      country: searchParams.get('country') || undefined,
      creativeFormat: (searchParams.get('format') as CreativeFormat) || undefined,
      funnelType: (searchParams.get('funnel') as FunnelType) || undefined,
      hasVsl: (searchParams.get('hasVsl') as 'yes' | 'no' | 'all') || undefined,
      pageTechnology: searchParams.get('pageTechnology') || undefined,
      platform: (searchParams.get('platform') as any) || undefined,
      minTicket: parseNumber(searchParams.get('minTicket')),
      maxTicket: parseNumber(searchParams.get('maxTicket')),
      minAgeDays: parseNumber(searchParams.get('minAgeDays')),
      minAdsCount: parseNumber(searchParams.get('minAdsCount')),
      sortBy: (searchParams.get('sort') as any) || 'scale_score_desc',
    };
  });

  // Sync URL params to URL whenever they change
  const applyFiltersToUrl = (newFilters: OfferFilterParams) => {
    const newParams = new URLSearchParams();
    
    if (newFilters.search) newParams.set('q', newFilters.search);
    if (newFilters.status) newParams.set('status', newFilters.status);
    if (newFilters.niche) newParams.set('niche', newFilters.niche);
    if (newFilters.country) newParams.set('country', newFilters.country);
    if (newFilters.creativeFormat) newParams.set('format', newFilters.creativeFormat);
    if (newFilters.funnelType) newParams.set('funnel', newFilters.funnelType);
    if (newFilters.hasVsl) newParams.set('hasVsl', newFilters.hasVsl);
    if (newFilters.pageTechnology) newParams.set('pageTechnology', newFilters.pageTechnology);
    if (newFilters.platform) newParams.set('platform', newFilters.platform);
    if (newFilters.minTicket !== undefined) newParams.set('minTicket', newFilters.minTicket.toString());
    if (newFilters.maxTicket !== undefined) newParams.set('maxTicket', newFilters.maxTicket.toString());
    if (newFilters.minAgeDays !== undefined) newParams.set('minAgeDays', newFilters.minAgeDays.toString());
    if (newFilters.minAdsCount !== undefined) newParams.set('minAdsCount', newFilters.minAdsCount.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'scale_score_desc') newParams.set('sort', newFilters.sortBy);

    setSearchParams(newParams, { replace: true });
    setFilters(newFilters);
  };

  const { data, isLoading } = useOffers(filters);

  const handleSearchChange = (val: string) => {
    applyFiltersToUrl({ ...filters, search: val });
  };

  const handleRemoveSingleFilter = (key: keyof OfferFilterParams) => {
    const next = { ...filters };
    delete next[key];
    applyFiltersToUrl(next);
  };

  const handleResetFilters = () => {
    applyFiltersToUrl({
      search: '',
      sortBy: 'scale_score_desc',
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <PageHeader
        title="Catálogo de Ofertas"
        subtitle="Explore ofertas low ticket mapeadas na Meta Ads Library com indicadores observacionais de volume e consistência."
      />

      {/* Main Search Bar */}
      <SearchBar
        value={filters.search || ''}
        onChange={handleSearchChange}
        placeholder="Buscar por nome da oferta, nicho, página anunciante, domínio ou texto do anúncio..."
      />

      {/* Advanced Filters and Sort Bar */}
      <FilterPanel
        filters={filters}
        onChange={applyFiltersToUrl}
        onReset={handleResetFilters}
        availableNiches={data?.availableNiches}
        availableCountries={data?.availableCountries}
        availableTechnologies={data?.availableTechnologies}
        totalResults={data?.total}
        isOpen={filterPanelOpen}
        onToggle={() => setFilterPanelOpen((prev) => !prev)}
      />

      {/* Active Filter Chips */}
      <ActiveFilterChips
        filters={filters}
        onRemoveFilter={handleRemoveSingleFilter}
        onClearAll={handleResetFilters}
      />

      {/* Results Grid */}
      <OfferGrid
        offers={data?.offers || []}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
        pageSize={12}
      />
    </div>
  );
}
