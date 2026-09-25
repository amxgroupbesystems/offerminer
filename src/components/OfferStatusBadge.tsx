import React from 'react';
import { Flame, Activity, Sparkles, Clock } from 'lucide-react';
import { Tooltip } from './ui/tooltip';
import { OfferStatus } from '../types/offer';

interface OfferStatusBadgeProps {
  status: OfferStatus;
  showTooltip?: boolean;
}

export function OfferStatusBadge({ status, showTooltip = true }: OfferStatusBadgeProps) {
  const getBadgeContent = () => {
    switch (status) {
      case 'scaling':
        return {
          icon: <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 fill-amber-400" />,
          label: 'Escalando',
          classes: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
          tooltip: 'Sinal calculado com dados publicamente observados (persistência de anúncios, variação de criativos e estabilidade de campanha). Não comprova vendas nem faturamento.',
        };
      case 'monitored':
        return {
          icon: <Activity className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          label: 'Monitorada',
          classes: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          tooltip: 'Oferta com dados suficientes observados na Meta Ads Library, porém sem todos os parâmetros quantitativos de alta escala.',
        };
      case 'recent':
        return {
          icon: <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          label: 'Recente',
          classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          tooltip: 'Oferta observada há menos de 14 dias com primeiros sinais de veiculação na biblioteca.',
        };
      case 'inactive':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />,
          label: 'Inativa',
          classes: 'bg-slate-800 text-slate-400 border-slate-700/60',
          tooltip: 'Maioria dos anúncios observados pausados ou interrompidos pelo anunciante.',
        };
      default:
        return {
          icon: null,
          label: status,
          classes: 'bg-slate-800 text-slate-300 border-slate-700',
          tooltip: '',
        };
    }
  };

  const badge = getBadgeContent();

  const badgeElement = (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight ${badge.classes} transition-colors cursor-default`}
    >
      {badge.icon}
      <span>{badge.label}</span>
    </span>
  );

  if (!showTooltip || !badge.tooltip) {
    return badgeElement;
  }

  return (
    <Tooltip content={badge.tooltip} side="top">
      {badgeElement}
    </Tooltip>
  );
}
