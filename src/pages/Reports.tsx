import React from 'react';
import { BarChart2 } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Reports() {
  return (
    <PlaceholderPage
      title="Reports"
      description="Generate laporan komprehensif: fraud summary, risk trend, provider performance, dan rekomendasi tindakan."
      icon={<BarChart2 size={36} className="text-blue-400" />}
    />
  );
}
