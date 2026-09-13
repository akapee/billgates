import React from 'react';
import { Copy } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function DuplicateDetection() {
  return (
    <PlaceholderPage
      title="Duplicate Detection"
      description="Deteksi otomatis klaim duplikat menggunakan algoritma similarity matching dan pattern recognition berbasis AI."
      icon={<Copy size={36} className="text-blue-400" />}
    />
  );
}
