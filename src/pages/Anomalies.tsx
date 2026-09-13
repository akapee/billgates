import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Anomalies() {
  return (
    <PlaceholderPage
      title="Deteksi Anomali"
      description="Identifikasi anomali klaim secara komprehensif: upcoding, unbundling, anomali biaya, dan pola tidak wajar lainnya."
      icon={<AlertTriangle size={36} className="text-orange-400" />}
    />
  );
}
