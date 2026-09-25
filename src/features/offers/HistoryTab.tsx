import React from 'react';
import { Offer } from '../../types/offer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { Timeline } from '../../components/Timeline';
import { Activity, Layers } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface HistoryTabProps {
  offer: Offer;
}

export function HistoryTab({ offer }: HistoryTabProps) {
  // Format history for charts
  const chartData = offer.history.map((h) => ({
    date: formatDate(h.date),
    anuncios: h.activeAds,
    criativos: h.uniqueCreatives,
  }));

  return (
    <div className="space-y-8">
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Ads Chart */}
        <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Volume de Anúncios Ativos
            </h3>
            <span className="text-xs text-slate-400">Últimas semanas</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="adsColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
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
                  dataKey="anuncios"
                  name="Anúncios Ativos"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#adsColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Unique Creatives Chart */}
        <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Criativos Únicos Testados
            </h3>
            <span className="text-xs text-slate-400">Evolução do inventário</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#c084fc' }}
                />
                <Bar
                  dataKey="criativos"
                  name="Criativos Únicos"
                  fill="#a855f7"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-[#131926] border border-slate-800/90 rounded-2xl p-6 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Registro Completo de Eventos & Mudanças
        </h3>
        <Timeline events={offer.timeline} />
      </div>
    </div>
  );
}
