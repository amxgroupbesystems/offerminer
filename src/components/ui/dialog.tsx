import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}: DialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
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

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Modal Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative w-full bg-[#131926] border border-slate-700/80 rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto transform transition-all duration-200 animate-in fade-in zoom-in-95',
          maxWidths[maxWidth],
          className
        )}
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {title && <h3 className="text-lg font-bold text-slate-100 pr-8">{title}</h3>}
        {description && <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">{description}</p>}

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
