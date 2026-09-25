import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOfferDetails } from '../hooks/useOffers';
import { OfferStatusBadge } from '../components/OfferStatusBadge';
import { ScaleScore } from '../components/ScaleScore';
import { FavoriteButton } from '../components/FavoriteButton';
import { Tabs } from '../components/ui/tabs';
import { DetailsSkeleton } from '../components/LoadingSkeleton';
import { OverviewTab } from '../features/offers/OverviewTab';
import { AdsTab } from '../features/offers/AdsTab';
import { CreativesGalleryTab } from '../features/offers/CreativesGalleryTab';
import { SalesPageTab } from '../features/offers/SalesPageTab';
import { HistoryTab } from '../features/offers/HistoryTab';
import {
  ArrowLeft,
  ExternalLink,
  Flame,
  LayoutList,
  Layers,
  Globe,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offer, isLoading } = useOfferDetails(id);
  const [activeTab, setActiveTab] = useState<string>('overview');

  if (isLoading) {
    return (
      <div className="pb-16">
        <DetailsSkeleton />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center my-12 bg-[#131926] border border-slate-800 rounded-2xl">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Oferta não encontrada</h2>
        <p className="text-sm text-slate-400 mb-6">
          A oferta solicitada não foi localizada no catálogo observacional.
        </p>
        <Link
          to="/ofertas"
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
        >
          Voltar ao catálogo de ofertas
        </Link>
      </div>
    );
  }

  const tabsConfig = [
    { id: 'overview', label: 'Visão Geral', icon: <Flame className="w-4 h-4" /> },
    { id: 'ads', label: 'Anúncios', icon: <LayoutList className="w-4 h-4" />, badge: offer.ads.length },
    { id: 'creatives', label: 'Criativos & Mídia', icon: <Layers className="w-4 h-4" />, badge: offer.uniqueCreativesCount },
    { id: 'sales_page', label: 'Página de Vendas', icon: <Globe className="w-4 h-4" /> },
    { id: 'history', label: 'Histórico & Escala', icon: <Clock className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb & Back Link */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={() => {
              if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else {
                navigate('/ofertas');
              }
            }}
            className="hover:text-cyan-400 flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para Ofertas</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-medium truncate max-w-xs">{offer.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <FavoriteButton offerId={offer.id} offerName={offer.name} size="md" />
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Main Info */}
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <OfferStatusBadge status={offer.status} />
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
                {offer.niche}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {offer.country} • {offer.language}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {offer.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
              <span>Anunciado por:</span>
              <strong className="text-cyan-400">{offer.advertiserPages[0]?.name || 'Página do Anunciante'}</strong>
              {offer.advertiserPages[0]?.verified && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                  Verificada
                </span>
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={offer.salesPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 transition-all"
            >
              <span>Abrir página de vendas</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <a
              href={
                offer.metaLibrarySearchUrl ||
                offer.ads[0]?.libraryUrl ||
                `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(offer.name)}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#1a2333] hover:bg-[#232f45] text-slate-200 border border-slate-700/80 transition-all"
            >
              <span>Ver na Biblioteca da Meta</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Featured Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800">
          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Anúncios Ativos</span>
            <div className="text-lg font-bold text-slate-100 font-mono flex items-center gap-1.5">
              <span>{offer.activeAdsCount}</span>
              <span className="text-xs text-emerald-400 font-normal">
                (+{offer.adsChangeLast7Days} em 7d)
              </span>
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Criativos Únicos</span>
            <div className="text-lg font-bold text-cyan-400 font-mono">
              {offer.uniqueCreativesCount}
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Anúncio Mais Antigo</span>
            <div className="text-lg font-bold text-amber-400 font-mono">
              {offer.oldestActiveAdDays} dias
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Ticket Identificado</span>
            <div className="text-lg font-bold text-emerald-400 font-mono">
              {formatCurrency(offer.ticket, offer.currency)}
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Tipo de Funil</span>
            <div className="text-sm font-bold text-slate-200 truncate mt-1">
              {offer.funnelType === 'sales_page' ? 'Página de Vendas' : offer.funnelType}
            </div>
          </div>

          <div className="bg-[#0e1420] p-3 rounded-xl border border-slate-800 flex flex-col justify-center">
            <ScaleScore score={offer.scaleScore} showBar={true} />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={setActiveTab} />

      {/* Active Tab Viewport */}
      <div className="pt-2">
        {activeTab === 'overview' && <OverviewTab offer={offer} />}
        {activeTab === 'ads' && <AdsTab offer={offer} />}
        {activeTab === 'creatives' && <CreativesGalleryTab offer={offer} />}
        {activeTab === 'sales_page' && <SalesPageTab offer={offer} />}
        {activeTab === 'history' && <HistoryTab offer={offer} />}
      </div>
    </div>
  );
}
