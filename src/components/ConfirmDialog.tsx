import React from 'react';
import { Dialog } from './ui/dialog';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="sm">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-100">{title}</h3>
        <p className="text-xs text-slate-400 mt-2 mb-6 leading-relaxed">{description}</p>
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="md"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
