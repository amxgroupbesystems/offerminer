import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar por nome, anunciante, nicho, palavra-chave...',
  className,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebounce(internalValue, 280);

  // Sync internal value if prop changes from outside
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Emit debounced value
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className={`relative flex items-center w-full ${className || ''}`}>
      <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Campo de busca"
        className="w-full pl-10 pr-10 py-2.5 bg-[#131926] border border-slate-700/70 hover:border-slate-600 focus:border-cyan-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="absolute right-3 p-1 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
