import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { Tooltip } from './ui/tooltip';

interface ScaleScoreProps {
  score: number;
  showBar?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScaleScore({ score, showBar = true, size = 'md' }: ScaleScoreProps) {
  const getLevel = () => {
    if (score >= 90) return { text: 'Escala Muito Alta', color: 'text-amber-400', bar: 'bg-amber-400' };
    if (score >= 75) return { text: 'Escala Consistente', color: 'text-cyan-400', bar: 'bg-cyan-400' };
    if (score >= 50) return { text: 'Em Teste & Validação', color: 'text-emerald-400', bar: 'bg-emerald-400' };
    return { text: 'Sinal Fraco / Inicial', color: 'text-slate-400', bar: 'bg-slate-500' };
  };

  const level = getLevel();

  const explanation = (
    <div className="space-y-1 p-1">
      <p className="font-semibold text-slate-100 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        Índice de Consistência Operacional ({score}/100)
      </p>
      <p className="text-slate-300 text-[11px] leading-relaxed">
        Algoritmo observacional baseado no cruzamento de 3 fatores: longevidade do anúncio ativo mais antigo, quantidade de criativos testados e novos anúncios ativos nos últimos 7 dias. Não é uma métrica de receita nem lucro.
      </p>
    </div>
  );

  return (
    <div className="inline-flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          Sinal de Escala
          <Tooltip content={explanation} side="top">
            <Info className="w-3 h-3 text-slate-500 hover:text-cyan-400 cursor-help transition-colors" />
          </Tooltip>
        </span>
        <span className={`font-bold ${level.color} font-mono`}>{score} / 100</span>
      </div>

      {showBar && (
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${level.bar} transition-all duration-500`}
            style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
