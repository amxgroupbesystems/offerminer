import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { OfferFilterParams } from '../types/offer';
import { getCreativeFormatLabel, getFunnelLabel } from '../utils/formatters';

interface ActiveFilterChipsProps {
  filters: OfferFilterParams;
  onRemoveFilter: (key: keyof OfferFilterParams) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({ filters, onRemoveFilter, onClearAll }: ActiveFilterChipsProps) {
  const chips: { key: keyof OfferFilterParams; label: string }[] = [];

  if (filters.search) {
    chips.push({ key: 'search', label: `Busca: "${filters.search}"` });
  }
  if (filters.niche && filters.niche !== 'all') {
    chips.push({ key: 'niche', label: `Nicho: ${filters.niche}` });
  }
  if (filters.country && filters.country !== 'all') {
    chips.push({ key: 'country', label: `País: ${filters.country}` });
  }
  if (filters.language && filters.language !== 'all') {
    chips.push({ key: 'language', label: `Idioma: ${filters.language}` });
  }
  if (filters.creativeFormat) {
    chips.push({ key: 'creativeFormat', label: `Formato: ${getCreativeFormatLabel(filters.creativeFormat)}` });
  }
  if (filters.funnelType) {
    chips.push({ key: 'funnelType', label: `Funil: ${getFunnelLabel(filters.funnelType)}` });
  }
  if (filters.hasVsl && filters.hasVsl !== 'all') {
    chips.push({ key: 'hasVsl', label: `VSL: ${filters.hasVsl === 'yes' ? 'Sim' : 'Não'}` });
  }
  if (filters.status && filters.status !== 'all') {
    chips.push({ key: 'status', label: `Status: ${filters.status}` });
  }
  if (filters.minTicket) {
    chips.push({ key: 'minTicket', label: `Ticket min: R$ ${filters.minTicket}` });
  }
  if (filters.maxTicket) {
    chips.push({ key: 'maxTicket', label: `Ticket max: R$ ${filters.maxTicket}` });
  }
  if (filters.minAgeDays) {
    chips.push({ key: 'minAgeDays', label: `Idade mín: ${filters.minAgeDays} dias` });
  }
  if (filters.minAdsCount) {
    chips.push({ key: 'minAdsCount', label: `Mín anúncios: ${filters.minAdsCount}` });
  }
  if (filters.platform) {
    chips.push({ key: 'platform', label: `Plataforma: ${filters.platform}` });
  }
  if (filters.pageTechnology && filters.pageTechnology !== 'all') {
    chips.push({ key: 'pageTechnology', label: `Tecnologia: ${filters.pageTechnology}` });
  }
  if (filters.onlyFavorites) {
    chips.push({ key: 'onlyFavorites', label: 'Apenas favoritos' });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      <span className="text-xs text-slate-400 font-medium">Filtros ativos:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800/90 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key)}
            aria-label={`Remover filtro ${chip.label}`}
            className="text-slate-400 hover:text-white rounded p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-1 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        Limpar filtros
      </button>
    </div>
  );
}
