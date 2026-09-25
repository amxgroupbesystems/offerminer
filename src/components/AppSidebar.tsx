import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Heart,
  SearchCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { Tooltip } from './ui/tooltip';

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick?: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse, onItemClick }: AppSidebarProps) {
  const { count: favoritesCount } = useFavorites();
  const { showToast } = useToast();
  const location = useLocation();

  const isOffersActive =
    location.pathname === '/ofertas' || location.pathname.startsWith('/ofertas/');

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Ofertas',
      path: '/ofertas',
      icon: Flame,
      isActiveOverride: isOffersActive,
      badge: 'Escala',
    },
    {
      label: 'Favoritos',
      path: '/favoritos',
      icon: Heart,
      badgeCount: favoritesCount,
    },
    {
      label: 'Pesquisas Monitoradas',
      path: '/pesquisas',
      icon: SearchCheck,
    },
    {
      label: 'Configurações',
      path: '/configuracoes',
      icon: Settings,
    },
  ];

  const handleLogoutVisual = () => {
    showToast(
      'Sessão Demonstração',
      'No MVP as permissões e o perfil são simulados localmente.',
      'info'
    );
  };

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#0d121d] border-r border-slate-800/90 transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-slate-800/80">
        <NavLink
          to="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-900/40 shrink-0 font-extrabold text-lg">
            ⚡
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                {BRAND_CONFIG.name}
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-semibold border border-cyan-500/30">
                  MVP
                </span>
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Meta Ads Spy & Discovery
              </span>
            </div>
          )}
        </NavLink>

        {/* Collapse toggle button (desktop) */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActiveOverride !== undefined ? item.isActiveOverride : location.pathname === item.path;

          const linkContent = (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-300 font-semibold border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 border border-transparent'
              } ${collapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform ${
                  active ? 'text-cyan-400 scale-110' : 'text-slate-400'
                }`}
              />

              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-600 text-white font-bold font-mono">
                      {item.badgeCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.path} content={item.label} side="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-800/90 bg-[#0a0e17]">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800 ${
            collapsed ? 'justify-center p-2' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-cyan-900/60 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0 font-bold text-xs">
            FM
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-100 truncate">Fausto Marques</p>
              <p className="text-[10px] text-cyan-400 font-semibold truncate flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Plano Pro Scaler
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogoutVisual}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sair (apenas visual)"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
