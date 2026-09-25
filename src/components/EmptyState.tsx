import React from 'react';
import { SearchX, Inbox, RefreshCcw } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'search' | 'inbox';
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = 'search',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0f1422]/50 max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 mb-4 shadow-inner">
        {icon === 'search' ? <SearchX className="w-8 h-8 text-cyan-400" /> : <Inbox className="w-8 h-8 text-cyan-400" />}
      </div>
      <h3 className="text-lg font-bold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="secondary" size="md" onClick={onAction} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
