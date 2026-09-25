import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useMonitoredSearchesQuery,
  useCreateMonitoredSearchMutation,
  useToggleSearchStatusMutation,
  useRunMonitoredSearchMutation,
} from '../hooks/useOffers';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/button';
import { Dialog } from '../components/ui/dialog';
import { MonitoredSearch, CreateSearchInput } from '../types/search';
import { useToast } from '../context/ToastContext';
import {
  Plus,
  Play,
  Pause,
  ExternalLink,
  RefreshCw,
  Search,
  Flame,
  Globe,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';
import { OFFER_NICHES } from '../config/niches';

export function MonitoredSearchesPage() {
  const { data: searches = [], isLoading } = useMonitoredSearchesQuery();
  const createMutation = useCreateMonitoredSearchMutation();
  const toggleMutation = useToggleSearchStatusMutation();
  const runMutation = useRunMonitoredSearchMutation();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('Educação');
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('BR');
  const [frequency, setFrequency] = useState<'daily' | 'twice_daily' | 'weekly'>('daily');
  const [limitResults, setLimitResults] = useState(1000);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    toggleMutation.mutate(id, {
      onSuccess: () => {
        showToast(
          currentStatus === 'active' ? 'Pesquisa Pausada' : 'Pesquisa Reativada',
          'O status do monitoramento foi atualizado com sucesso.',
          'info'
        );
      },
    });
  };

  const handleRunManually = (search: MonitoredSearch) => {
    setRunningId(search.id);
    showToast(
      'Executando Mineração...',
      `Executando os padrões de busca do nicho "${search.niche || search.name}".`,
      'info'
    );

    runMutation.mutate(search.id, {
      onSuccess: (result) => {
        setRunningId(null);
        showToast('Mineração Concluída!', `${result.rawAdsCount} anúncios processados e ${result.offersCount} ofertas identificadas.`, 'success');
      },
      onError: (error) => {
        setRunningId(null);
        showToast('Falha na mineração', error instanceof Error ? error.message : 'Não foi possível concluir a coleta.', 'error');
      },
    });
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    createMutation.mutate(
      {
        name: name.trim() || `Mineração: ${niche.trim()}`,
        keyword: keyword.trim(),
        niche: niche.trim(),
        country,
        frequency,
        limitResults,
        status: 'active',
      },
      {
        onSuccess: () => {
          showToast(
            'Pesquisa Monitorada Criada!',
            `O nicho "${niche}" foi configurado com múltiplos padrões low ticket.`,
            'success'
          );
          setIsModalOpen(false);
          setName('');
          setKeyword('');
        },
      }
    );
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Pesquisas Monitoradas"
        subtitle="Automatize rotinas de rastreamento de palavras-chave na Meta Ads Library para detectar novas ofertas em fase inicial ou de escala."
      >
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova pesquisa monitorada</span>
        </Button>
      </PageHeader>

      {/* Searches List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : searches.length === 0 ? (
          <div className="text-center py-16 bg-[#131926] rounded-2xl border border-slate-800">
            <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200">Nenhuma pesquisa cadastrada</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Crie termos como "kit dinamicas", "guia visual" ou "por apenas 10" para minerar ofertas automaticamente.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Criar primeira pesquisa
            </Button>
          </div>
        ) : (
          searches.map((item) => {
            const metaLibraryUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=${item.country}&q=${encodeURIComponent(item.keyword)}`;

            return (
              <div
                key={item.id}
                className="bg-[#131926] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all"
              >
                {/* Left info */}
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.status === 'active' ? 'ATIVA' : 'PAUSADA'}
                    </span>

                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
                      País: {item.country}
                    </span>

                    <span className="text-xs text-slate-400">
                      Frequência: {item.frequency === 'daily' ? 'Diária' : item.frequency === 'twice_daily' ? '12 em 12 horas' : 'Semanal'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-100">{item.name}</h3>

                  <p className="text-xs font-mono text-cyan-300 bg-[#0a0e17] px-3 py-1.5 rounded-lg border border-slate-800 inline-block">
                    Nicho: <strong>{item.niche || item.name}</strong> · {item.queries?.length || 1} consultas
                  </p>
                </div>

                {/* Metrics in Search */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center bg-[#0a0e17] p-3 rounded-xl border border-slate-800/80 shrink-0">
                  <div className="px-2">
                    <div className="text-[10px] text-slate-400">Anúncios Mapeados</div>
                    <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                      {item.resultsCount}
                    </div>
                  </div>

                  <div className="px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">Ofertas Filtradas</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      {item.identifiedOffersCount}
                    </div>
                  </div>

                  <div className="px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">Última Execução</div>
                    <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                      {formatDateTime(item.lastExecutedAt)}
                    </div>
                  </div>

                  <div className="px-2 border-l border-slate-800">
                    <div className="text-[10px] text-slate-400">Próxima Execução</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatDateTime(item.nextExecutionAt)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {/* Executar manualmente */}
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={runningId === item.id}
                    onClick={() => handleRunManually(item)}
                    className="gap-1.5"
                    title="Forçar execução imediata"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Executar agora</span>
                  </Button>

                  {/* Pausar ou Ativar */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(item.id, item.status)}
                    className="gap-1.5"
                  >
                    {item.status === 'active' ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-amber-400" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Retomar</span>
                      </>
                    )}
                  </Button>

                  {/* Ver ofertas no catálogo interno */}
                  <Link
                    to={`/ofertas?q=${encodeURIComponent(item.keyword)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>Ver ofertas</span>
                  </Link>

                  {/* Abrir na Meta Ads Library */}
                  <a
                    href={metaLibraryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                    title="Abrir pesquisa original na Meta Ads Library"
                    aria-label="Abrir na Meta Ads Library"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Search Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Nova Pesquisa Monitorada"
        description="Defina parâmetros de busca para minerar infoprodutos em tempo real na Meta Ads Library."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Nicho <span className="text-rose-400">*</span>
            </label>
            <select value={niche} onChange={(e) => setNiche(e.target.value)} className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500">
              {OFFER_NICHES.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Nome de identificação
            </label>
            <input
              type="text"
              placeholder="Ex: Apostilas e Resumos de Medicina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Palavra-chave adicional (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: guia visual, kit de dinâmicas, material inclusivo"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              O sistema combinará o nicho, dores e desejos com até 96 consultas de produtos, ofertas, métodos, prazos e sinais low ticket.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1.5">País</label>
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
              <label className="block font-semibold text-slate-300 mb-1.5">Frequência de Varredura</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="twice_daily">A cada 12 horas</option>
                <option value="daily">Diária (recomendado)</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Limite de anúncios por consulta
            </label>
            <select
              value={limitResults}
              onChange={(e) => setLimitResults(Number(e.target.value))}
              className="w-full bg-[#0b0f19] border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={20}>20 por consulta (teste econômico)</option>
              <option value={50}>50 por consulta</option>
              <option value={100}>100 por consulta</option>
              <option value={250}>250 por consulta</option>
              <option value={500}>500 por consulta</option>
              <option value={1000}>1.000 por consulta</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md">
              Criar Rotina
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
