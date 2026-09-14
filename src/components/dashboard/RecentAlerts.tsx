import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { recentAlerts } from '../../data/alerts';
import { cn, formatRelativeTime } from '../../lib/utils';
import { Button } from '../ui/Button';
import type { AlertData, AlertSeverity } from '../../types';
import { useFirestore } from '../../hooks/useFirestore';

// ─────────────────────────────────────────────
// Severity Config
// ─────────────────────────────────────────────

const severityConfig: Record<AlertSeverity, {
  emoji: string;
  borderColor: string;
  bgColor: string;
  iconColor: string;
  badgeClass: string;
  label: string;
}> = {
  critical: {
    emoji: '🔴',
    borderColor: 'border-l-red-500',
    bgColor: 'hover:bg-red-50/50',
    iconColor: 'text-red-500',
    badgeClass: 'bg-red-100 text-red-700',
    label: 'Kritis',
  },
  high: {
    emoji: '🟠',
    borderColor: 'border-l-orange-500',
    bgColor: 'hover:bg-orange-50/50',
    iconColor: 'text-orange-500',
    badgeClass: 'bg-orange-100 text-orange-700',
    label: 'Tinggi',
  },
  medium: {
    emoji: '🟡',
    borderColor: 'border-l-yellow-500',
    bgColor: 'hover:bg-yellow-50/50',
    iconColor: 'text-yellow-500',
    badgeClass: 'bg-yellow-100 text-yellow-700',
    label: 'Sedang',
  },
  low: {
    emoji: '🟢',
    borderColor: 'border-l-green-500',
    bgColor: 'hover:bg-green-50/50',
    iconColor: 'text-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    label: 'Rendah',
  },
};

// ─────────────────────────────────────────────
// Alert Card
// ─────────────────────────────────────────────

interface AlertCardProps {
  alert: AlertData;
}

function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return new Date(value as string | number);
}

function AlertCard({ alert }: AlertCardProps) {
  const config = severityConfig[alert.severity];

  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-lg border border-slate-100',
      'border-l-4 transition-colors duration-150 cursor-pointer',
      config.borderColor,
      config.bgColor
    )}>
      {/* Emoji Indicator */}
      <span className="text-xl flex-shrink-0 mt-0.5" role="img" aria-label={config.label}>
        {config.emoji}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-slate-900 leading-tight">
            {alert.title}
          </p>
          <span className={cn(
            'flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full',
            config.badgeClass
          )}>
            {config.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">
            {alert.claimId}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            {alert.metric.label}: <span className="text-blue-700">{alert.metric.value}</span>
          </span>
        </div>

        {alert.description && (
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
            {alert.description}
          </p>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0 mt-0.5">
        <Clock size={11} />
        <span>{formatRelativeTime(asDate(alert.timestamp))}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Recent Alerts Component
// ─────────────────────────────────────────────

export function RecentAlerts() {
  const navigate = useNavigate();
  const { data: recentAlerts, loading } = useFirestore<AlertData>('alerts');

  if (loading) {
    return (
      <div className="card p-6 flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Sort by timestamp descending
  const sortedAlerts = [...recentAlerts].sort((a, b) => {
    const timeA = asDate(a.timestamp).getTime();
    const timeB = asDate(b.timestamp).getTime();
    return timeB - timeA;
  });

  const displayAlerts = sortedAlerts.slice(0, 5);
  const criticalCount = sortedAlerts.filter(a => a.severity === 'critical').length;

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">Peringatan Terbaru</h3>
            {criticalCount > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {criticalCount} kritis
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {sortedAlerts.length} peringatan dalam 24 jam terakhir
          </p>
        </div>
        <Button
          variant="ghost"
          size="xs"
          icon={<ArrowRight size={13} />}
          iconPosition="right"
          onClick={() => navigate('/anomalies')}
        >
          Lihat Semua
        </Button>
      </div>

      {/* Alert List */}
      <div className="space-y-2">
        {displayAlerts.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">Tidak ada peringatan.</p>
        ) : (
          displayAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))
        )}
      </div>

      {/* View All Button */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          icon={<ArrowRight size={15} />}
          iconPosition="right"
          onClick={() => navigate('/anomalies')}
        >
          Lihat Semua Peringatan
        </Button>
      </div>
    </div>
  );
}
