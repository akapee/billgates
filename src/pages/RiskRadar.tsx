import React from 'react';
import { ScanLine } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function RiskRadar() {
  return (
    <PlaceholderPage
      title="Fraud Risk Radar"
      description="Visualisasi radar risiko fraud multi-dimensi: profil faskes, pola klaim, risk scoring, dan heat map per wilayah."
      icon={<ScanLine size={36} className="text-red-400" />}
    />
  );
}
