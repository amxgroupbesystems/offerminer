import React from 'react';
import { TimelineEvent } from '../types/offer';
import { Sparkles, TrendingUp, Layers, Tag, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'first_seen':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'new_ads':
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case 'new_creatives':
        return <Layers className="w-4 h-4 text-purple-400" />;
      case 'ticket_change':
        return <Tag className="w-4 h-4 text-amber-400" />;
      case 'ad_stopped':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'last_check':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events.map((ev) => (
        <div key={ev.id} className="relative group">
          <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-[#131926] border border-slate-700 flex items-center justify-center shadow-md">
            {getIcon(ev.type)}
          </div>
          <div className="bg-[#131926] border border-slate-800/80 rounded-xl p-3.5 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-200">{ev.title}</h4>
              <span className="text-xs font-mono text-slate-400">{formatDate(ev.date)}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{ev.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
