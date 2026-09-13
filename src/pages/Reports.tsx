import React from 'react';
import { BarChart2 } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Reports() {
  return (
    <PlaceholderPage
      title="Laporan"
      description="Buat laporan komprehensif: ringkasan fraud, tren risiko, kinerja penyedia layanan, dan rekomendasi tindakan."
      icon={<BarChart2 size={36} className="text-blue-400" />}
    />
  );
}
