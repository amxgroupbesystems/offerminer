import React from 'react';
import { Offer } from '../../types/offer';
import { PlatformBadges } from '../../components/PlatformBadges';
import { Timeline } from '../../components/Timeline';
import { CheckCircle2, AlertTriangle, Shield, Globe, Tag, Sparkles } from 'lucide-react';

interface OverviewTabProps {
  offer: Offer;
}

export function OverviewTab({ offer }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Notice about observational data */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-cyan-300 text-xs leading-relaxed">
        <Shield className="w-5 h-5 shrink-0 mt-0.5 text-cyan-400" />
        <div>
          <strong className="font-semibold block mb-0.5 text-cyan-200">
            Aviso de Transparência Observacional:
          </strong>
          Os dados apresentados são exclusivamente agregados a partir de anúncios publicamente visíveis na Meta Ads Library. Não temos acesso a dados privados de faturamento, vendas na plataforma de pagamento ou taxa de conversão do infoproduto. Sinais de escala representam volume e persistência de anúncios ativos.
        </div>
      </div>

      {/* Offer Summary & Key Promises */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Resumo Operacional da Oferta
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">
              {offer.summary}
            </p>
          </div>

          {/* Promises found */}
          {offer.keyPromises && offer.keyPromises.length > 0 && (
            <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Principais Promessas Identificadas nos Criativos
              </h3>
              <div className="space-y-2">
                {offer.keyPromises.map((promise, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{promise}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scale Evidences */}
          {offer.scaleEvidences && offer.scaleEvidences.length > 0 && (
            <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Evidências do Status ({offer.status.toUpperCase()})
              </h3>
              <div className="space-y-2">
                {offer.scaleEvidences.map((evidence, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    <span>{evidence}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar info: Keywords, Related Advertiser Pages, Platforms */}
        <div className="space-y-6">
          {/* Advertiser pages */}
          <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Páginas Anunciantes Vinculadas
            </h3>
            <div className="space-y-2.5">
              {offer.advertiserPages.map((page) => (
                <div key={page.id} className="p-3 rounded-xl bg-[#0e1420] border border-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">{page.name}</p>
                    {page.verified && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded font-bold">
                        Verificada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                    <span>{page.category || 'Página do Facebook'}</span>
                    <span>{page.adsCount} anúncios</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Palavras-chave Detectadas
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {offer.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 border border-slate-700/60 font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Plataformas Observadas
            </h3>
            <PlatformBadges platforms={offer.platforms} size="md" />
          </div>
        </div>
      </div>

      {/* Summary Timeline */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Linha do Tempo Resumida
        </h3>
        <Timeline events={offer.timeline} />
      </div>
    </div>
  );
}
