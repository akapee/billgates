import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { PlaceholderPage } from './PlaceholderPage';

export function Settings() {
  return (
    <PlaceholderPage
      title="Settings"
      description="Konfigurasi sistem BILL GATES: threshold deteksi, notifikasi, user management, dan integrasi sistem."
      icon={<SettingsIcon size={36} className="text-slate-400" />}
    />
  );
}
