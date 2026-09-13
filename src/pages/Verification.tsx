import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Verification() {
  return (
    <PlaceholderPage
      title="Pusat Verifikasi"
      description="Pusat verifikasi klaim berisiko tinggi dengan alur persetujuan, pengelolaan bukti, dan jejak audit."
      icon={<CheckCircle size={36} className="text-green-400" />}
    />
  );
}
