import React from 'react';
import { Search } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Investigation() {
  return (
    <PlaceholderPage
      title="Investigasi"
      description="Alat investigasi mendalam: linimasa klaim, referensi silang pasien, analisis penyedia layanan, dan pengelolaan kasus."
      icon={<Search size={36} className="text-purple-400" />}
    />
  );
}
