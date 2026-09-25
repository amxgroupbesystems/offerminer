import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-1 leading-relaxed max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
