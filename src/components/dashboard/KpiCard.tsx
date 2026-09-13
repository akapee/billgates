import React from 'react';
import {
  FileText,
  AlertTriangle,
  Copy,
  ClipboardCheck,
  BadgeDollarSign,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { RiskBadge } from '../ui/Badge';
import type { KpiCardData, RiskLevel } from '../../types';

// ─────────────────────────────────────────────
// Icon Map
// ─────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FileText,
  AlertTriangle,
  Copy,
  ClipboardCheck,
  BadgeDollarSign,
};

// ─────────────────────────────────────────────
// KPI Card Component
// ─────────────────────────────────────────────

interface KpiCardProps {
  data: KpiCardData;
  className?: string;
}

export function KpiCard({ data, className }: KpiCardProps) {
  const Icon = iconMap[data.icon] || FileText;
  const isPositiveTrend = data.trend > 0;
  const isNeutralTrend = data.trend === 0;
  const trendIsGood = data.id === 'duplicate-billing' ? !isPositiveTrend : isPositiveTrend;

  return (
    <div
      className={cn(
        'card p-5 hover:shadow-card-hover transition-shadow duration-200 group',
        className
      )}
    >
      {/* Top Row: Icon + Risk Badge */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
          data.bgColor
        )}>
          <Icon size={22} className={cn(data.accentColor)} />
        </div>
        {data.riskLevel && (
          <RiskBadge level={data.riskLevel as RiskLevel} showDot />
        )}
      </div>

      {/* Value */}
      <div className="mb-1">
        <span className="text-2xl font-bold text-slate-900 tracking-tight">
          {data.value}
        </span>
      </div>

      {/* Label */}
      <p className="text-sm text-slate-500 mb-3 leading-tight font-medium">
        {data.label}
      </p>

      {/* Trend */}
      <div className={cn(
        'flex items-center gap-1.5 text-xs font-semibold',
        isNeutralTrend
          ? 'text-slate-500'
          : trendIsGood
            ? 'text-green-600'
            : 'text-red-600'
      )}>
        {!isNeutralTrend && (
          isPositiveTrend
            ? <TrendingUp size={13} className="flex-shrink-0" />
            : <TrendingDown size={13} className="flex-shrink-0" />
        )}
        <span>{data.trendLabel}</span>
      </div>
    </div>
  );
}
