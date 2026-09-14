import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useClaims } from '../../hooks/useClaims';
import { cn } from '../../lib/utils';
import type { ChartFilter } from '../../types';

// ─────────────────────────────────────────────
// Filter Buttons
// ─────────────────────────────────────────────

const FILTERS: { key: ChartFilter; label: string }[] = [
  { key: '7d', label: '7 Hari' },
  { key: '30d', label: '30 Hari' },
  { key: '90d', label: '90 Hari' },
];

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// Claim Trend Component
// ─────────────────────────────────────────────

export function ClaimTrend() {
  const [activeFilter, setActiveFilter] = useState<ChartFilter>('30d');
  const { claims } = useClaims();
  const days = activeFilter === '7d' ? 7 : activeFilter === '30d' ? 30 : 90;
  const data = React.useMemo(() => {
    const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - days + 1);
    return Array.from({ length: days }, (_, index) => {
      const date = new Date(start); date.setDate(start.getDate() + index);
      const sameDay = claims.filter(claim => claim.date.toDateString() === date.toDateString());
      return { date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), totalClaims: sameDay.length, flaggedClaims: sameDay.filter(claim => claim.riskScore >= 60).length, criticalClaims: sameDay.filter(claim => claim.riskScore >= 80).length };
    });
  }, [claims, days]);

  // For 90d, sample every 3rd point to avoid overcrowding
  const displayData = activeFilter === '90d'
    ? data.filter((_, i) => i % 3 === 0)
    : activeFilter === '30d'
      ? data.filter((_, i) => i % 2 === 0)
      : data;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Tren Risiko Klaim</h3>
          <p className="text-sm text-slate-500 mt-0.5">Tren volume klaim dan deteksi risiko</p>
        </div>
        {/* Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200',
                activeFilter === f.key
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={displayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
            interval={activeFilter === '7d' ? 0 : 'preserveStartEnd'}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey="totalClaims"
            name="Total Klaim"
            stroke="#3b82f6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#3b82f6', strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="flaggedClaims"
            name="Klaim Ditandai"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#f97316', strokeWidth: 0 }}
            strokeDasharray="5 3"
          />
          <Line
            type="monotone"
            dataKey="criticalClaims"
            name="Klaim Kritis"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5, fill: '#ef4444', strokeWidth: 0 }}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
