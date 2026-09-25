import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'scaling' | 'cyan' | 'emerald' | 'purple';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700/60',
    secondary: 'bg-[#161e2e] text-slate-300 border-slate-700/40',
    outline: 'bg-transparent text-slate-300 border-slate-700',
    scaling: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold',
    cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-md border tracking-tight',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
