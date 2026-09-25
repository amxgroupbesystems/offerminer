import React, { useState } from 'react';
import { Offer, Ad } from '../../types/offer';
import { Copy, ExternalLink, Search, Check, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { PlatformBadges } from '../../components/PlatformBadges';
import { formatDate } from '../../utils/formatters';

interface AdsTabProps {
  offer: Offer;
}

export function AdsTab({ offer }: AdsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedAdId, setCopiedAdId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCopy = (text: string, adId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAdId(adId);
      showToast('Texto copiado!', 'A copy do anúncio foi copiada para sua área de transferência.', 'success');
      setTimeout(() => setCopiedAdId(null), 2500);
    }).catch(() => {
      showToast('Erro ao copiar', 'Não foi possível acessar a área de transferência.', 'error');
    });
  };

  const filteredAds = offer.ads.filter((ad) => {
    const matchSearch =
      ad.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.libraryId.includes(searchTerm) ||
      (ad.title && ad.title.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? ad.isActive
        : !ad.isActive;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Controls: Search and Filter inside Ads Tab */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#131926] border border-slate-800/90 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar por texto ou ID do anúncio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#0b0f19] border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="bg-[#0b0f19] border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">Todos ({offer.ads.length})</option>
              <option value="active">Ativos apenas</option>
              <option value="inactive">Pausados</option>
            </select>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Mostrando <strong className="text-cyan-400">{filteredAds.length}</strong> de {offer.ads.length}
          </span>
        </div>
      </div>

      {/* Ads List / Table */}
      <div className="space-y-4">
        {filteredAds.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-[#131926] rounded-2xl border border-slate-800">
            Nenhum anúncio corresponde aos filtros aplicados.
          </div>
        ) : (
          filteredAds.map((ad) => {
            const correspondingCreative = offer.creatives.find((c) => c.id === ad.creativeId) || offer.mainCreative;
            return (
              <div
                key={ad.id}
                className="bg-[#131926] border border-slate-800/90 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col lg:flex-row gap-5"
              >
                {/* Thumbnail Preview */}
                <div className="w-full lg:w-48 aspect-video lg:aspect-[4/3] bg-[#090d16] rounded-xl overflow-hidden shrink-0 relative border border-slate-800">
                  <img
                    src={correspondingCreative.thumbnailUrl}
                    alt={ad.title || 'Criativo'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ad.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'}`}>
                      {ad.isActive ? 'ATIVO' : 'PAUSADO'}
                    </span>
                  </div>
                </div>

                {/* Content & Metadata */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Header Row: ID, Page, Start Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">
                          ID: {ad.libraryId}
                        </span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{ad.advertiserPageName}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span>Início: {formatDate(ad.startDate)}</span>
                        {ad.callToAction && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                            CTA: {ad.callToAction}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Headline and Copy */}
                    {ad.title && (
                      <h4 className="text-sm font-bold text-slate-100 mt-2.5 mb-1">{ad.title}</h4>
                    )}
                    <div className="relative group/copy mt-2">
                      <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0f19] p-3 rounded-xl border border-slate-800/80 whitespace-pre-line font-sans">
                        {ad.body}
                      </p>
                    </div>
                  </div>

                  {/* Footer Row: Platforms + Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Plataformas:</span>
                      <PlatformBadges platforms={ad.platforms} size="sm" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(ad.body, ad.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
                      >
                        {copiedAdId === ad.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copiar texto</span>
                          </>
                        )}
                      </button>

                      <a
                        href={ad.libraryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 transition-colors"
                      >
                        <span>Ver na Meta Library</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
