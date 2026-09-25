import React from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { OfferFilterParams, OfferSortOption, CreativeFormat, FunnelType, Platform, OfferStatus } from '../types/offer';
import { Button } from './ui/button';

interface FilterPanelProps {
  filters: OfferFilterParams;
  onChange: (filters: OfferFilterParams) => void;
  onReset: () => void;
  availableNiches?: string[];
  availableCountries?: string[];
  availableTechnologies?: string[];
  totalResults?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  availableNiches = [],
  availableCountries = [],
  availableTechnologies = [],
  totalResults,
  isOpen,
  onToggle,
}: FilterPanelProps) {
  const updateFilter = <K extends keyof OfferFilterParams>(key: K, value: OfferFilterParams[K]) => {
    onChange({
      ...filters,
      [key]: value,
    });
  };

  const sortOptions: { value: OfferSortOption; label: string }[] = [
    { value: 'scale_score_desc', label: 'Maior sinal de escala' },
    { value: 'ads_desc', label: 'Mais anúncios ativos' },
    { value: 'creatives_desc', label: 'Mais criativos únicos' },
    { value: 'oldest_desc', label: 'Mais antiga (dias)' },
    { value: 'newest_desc', label: 'Mais recente' },
    { value: 'ticket_asc', label: 'Menor ticket' },
    { value: 'ticket_desc', label: 'Maior ticket' },
  ];

  return (
    <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-4 shadow-lg mb-6">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant={isOpen ? 'primary' : 'secondary'}
            size="sm"
            onClick={onToggle}
            className="gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros avançados</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {totalResults !== undefined && (
            <span className="text-xs text-slate-400 font-mono">
              <strong className="text-cyan-400 font-bold">{totalResults}</strong> ofertas encontradas
            </span>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-slate-400 whitespace-nowrap">
            Ordenar por:
          </label>
          <select
            id="sort-select"
            value={filters.sortBy || 'scale_score_desc'}
            onChange={(e) => updateFilter('sortBy', e.target.value as OfferSortOption)}
            className="bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expandable Filter Fields Panel */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {/* Nicho */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Nicho</label>
            <select
              value={filters.niche || 'all'}
              onChange={(e) => updateFilter('niche', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos os nichos</option>
              {availableNiches.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Status da Oferta</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => updateFilter('status', e.target.value as OfferStatus | 'all')}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos os status</option>
              <option value="scaling">Escalando (Sinal Forte)</option>
              <option value="monitored">Monitorada</option>
              <option value="recent">Recente (&lt;14 dias)</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>

          {/* Formato de Criativo */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Formato do Criativo</label>
            <select
              value={filters.creativeFormat || 'all'}
              onChange={(e) => updateFilter('creativeFormat', e.target.value === 'all' ? undefined : (e.target.value as CreativeFormat))}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos os formatos</option>
              <option value="image">Imagem Estática</option>
              <option value="video">Vídeo / Reels</option>
              <option value="carousel">Carrossel</option>
              <option value="dynamic">Dinâmico</option>
            </select>
          </div>

          {/* Tipo de Funil */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Tipo de Funil</label>
            <select
              value={filters.funnelType || 'all'}
              onChange={(e) => updateFilter('funnelType', e.target.value === 'all' ? undefined : (e.target.value as FunnelType))}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos os funis</option>
              <option value="sales_page">Página de Vendas</option>
              <option value="quiz">Quiz Interativo</option>
              <option value="whatsapp">Direto no WhatsApp</option>
              <option value="app">Aplicativo</option>
              <option value="direct_checkout">Checkout Direto</option>
            </select>
          </div>

          {/* VSL (Vídeo de Vendas) */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Possui VSL?</label>
            <select
              value={filters.hasVsl || 'all'}
              onChange={(e) => updateFilter('hasVsl', e.target.value as 'yes' | 'no' | 'all')}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos</option>
              <option value="yes">Sim, com VSL</option>
              <option value="no">Não (Apenas texto/VSL ausente)</option>
            </select>
          </div>

          {/* País */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">País Anunciado</label>
            <select
              value={filters.country || 'all'}
              onChange={(e) => updateFilter('country', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todos os países</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Tecnologia / Domínio */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Tecnologia da Página</label>
            <select
              value={filters.pageTechnology || 'all'}
              onChange={(e) => updateFilter('pageTechnology', e.target.value === 'all' ? undefined : e.target.value)}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas as tecnologias</option>
              {availableTechnologies.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Plataforma Meta */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Plataforma Meta</label>
            <select
              value={filters.platform || 'all'}
              onChange={(e) => updateFilter('platform', e.target.value === 'all' ? undefined : (e.target.value as Platform))}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">Todas as plataformas</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="messenger">Messenger</option>
              <option value="audience_network">Audience Network</option>
              <option value="threads">Threads</option>
            </select>
          </div>

          {/* Faixa de Ticket (Min e Max) */}
          <div className="sm:col-span-2">
            <label className="block text-slate-400 mb-1.5 font-medium">Faixa de Ticket (R$)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Mínimo (ex: 9)"
                value={filters.minTicket ?? ''}
                onChange={(e) => updateFilter('minTicket', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-slate-500">até</span>
              <input
                type="number"
                placeholder="Máximo (ex: 47)"
                value={filters.maxTicket ?? ''}
                onChange={(e) => updateFilter('maxTicket', e.target.value ? Number(e.target.value) : undefined)}
                className="w-1/2 bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          {/* Mínimo Anúncios e Idade Mínima */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Mín. Anúncios Ativos</label>
            <input
              type="number"
              placeholder="Ex: 10"
              value={filters.minAdsCount ?? ''}
              onChange={(e) => updateFilter('minAdsCount', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Idade Mínima (Dias)</label>
            <input
              type="number"
              placeholder="Ex: 30"
              value={filters.minAgeDays ?? ''}
              onChange={(e) => updateFilter('minAgeDays', e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-[#0e1420] border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          {/* Clear button footer */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 text-rose-400 hover:text-rose-300">
              <RotateCcw className="w-3.5 h-3.5" />
              Resetar todos os filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
