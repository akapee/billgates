import React from 'react';
import { cn } from '../../lib/utils';
import type { RiskLevel, AlertSeverity } from '../../types';

// ─────────────────────────────────────────────
// Risk Badge
// ─────────────────────────────────────────────

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
  showDot?: boolean;
}

const riskConfig: Record<RiskLevel, { label: string; className: string; dotColor: string }> = {
  critical: {
    label: 'KRITIS',
    className: 'bg-red-100 text-red-700 border border-red-200',
    dotColor: 'bg-red-500',
  },
  high: {
    label: 'TINGGI',
    className: 'bg-orange-100 text-orange-700 border border-orange-200',
    dotColor: 'bg-orange-500',
  },
  medium: {
    label: 'SEDANG',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    dotColor: 'bg-yellow-500',
  },
  low: {
    label: 'RENDAH',
    className: 'bg-green-100 text-green-700 border border-green-200',
    dotColor: 'bg-green-500',
  },
};

export function RiskBadge({ level, className, showDot = true }: RiskBadgeProps) {
  const config = riskConfig[level];
  return (
    <span className={cn('risk-badge', config.className, className)}>
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      )}
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Severity Badge (for Alerts)
// ─────────────────────────────────────────────

interface SeverityBadgeProps {
  severity: AlertSeverity;
  className?: string;
}

const severityConfig: Record<AlertSeverity, { emoji: string; label: string; className: string }> = {
  critical: {
    emoji: '🔴',
    label: 'Kritis',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
  high: {
    emoji: '🟠',
    label: 'Tinggi',
    className: 'bg-orange-100 text-orange-700 border border-orange-200',
  },
  medium: {
    emoji: '🟡',
    label: 'Sedang',
    className: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  },
  low: {
    emoji: '🟢',
    label: 'Rendah',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
};

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <span className={cn('risk-badge', config.className, className)}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Demo Mode Badge
// ─────────────────────────────────────────────

interface DemoBadgeProps {
  variant?: 'topbar' | 'banner';
  className?: string;
}

export function DemoBadge({ variant = 'topbar', className }: DemoBadgeProps) {
  if (variant === 'banner') {
    return (
      <div className={cn(
        'flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700',
        className
      )}>
        <span className="text-amber-500">⚠️</span>
        <span>
          <strong>DATA SIMULASI</strong> — Prototipe ini menggunakan data klaim kesehatan simulasi hanya untuk keperluan demonstrasi.
        </span>
      </div>
    );
  }

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide',
      'bg-amber-100 text-amber-700 border border-amber-300',
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
      MODE DEMO
    </span>
  );
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────

type StatusType = 'approved' | 'pending' | 'flagged' | 'rejected' | 'under_review';

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  approved: { label: 'Disetujui', className: 'bg-green-100 text-green-700 border border-green-200' },
  pending: { label: 'Menunggu', className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  flagged: { label: 'Ditandai', className: 'bg-orange-100 text-orange-700 border border-orange-200' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border border-red-200' },
  under_review: { label: 'Dalam Peninjauan', className: 'bg-purple-100 text-purple-700 border border-purple-200' },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('risk-badge', config.className, className)}>
      {config.label}
    </span>
  );
}
