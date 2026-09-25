import React from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface ExternalLinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  iconOnly?: boolean;
}

export function ExternalLinkButton({
  href,
  children,
  variant = 'secondary',
  size = 'md',
  iconOnly = false,
  className,
  ...props
}: ExternalLinkButtonProps) {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/40',
    secondary: 'bg-[#1e293b] hover:bg-[#283548] text-slate-200 border border-slate-700/70',
    outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700',
    ghost: 'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 h-8',
    md: 'text-xs sm:text-sm px-3 py-2 gap-2 h-9',
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98]',
        variants[variant],
        iconOnly ? 'p-2 w-9 h-9' : sizes[size],
        className
      )}
      {...props}
    >
      {children}
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
    </a>
  );
}
