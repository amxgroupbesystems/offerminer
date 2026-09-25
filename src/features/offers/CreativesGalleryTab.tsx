import React, { useState } from 'react';
import { Offer, Creative } from '../../types/offer';
import { Maximize2, Play, Layers, Image as ImageIcon } from 'lucide-react';
import { CreativeLightbox } from '../../components/CreativeLightbox';
import { getCreativeFormatLabel, formatDate } from '../../utils/formatters';

interface CreativesGalleryTabProps {
  offer: Offer;
}

export function CreativesGalleryTab({ offer }: CreativesGalleryTabProps) {
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'image' | 'video' | 'carousel'>('all');

  const allCreatives = offer.creatives.length > 0 ? offer.creatives : [offer.mainCreative];

  const filteredCreatives = allCreatives.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Filter tabs for creative type */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-[#131926] border border-slate-800/90 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'image', 'video', 'carousel'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === type
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {type === 'all' ? 'Todos os Criativos' : getCreativeFormatLabel(type)}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {filteredCreatives.length} criativos catalogados
        </span>
      </div>

      {/* Grid of creatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCreatives.map((creative) => (
          <div
            key={creative.id}
            className="group bg-[#131926] border border-slate-800/90 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between transition-all"
          >
            {/* Visual media container */}
            <div className="relative aspect-video bg-[#090d16] overflow-hidden">
              <img
                src={creative.thumbnailUrl}
                alt={creative.title || 'Criativo da oferta'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Format Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-black/75 text-slate-200 border border-white/10 backdrop-blur-md">
                  {creative.type === 'video' && <Play className="w-3 h-3 text-cyan-400 fill-current" />}
                  {creative.type === 'carousel' && <Layers className="w-3 h-3 text-cyan-400" />}
                  {creative.type === 'image' && <ImageIcon className="w-3 h-3 text-cyan-400" />}
                  <span>{getCreativeFormatLabel(creative.type)}</span>
                </span>
              </div>

              {/* Ads Using Count Badge */}
              <div className="absolute top-2.5 right-2.5">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-[#131926]/90 text-cyan-300 border border-cyan-500/30">
                  {creative.adsUsingCount} anúncios usam
                </span>
              </div>

              {/* Zoom Button Overlay */}
              <button
                onClick={() => setSelectedCreative(creative)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Ampliar criativo"
              >
                <div className="p-3 rounded-full bg-cyan-600/90 text-white shadow-xl flex items-center gap-2 text-xs font-semibold">
                  <Maximize2 className="w-4 h-4" />
                  <span>Ampliar criativo</span>
                </div>
              </button>
            </div>

            {/* Creative Info */}
            <div className="p-4 flex flex-col flex-1 justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-200 line-clamp-1">
                  {creative.title || 'Variação de criativo da oferta'}
                </h4>
                {creative.body && (
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {creative.body}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span>Visto em: <strong>{formatDate(creative.firstSeenAt)}</strong></span>
                <button
                  onClick={() => setSelectedCreative(creative)}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  Ver detalhes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <CreativeLightbox
        creative={selectedCreative}
        onClose={() => setSelectedCreative(null)}
      />
    </div>
  );
}
