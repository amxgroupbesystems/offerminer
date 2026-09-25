import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardMetricsQuery, useCreateMonitoredSearchMutation } from '../hooks/useOffers';
import { PageHeader } from '../components/PageHeader';
import { MetricCard } from '../components/MetricCard';
import { OfferCard } from '../components/OfferCard';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import {
  Flame,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  PlusCircle,
  Clock,
  ArrowRight,
  PieChart as PieIcon,
  Search,
  Inbox,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { OFFER_NICHES } from '../config/niches';

export function DashboardPage() {
  const { data: metrics, isLoading } = useDashboardMetricsQuery();
  const [newSearchModalOpen, setNewSearchModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [niche, setNiche] = useState('Educação');
  const [searchName, setSearchName] = useState('');
  const [country, setCountry] = useState('BR');

  const createSearchMutation = useCreateMonitoredSearchMutation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleCreateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    createSearchMutation.mutate(
      {
        name: searchName || `Mineração: ${niche}`,
        keyword: keyword.trim(),
        niche,
        country,
        frequency: 'daily',
        limitResults: 500,
        status: 'active',
      },
      {
        onSuccess: () => {
          showToast(
            'Pesquisa Monitorada Criada!',
            `O nicho "${niche}" será rastreado com os padrões de produto, dor, desejo e oferta.`,
            'success'
          );
          setNewSearchModalOpen(false);
          setKeyword('');
          setSearchName('');
        },
      }
    );
  };

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard Operacional" subtitle="Carregando métricas..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-800/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <PageHeader
        title="Dashboard de Inteligência de Ofertas"
        subtitle="Visão geral e monitoramento quantitativo de infoprodutos anunciados na Meta Ads Library."
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => setNewSearchModalOpen(true)}
          className="gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar pesquisa monitorada</span>
        </Button>
      </PageHeader>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Ofertas Monitoradas"
          value={metrics.monitoredOffersCount}
          subtitle="Catálogo ativo em observação"
          icon={<Activity className="w-5 h-5" />}
        />

        <MetricCard
          title="Anúncios Ativos Totais"
          value={metrics.activeAdsCount.toLocaleString('pt-BR')}
          subtitle="Veiculações simultâneas"
          icon={<TrendingUp className="w-5 h-5 text-cyan-400" />}
          trend={{ value: '+18%', positive: true }}
        />

        <MetricCard
          title="Criativos Únicos Catalogados"
          value={metrics.uniqueCreativesCount.toLocaleString('pt-BR')}
          subtitle="Imagens, vídeos e carrosséis"
          icon={<Layers className="w-5 h-5 text-purple-400" />}
        />

        <MetricCard
          title="Ofertas com Sinal de Escala"
          value={metrics.scalingOffersCount}
          subtitle="Alta persistência observada"
          icon={<Flame className="w-5 h-5 text-amber-400" />}
          className="border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent"
        />
      </div>

      {/* Quick Action Shortcuts Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/ofertas?status=scaling"
          className="flex items-center justify-between p-4 rounded-2xl bg-[#131926] border border-amber-500/30 hover:border-amber-400/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                Ver Ofertas Escalando
              </h4>
              <p className="text-xs text-slate-400">Filtrar apenas as de maior consistência</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
        </Link>

        <Link
          to="/ofertas?status=recent"
          className="flex items-center justify-between p-4 rounded-2xl bg-[#131926] border border-emerald-500/30 hover:border-emerald-400/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                Ofertas Recentes
              </h4>
              <p className="text-xs text-slate-400">Descobertas nos últimos 14 dias</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
        </Link>

        <Link
          to="/pesquisas"
          className="flex items-center justify-between p-4 rounded-2xl bg-[#131926] border border-cyan-500/30 hover:border-cyan-400/60 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                Pesquisas Monitoradas
              </h4>
              <p className="text-xs text-slate-400">Rotinas de mineração automatizadas</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
        </Link>
      </div>

      {/* 30-Day Discovery Trend Chart */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Evolução de Anúncios Descobertos (Últimos 30 Dias)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Volume agregado de veiculações catalogadas no ecossistema Meta Ads
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Última sincronização: {metrics.lastUpdatedAt}
          </span>
        </div>

        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={metrics.dailyDiscoveryData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Area
                type="monotone"
                dataKey="adsCount"
                name="Anúncios Ativos Catalogados"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#dashboardArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fastest Growing Offers (Mais adicionaram anúncios nos últimos 7 dias) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              Ofertas que Mais Adicionaram Anúncios (7 Dias)
            </h3>
            <p className="text-xs text-slate-400">
              Maior expansão de criativos e testes recentes na biblioteca
            </p>
          </div>
          <Link
            to="/ofertas?sortBy=ads_desc"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {metrics.fastestGrowingOffers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-800 bg-[#0f1422]/50 w-full my-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4 shadow-inner">
              <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-bold text-slate-200">Ainda não há ofertas suficientes</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-sm">
              Execute pesquisas monitoradas para popular o catálogo e identificar as ofertas em escala.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {metrics.fastestGrowingOffers.slice(0, 4).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        )}
      </div>


      {/* Distribution by Niche */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 shadow-lg">
        <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-cyan-400" />
          Distribuição por Nicho de Mercado
        </h3>

        {metrics.nicheDistribution.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <PieIcon className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">Nenhum dado de nicho disponível ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.nicheDistribution.map((item) => (
              <div
                key={item.name}
                className="p-3.5 rounded-xl bg-[#0b0f19] border border-slate-800/80 flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{item.name}</span>
                  <span className="font-mono text-cyan-400 font-bold">{item.count} ofertas</span>
                </div>

                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full"
                    style={{ width: `${Math.min(item.percentage * 2, 100)}%` }}
                  />
                </div>

                <span className="text-[10px] text-slate-400 text-right">
                  {item.percentage}% da base observada
                </span>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* New Search Modal */}
      <Dialog
        open={newSearchModalOpen}
        onOpenChange={setNewSearchModalOpen}
        title="Criar Nova Pesquisa Monitorada"
        description="Configure uma consulta para que o sistema monitore novos anúncios na Meta Ads Library automaticamente."
      >
        <form onSubmit={handleCreateSearch} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nome de identificação (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Kits de Dinâmicas Low Ticket"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nicho <span className="text-rose-400">*</span>
            </label>
            <select
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {OFFER_NICHES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Palavra-chave adicional (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: kit dinâmicas, perder barriga, planilha financeira"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">País</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="BR">Brasil (BR)</option>
                <option value="PT">Portugal (PT)</option>
                <option value="US">Estados Unidos (US)</option>
                <option value="ES">Espanha (ES)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Frequência</label>
              <select
                disabled
                className="w-full bg-[#0b0f19] border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
              >
                <option>Diária (Automática)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setNewSearchModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md">
              Salvar e Iniciar Monitoramento
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
