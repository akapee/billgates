import React from 'react';
import { Activity } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Claims() {
  return (
    <PlaceholderPage
      title="Monitoring Klaim"
      description="Pantau seluruh klaim JKN secara real-time dengan filter dan analisis mendalam per faskes, diagnosa, dan region."
      icon={<Activity size={36} className="text-blue-400" />}
    />
  );
}
