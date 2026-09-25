import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { BRAND_CONFIG } from '../config/brand';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  User,
  Shield,
  Sliders,
  Database,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

export function SettingsPage() {
  const { showToast } = useToast();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState('BR');
  const [notifyNewScaling, setNotifyNewScaling] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      'Preferências Salvas',
      'Suas configurações de mineração foram atualizadas localmente.',
      'success'
    );
  };

  const handleResetData = () => {
    localStorage.removeItem('offerminer_favorites_v1');
    localStorage.removeItem('offerminer_searches_v1');
    showToast(
      'Dados Locais Resetados',
      'Favoritos e pesquisas personalizadas foram restaurados para os padrões.',
      'info'
    );
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      <PageHeader
        title="Configurações da Plataforma"
        subtitle="Gerencie parâmetros operacionais, preferências de visualização e perfil da sua conta."
      />

      {/* User Account / Plan Details */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-lg space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          Perfil & Assinatura
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0a0e17] border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-cyan-900/30">
              FM
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-100">Fausto Marques</h4>
              <p className="text-xs text-slate-400">fausto.marques@exemplo.com.br</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Plano Pro Scaler
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-slate-800">
            <span className="text-slate-500 block mb-1">Status da Conta</span>
            <span className="font-semibold text-emerald-400">Ativa & Verificada</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-slate-800">
            <span className="text-slate-500 block mb-1">Limite de Ofertas Salvas</span>
            <span className="font-semibold text-slate-100">Ilimitado (Pro)</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0a0e17] border border-slate-800">
            <span className="text-slate-500 block mb-1">Rotinas Simultâneas</span>
            <span className="font-semibold text-slate-100">Até 25 ativas</span>
          </div>
        </div>
      </div>

      {/* Mining & Intelligence Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-lg space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Preferências de Mineração
        </h3>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-200 mb-1.5">
              País Principal de Monitoramento
            </label>
            <select
              value={defaultCountry}
              onChange={(e) => setDefaultCountry(e.target.value)}
              className="w-full sm:w-80 bg-[#0a0e17] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="BR">Brasil (BR)</option>
              <option value="PT">Portugal (PT)</option>
              <option value="US">Estados Unidos (US)</option>
              <option value="ES">Espanha (ES)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              País pré-selecionado ao abrir novas pesquisas ou catálogo.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyNewScaling}
                onChange={(e) => setNotifyNewScaling(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 bg-slate-900 border-slate-700"
              />
              <span className="text-slate-300 font-medium">
                Notificar quando uma oferta atingir sinal de escala consistente (&gt;75 pontos)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 bg-slate-900 border-slate-700"
              />
              <span className="text-slate-300 font-medium">
                Atualização automática em segundo plano das métricas de anúncios
              </span>
            </label>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <Button type="submit" variant="primary" size="md">
            Salvar Preferências
          </Button>
        </div>
      </form>

      {/* Brand & System Information */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Informações da Plataforma ({BRAND_CONFIG.name})
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Esta plataforma SaaS foi arquitetada para pesquisa quantitativa de anúncios públicos na Meta Ads Library. A identidade visual, nome do produto e logotipos são gerenciados centralmente no arquivo <code className="text-cyan-400 font-mono">src/config/brand.ts</code>.
        </p>

        <div className="p-4 rounded-xl bg-[#0a0e17] border border-slate-800 text-xs text-slate-400 space-y-1">
          <p>Nome atual: <strong className="text-slate-200">{BRAND_CONFIG.name}</strong></p>
          <p>Versão do MVP: <strong className="text-slate-200">{BRAND_CONFIG.version}</strong></p>
          <p>Tagline: <span className="text-slate-300">{BRAND_CONFIG.tagline}</span></p>
        </div>
      </div>

      {/* Reset Cache / Storage */}
      <div className="bg-[#131926] border border-rose-500/30 rounded-2xl p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Armazenamento Local & Reset
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Caso deseje restaurar o estado inicial da demonstração, apagar os favoritos salvos no seu navegador ou redefinir as pesquisas simuladas:
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setResetDialogOpen(true)}
          className="gap-2"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Resetar dados locais do MVP</span>
        </Button>
      </div>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Resetar dados locais?"
        description="Esta ação removerá todos os seus favoritos e pesquisas salvas no navegador e restaurará os dados padrões."
        confirmLabel="Sim, resetar"
        variant="danger"
        onConfirm={handleResetData}
      />
    </div>
  );
}
