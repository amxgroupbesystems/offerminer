import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  side = 'left',
  title,
  children,
  className,
}: SheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onOpenChange(false);
    };
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    left: 'left-0 top-0 bottom-0 max-w-xs w-full animate-in slide-in-from-left',
    right: 'right-0 top-0 bottom-0 max-w-md w-full animate-in slide-in-from-right',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 bg-[#111726] border-slate-700/80 p-5 shadow-2xl flex flex-col h-full overflow-y-auto border-r',
          side === 'right' ? 'border-l border-r-0' : '',
          sideClasses[side],
          className
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          {title ? <h2 className="text-base font-bold text-slate-100">{title}</h2> : <div />}
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
            aria-label="Fechar painel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 py-4">{children}</div>
      </div>
    </div>
  );
}
