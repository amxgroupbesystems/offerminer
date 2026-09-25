import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ExternalLink, Calendar, Layers, Image as ImageIcon, Video, Sparkles, TrendingUp } from 'lucide-react';
import { Offer } from '../types/offer';
import { OfferStatusBadge } from './OfferStatusBadge';
import { FavoriteButton } from './FavoriteButton';
import { formatCurrency, formatDaysActive, getCreativeFormatLabel, getFunnelLabel } from '../utils/formatters';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const formatIcon = () => {
    if (offer.mainCreative.type === 'video') return <Video className="w-3 h-3 text-cyan-400" />;
    if (offer.mainCreative.type === 'carousel') return <Layers className="w-3 h-3 text-cyan-400" />;
    return <ImageIcon className="w-3 h-3 text-cyan-400" />;
  };

  return (
    <div className="flex flex-col bg-[#131926] border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl overflow-hidden shadow-lg shadow-black/20 hover:shadow-cyan-950/20 transition-all duration-200 group">
      {/* Top Preview Area */}
      <div className="relative w-full aspect-[16/10] bg-[#090d16] overflow-hidden">
        <img
          src={offer.mainCreative.thumbnailUrl}
          alt={offer.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#131926] via-transparent to-black/40 pointer-events-none" />

        {/* Format Badge (Top Left) */}
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-black/70 text-slate-200 border border-white/10 backdrop-blur-md">
            {formatIcon()}
            <span>{getCreativeFormatLabel(offer.mainCreative.type)}</span>
          </span>
        </div>

        {/* Favorite Button (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          <FavoriteButton offerId={offer.id} offerName={offer.name} size="md" />
        </div>

        {/* Status Badge (Bottom Left of Thumbnail) */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <OfferStatusBadge status={offer.status} />
        </div>

      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title, Advertiser and Ticket */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            <Link
              to={`/ofertas/${offer.slug || offer.id}`}
              className="text-sm sm:text-base font-bold text-slate-100 hover:text-cyan-400 line-clamp-1 transition-colors"
              title={offer.name}
            >
              {offer.name}
            </Link>
            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="text-slate-300 font-medium">{offer.advertiserPages[0]?.name || 'Página Anunciante'}</span>
            </p>
          </div>
          
          <div className="shrink-0 bg-[#0e1420] px-2.5 py-1.5 rounded-lg border border-slate-800 text-right">
            <span className="text-[8px] uppercase font-bold text-slate-400 block mb-0.5">Ticket</span>
            <div className="text-xs font-bold text-emerald-400 font-mono leading-none">
              {offer.ticket ? formatCurrency(offer.ticket, offer.currency) : '-'}
            </div>
          </div>
        </div>

        {/* Metadata Chips: Nicho, Funil, VSL, País */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700/60">
            {offer.niche}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
            {getFunnelLabel(offer.funnelType)}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
            VSL: {offer.hasVsl ? 'Sim' : 'Não'}
          </span>
          <span className="px-1.5 py-0.5 text-slate-400">
            {offer.country === 'Brasil' ? '🇧🇷 BR' : offer.country === 'Portugal' ? '🇵🇹 PT' : '🇺🇸 US'}
          </span>
        </div>

        {/* Observed Indicators Box */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#0d121c] border border-slate-800/80 text-center mt-auto">
          <div>
            <div className="text-[10px] text-slate-400 font-medium">Ativos</div>
            <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
              {offer.activeAdsCount}
            </div>
            <div className="text-[9px] text-slate-400">anúncios</div>
          </div>

          <div className="border-x border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Criativos</div>
            <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
              {offer.uniqueCreativesCount}
            </div>
            <div className="text-[9px] text-slate-400">únicos</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-medium">Mais Antigo</div>
            <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
              {offer.oldestActiveAdDays}d
            </div>
            <div className="text-[9px] text-slate-400">observados</div>
          </div>
        </div>

        {/* Growth & Last seen notice */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            {offer.adsChangeLast7Days >= 0 ? `+${offer.adsChangeLast7Days}` : offer.adsChangeLast7Days} anúncios em 7d
          </span>
          <span className="text-[10px] text-slate-400">
            Score: <strong className="text-slate-200">{offer.scaleScore}</strong>/100
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2 pt-1 border-t border-slate-800/80">
          <Link
            to={`/ofertas/${offer.slug || offer.id}`}
            className="col-span-4 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-cyan-600/90 hover:bg-cyan-500 text-white shadow-sm hover:shadow-cyan-900/30 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ver detalhes</span>
          </Link>

          <a
            href={offer.salesPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir página de vendas da oferta em nova aba"
            aria-label="Abrir página de vendas"
            className="col-span-1 flex items-center justify-center py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
