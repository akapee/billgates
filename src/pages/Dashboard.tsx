import React from 'react';
import { PageHeader } from '../components/shared/PageHeader';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RiskOverview } from '../components/dashboard/RiskOverview';
import { ClaimTrend } from '../components/dashboard/ClaimTrend';
import { AnomalyBreakdown } from '../components/dashboard/AnomalyBreakdown';
import { RecentAlerts } from '../components/dashboard/RecentAlerts';
import { QuickActions } from '../components/dashboard/QuickActions';
import { kpiCards } from '../data/dashboard';

// ─────────────────────────────────────────────
// Dashboard Page
// ─────────────────────────────────────────────

export function Dashboard() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Command Center"
        subtitle="Monitoring dan deteksi dini potensi anomali klaim JKN — Sistem BILL GATES aktif memindai seluruh klaim masuk secara real-time."
        showDemoBanner
      />

      {/* KPI Cards — 5 columns responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {kpiCards.map((card) => (
          <KpiCard key={card.id} data={card} />
        ))}
      </div>

      {/* Row 2: Risk Overview + Claim Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Risk Overview — 2/5 width */}
        <div className="lg:col-span-2">
          <RiskOverview />
        </div>
        {/* Claim Trend — 3/5 width */}
        <div className="lg:col-span-3">
          <ClaimTrend />
        </div>
      </div>

      {/* Row 3: Anomaly Breakdown + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Anomaly Breakdown — 2/3 width */}
        <div className="lg:col-span-2">
          <AnomalyBreakdown />
        </div>
        {/* Quick Actions — 1/3 width */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>

      {/* Row 4: Recent Alerts — full width */}
      <div>
        <RecentAlerts />
      </div>
    </div>
  );
}
