import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, type = 'button', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

    const variants = {
      primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-900/30 border border-cyan-500/40',
      secondary: 'bg-[#1e293b] hover:bg-[#283548] text-slate-100 border border-slate-700/60 shadow-sm',
      outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/70',
      ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white border border-rose-500/30',
      accent: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 border border-emerald-500/40',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-3.5 py-2 gap-2 h-9',
      lg: 'text-base px-5 py-2.5 gap-2.5 h-11',
      icon: 'h-9 w-9 p-0 justify-center',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
