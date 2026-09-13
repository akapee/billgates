import React from 'react';
import { Search } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Investigation() {
  return (
    <PlaceholderPage
      title="Investigation"
      description="Tools investigasi mendalam: timeline klaim, cross-referensi pasien, analisis provider, dan case management."
      icon={<Search size={36} className="text-purple-400" />}
    />
  );
}
