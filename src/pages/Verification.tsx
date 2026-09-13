import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Verification() {
  return (
    <PlaceholderPage
      title="Verification Center"
      description="Pusat verifikasi klaim berrisiko tinggi dengan workflow approval, evidence management, dan audit trail."
      icon={<CheckCircle size={36} className="text-green-400" />}
    />
  );
}
