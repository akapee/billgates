import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { anomalyBreakdown } from '../../data/dashboard';
import type { AnomalyBreakdownData } from '../../types';

// ─────────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const item = payload[0].payload as AnomalyBreakdownData;
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-900 mb-1">{item.label}</p>
        <p className="text-slate-600">{item.count} cases detected</p>
        <p className="text-slate-400 mt-0.5">{item.percentage}% of total anomalies</p>
      </div>
    );
  }
  return null;
}

// ─────────────────────────────────────────────
// Custom X-Axis Tick (shortened labels)
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomXAxisTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const shortLabels: Record<string, string> = {
    'Duplicate Billing': 'Dup. Billing',
    'Repeat Billing': 'Rep. Billing',
    'Cost Anomaly': 'Cost',
    'Upcoding': 'Upcoding',
    'Diagnosis Anomaly': 'Diagnosis',
    'Procedure Anomaly': 'Procedure',
    'Unbundling': 'Unbundling',
    'Other': 'Other',
  };

  if (!payload) return null;

  return (
    <g transform={`translate(${x ?? 0},${y ?? 0})`}>
      <text
        x={0}
        y={0}
        dy={12}
        textAnchor="middle"
        fill="#94a3b8"
        fontSize={10}
      >
        {shortLabels[payload.value] || payload.value}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────
// Anomaly Breakdown Component
// ─────────────────────────────────────────────

export function AnomalyBreakdown() {
  const total = anomalyBreakdown.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Detected Anomalies</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} anomalies detected across {anomalyBreakdown.length} categories
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg border border-red-100">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-xs font-semibold text-red-600">{total} Total</span>
        </div>
      </div>

      {/* Bar Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={anomalyBreakdown}
          margin={{ top: 5, right: 5, left: -25, bottom: 20 }}
          barSize={28}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={<CustomXAxisTick />}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Count">
            {anomalyBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend Pills */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
        {anomalyBreakdown.slice(0, 4).map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-500">{item.label}</span>
            <span className="text-xs font-bold text-slate-700">({item.count})</span>
          </div>
        ))}
        <span className="text-xs text-slate-400">+{anomalyBreakdown.length - 4} more</span>
      </div>
    </div>
  );
}
