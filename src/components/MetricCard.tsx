import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative bg-[#131926] border border-slate-800/90 rounded-2xl p-5 shadow-lg shadow-black/20 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between overflow-hidden group',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-slate-800/80 text-cyan-400 border border-slate-700/60 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {value}
        </div>

        {(subtitle || trend) && (
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            {trend && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md',
                  trend.positive !== false
                    ? 'text-emerald-400 bg-emerald-500/10'
                    : 'text-rose-400 bg-rose-500/10'
                )}
              >
                {trend.positive !== false ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </span>
            )}
            {subtitle && <span className="text-slate-400">{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
