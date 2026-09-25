import React from 'react';
import { Platform } from '../types/offer';
import { Tooltip } from './ui/tooltip';
import { getPlatformLabel } from '../utils/formatters';

interface PlatformBadgesProps {
  platforms: Platform[];
  size?: 'sm' | 'md';
}

export function PlatformBadges({ platforms, size = 'sm' }: PlatformBadgesProps) {
  const getIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return (
          <span className="font-bold text-[#1877F2]">f</span>
        );
      case 'instagram':
        return (
          <span className="font-bold text-[#E4405F]">IG</span>
        );
      case 'messenger':
        return (
          <span className="font-bold text-[#00B2FF]">M</span>
        );
      case 'audience_network':
        return (
          <span className="font-bold text-[#0081FB]">AN</span>
        );
      case 'threads':
        return (
          <span className="font-bold text-slate-300">@</span>
        );
      default:
        return <span>•</span>;
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {platforms.map((p) => (
        <Tooltip key={p} content={getPlatformLabel(p)} side="top">
          <span
            className={`inline-flex items-center justify-center rounded-md bg-[#0f172a] border border-slate-700/80 px-1.5 py-0.5 text-[10px] font-mono shadow-sm cursor-help hover:border-slate-500 transition-colors`}
          >
            {getIcon(p)}
          </span>
        </Tooltip>
      ))}
    </div>
  );
}
