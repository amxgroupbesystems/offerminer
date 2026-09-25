import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ExternalLink, Bell, RefreshCw, Sparkles, LogOut } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  onOpenMobileNav: () => void;
}

export function AppHeader({ onOpenMobileNav }: AppHeaderProps) {
  const [searchValue, setSearchValue] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, signOut } = useAuth();


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/ofertas?q=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const handleRefresh = () => {
    showToast(
      'Sincronização com Meta Library',
      'Dados e sinais de anúncios atualizados com base na última extração observada.',
      'info'
    );
  };

  const handleNotifications = () => {
    showToast(
      'Alertas de Escala',
      '4 novas ofertas atingiram sinal de escala consistente nas últimas 24 horas.',
      'info'
    );
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-700/60"
          aria-label="Abrir navegação móvel"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Monitorando Meta Ads Library</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-mono">Última checagem: hoje às 17:45</span>
        </div>
      </div>

      {/* Middle: Fast Search bar in header */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisa rápida (ex: guia visual, kit dinâmicas, pdf)..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#111724] border border-slate-800 hover:border-slate-700 focus:border-cyan-500 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
          title="Verificar atualizações"
          aria-label="Verificar atualizações"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        <button
          onClick={handleNotifications}
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
          title="Notificações de novas ofertas"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
        </button>

        {/* External direct link to Meta Ads Library */}
        <a
          href="https://www.facebook.com/ads/library"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#161f30] hover:bg-[#1e2a42] text-cyan-300 border border-cyan-500/30 transition-colors"
        >
          <span>Meta Ads Library</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* User profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <span className="hidden lg:inline-block text-xs text-slate-300 font-medium truncate max-w-[120px]">
              {user.user_metadata?.full_name || user.email}
            </span>
            <button
              onClick={signOut}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
              title="Sair da conta"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

