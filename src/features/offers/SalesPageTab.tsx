import React from 'react';
import { Offer } from '../../types/offer';
import { ExternalLink, Globe, Cpu, Tag, Calendar, Layers, ShieldCheck } from 'lucide-react';
import { generateSalesPageScreenshot } from '../../mocks/svgPlaceholders';
import { formatCurrency, formatDateTime, getFunnelLabel } from '../../utils/formatters';

interface SalesPageTabProps {
  offer: Offer;
}

export function SalesPageTab({ offer }: SalesPageTabProps) {
  const simulatedScreenshot = generateSalesPageScreenshot(
    offer.name,
    offer.salesPageDomain,
    offer.ticket,
    offer.pageTechnology
  );

  return (
    <div className="space-y-6">
      {/* Information Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Domínio</span>
          <span className="text-xs font-semibold text-slate-200 truncate block font-mono">
            {offer.salesPageDomain}
          </span>
        </div>

        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tecnologia</span>
          <span className="text-xs font-semibold text-cyan-400 truncate block font-mono">
            {offer.pageTechnology}
          </span>
        </div>

        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ticket Identificado</span>
          <span className="text-xs font-bold text-emerald-400 truncate block font-mono">
            {formatCurrency(offer.ticket, offer.currency)}
          </span>
        </div>

        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tipo de Funil</span>
          <span className="text-xs font-semibold text-slate-200 truncate block">
            {getFunnelLabel(offer.funnelType)}
          </span>
        </div>

        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Possui VSL?</span>
          <span className="text-xs font-semibold text-slate-200 truncate block">
            {offer.hasVsl ? 'Sim (Vídeo de Vendas)' : 'Não'}
          </span>
        </div>

        <div className="bg-[#131926] border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Última Checagem</span>
          <span className="text-[11px] font-semibold text-slate-400 truncate block">
            {formatDateTime(offer.lastCheckedAt)}
          </span>
        </div>
      </div>

      {/* Simulated Browser Frame with Screenshot */}
      <div className="bg-[#131926] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Browser Top Bar */}
        <div className="bg-[#0e1420] border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex-1 max-w-xl mx-auto flex items-center gap-2 bg-[#090d16] border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono overflow-hidden">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{offer.salesPageUrl}</span>
          </div>

          <a
            href={offer.salesPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors shrink-0"
          >
            <span>Abrir página externa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Browser Viewport Simulation */}
        <div className="w-full aspect-[16/10] bg-[#090d16] relative flex items-center justify-center overflow-hidden">
          <img
            src={simulatedScreenshot}
            alt={`Screenshot simulada de ${offer.name}`}
            className="w-full h-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
