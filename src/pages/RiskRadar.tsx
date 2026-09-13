import React from 'react';
import { ScanLine } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function RiskRadar() {
  return (
    <PlaceholderPage
      title="Radar Risiko Fraud"
      description="Visualisasi radar risiko fraud multidimensi: profil faskes, pola klaim, penilaian risiko, dan peta panas per wilayah."
      icon={<ScanLine size={36} className="text-red-400" />}
    />
  );
}
