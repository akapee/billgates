import React from 'react';
import { Copy } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function DuplicateDetection() {
  return (
    <PlaceholderPage
      title="Deteksi Tagihan Ganda"
      description="Deteksi otomatis klaim duplikat menggunakan algoritma pencocokan kemiripan dan pengenalan pola berbasis AI."
      icon={<Copy size={36} className="text-blue-400" />}
    />
  );
}
