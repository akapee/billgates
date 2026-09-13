import React from 'react';
import { DemoBadge } from '../ui/Badge';

// ─────────────────────────────────────────────
// Page Header Component
// ─────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showDemoBanner?: boolean;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  showDemoBanner = false,
  action,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-1.5 text-sm text-slate-500 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Demo Banner */}
      {showDemoBanner && (
        <div className="mt-4">
          <DemoBadge variant="banner" />
        </div>
      )}
    </div>
  );
}
