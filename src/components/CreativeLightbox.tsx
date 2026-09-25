import React from 'react';
import { X, Layers, Play } from 'lucide-react';
import { Creative } from '../types/offer';
import { getCreativeFormatLabel } from '../utils/formatters';

interface CreativeLightboxProps {
  creative: Creative | null;
  onClose: () => void;
}

export function CreativeLightbox({ creative, onClose }: CreativeLightboxProps) {
  if (!creative) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-3xl w-full bg-[#131926] border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Media Preview */}
        <div className="w-full md:w-1/2 aspect-square bg-[#090d16] flex items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <img
            src={creative.thumbnailUrl}
            alt={creative.title || 'Criativo'}
            className="w-full h-full object-cover"
          />
          {creative.type === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-cyan-600/90 text-white flex items-center justify-center shadow-lg shadow-cyan-900/50">
                <Play className="w-6 h-6 fill-current ml-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Details Sidebar */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {getCreativeFormatLabel(creative.type)}
              </span>
              <span className="text-xs text-slate-400">
                Utilizado em <strong className="text-slate-200">{creative.adsUsingCount}</strong> anúncios
              </span>
            </div>

            {creative.title && (
              <h3 className="text-base font-bold text-slate-100">{creative.title}</h3>
            )}

            {creative.body && (
              <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                <p className="font-semibold text-slate-400 mb-1">Texto associado ao criativo:</p>
                {creative.body}
              </div>
            )}

            <div className="text-xs text-slate-400 pt-2 space-y-1 border-t border-slate-800">
              <p>Primeira observação: <strong className="text-slate-300">{creative.firstSeenAt}</strong></p>
              {creative.duration && <p>Duração do vídeo: <strong className="text-slate-300">{creative.duration}</strong></p>}
              {creative.carouselCardsCount && <p>Telas no carrossel: <strong className="text-slate-300">{creative.carouselCardsCount}</strong></p>}
            </div>
          </div>

          <div className="pt-6">
            <p className="text-[11px] text-slate-500 italic">
              * Mídia observacional capturada para fins de análise de formato publicitário.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
