import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { riskDistribution } from '../../data/dashboard';
import { cn } from '../../lib/utils';
import type { RiskDistributionData } from '../../types';

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload as RiskDistributionData;
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-900">{item.category}</p>
        <p className="text-slate-600 mt-0.5">
          {item.count.toLocaleString('id-ID')} klaim
        </p>
        <p className="text-slate-500">{item.percentage}%</p>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// Risk Legend Item
// ─────────────────────────────────────────────

interface RiskLegendItemProps {
  item: RiskDistributionData;
}

function RiskLegendItem({ item }: RiskLegendItemProps) {
  const levelLabels = {
    low: 'Risiko Rendah',
    medium: 'Risiko Sedang',
    high: 'Risiko Tinggi',
    critical: 'Risiko Kritis',
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-sm flex-shrink-0"
          style={{ backgroundColor: item.color }}
        />
        <div>
          <p className="text-sm font-medium text-slate-700">{levelLabels[item.level]}</p>
          <p className="text-xs text-slate-400">{item.percentage}% dari total</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-slate-900">
          {item.count.toLocaleString('id-ID')}
        </p>
        <p className="text-xs text-slate-400">klaim</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Risk Overview Component
// ─────────────────────────────────────────────

export function RiskOverview() {
  const total = riskDistribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-slate-900">Ringkasan Risiko Klaim</h3>
        <p className="text-sm text-slate-500 mt-0.5">Distribusi risiko dari total {total.toLocaleString('id-ID')} klaim</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0 w-full lg:w-auto">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={2}
                dataKey="count"
                strokeWidth={0}
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fillColor} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-900">
              {total.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-slate-500 font-medium">Total Klaim</span>
          </div>
        </div>

        {/* Risk Distribution Legend */}
        <div className="flex-1 w-full lg:w-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Distribusi Risiko</p>
          </div>
          <div>
            {riskDistribution.map((item) => (
              <RiskLegendItem key={item.level} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
