import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  User,
  CheckCircle,
  AlertCircle,
  Info,
  X,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
} from 'lucide-react';
import { cn, formatRelativeTime } from '../../lib/utils';
import { DemoBadge } from '../ui/Badge';
import { useAuth, type Role } from '../../auth/AuthContext';
import { notifications } from '../../data/alerts';
import type { AlertSeverity } from '../../types';

// ─────────────────────────────────────────────
// Breadcrumb
// ─────────────────────────────────────────────

const routeLabels: Record<string, { parent: string; current: string }> = {
  '/dashboard': { parent: 'Dashboard', current: 'Pusat Kendali' },
  '/claims': { parent: 'Monitoring', current: 'Monitoring Klaim' },
  '/duplicate-detection': { parent: 'Deteksi', current: 'Deteksi Tagihan Ganda' },
  '/anomalies': { parent: 'Deteksi', current: 'Deteksi Anomali' },
  '/risk-radar': { parent: 'Deteksi', current: 'Radar Risiko Fraud' },
  '/verification': { parent: 'Investigasi', current: 'Pusat Verifikasi' },
  '/investigation': { parent: 'Investigasi', current: 'Investigasi' },
  '/reports': { parent: 'Analitik', current: 'Laporan' },
  '/learning': { parent: 'Deteksi', current: 'Model Belajar' },
  '/audit-log': { parent: 'Analitik', current: 'Log Audit' },
  '/settings': { parent: 'Sistem', current: 'Pengaturan' },
};

// ─────────────────────────────────────────────
// Role Config
// ─────────────────────────────────────────────

const roleConfig: { value: Role; label: string; description: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bgColor: string }[] = [
  { value: 'verifikator', label: 'Verifikator', description: 'Verifikasi & keputusan klaim', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  { value: 'auditor', label: 'Auditor', description: 'Investigasi & audit fraud', icon: ShieldCheck, color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  { value: 'supervisor', label: 'Supervisor', description: 'Laporan & pemantauan kinerja', icon: ShieldAlert, color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  { value: 'superadmin', label: 'Super Admin', description: 'Akses penuh seluruh sistem', icon: Crown, color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
];

// ─────────────────────────────────────────────
// Notification Dropdown
// ─────────────────────────────────────────────

const severityIcons: Record<AlertSeverity, React.ComponentType<{ size?: number; className?: string }>> = {
  critical: AlertCircle,
  high: AlertCircle,
  medium: Info,
  low: CheckCircle,
};

const severityColors: Record<AlertSeverity, string> = {
  critical: 'text-red-500',
  high: 'text-orange-500',
  medium: 'text-yellow-500',
  low: 'text-green-500',
};

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-900 text-sm">Notifikasi</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {unreadCount} baru
            </span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-50 max-h-[320px] overflow-y-auto">
        {notifications.map((notif) => {
          const Icon = severityIcons[notif.severity];
          return (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer',
                !notif.read && 'bg-blue-50/40'
              )}
            >
              <Icon size={16} className={cn('flex-shrink-0 mt-0.5', severityColors[notif.severity])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{notif.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                <p className="text-[11px] text-slate-400 mt-1">{formatRelativeTime(notif.timestamp)}</p>
              </div>
              {!notif.read && (
                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <button className="w-full text-center text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Lihat semua notifikasi
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Topbar Component
// ─────────────────────────────────────────────

interface TopbarProps {
  onMobileMenuOpen: () => void;
}

export function Topbar({ onMobileMenuOpen }: TopbarProps) {
  const location = useLocation();
  const { role, setMockRole } = useAuth();
  const currentRoleConfig = roleConfig.find(r => r.value === role) || roleConfig[3];
  const RoleIcon = currentRoleConfig.icon;
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  const breadcrumb = routeLabels[location.pathname] || { parent: 'Dashboard', current: 'Pusat Kendali' };
  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) setRoleOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-white border-b border-slate-200 shadow-sm gap-4">
      {/* Mobile Menu Toggle */}
      <button
        onClick={onMobileMenuOpen}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-slate-400 font-medium hidden sm:block">{breadcrumb.parent}</span>
        <span className="text-slate-300 hidden sm:block">/</span>
        <span className="text-slate-800 font-semibold truncate">{breadcrumb.current}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Demo Badge */}
      <DemoBadge variant="topbar" className="hidden sm:inline-flex flex-shrink-0" />

      {/* Search */}
      <div className={cn(
        'relative flex items-center transition-all duration-200',
        'hidden md:flex',
        searchFocused ? 'w-64' : 'w-48'
      )}>
        <Search size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Cari klaim..."
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={cn(
            'w-full pl-9 pr-4 py-2 text-sm rounded-lg border transition-all duration-200',
            'placeholder:text-slate-400 text-slate-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/30',
            searchFocused
              ? 'border-blue-300 bg-white shadow-sm'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          )}
        />
      </div>

      {/* Notification Bell */}
      <div className="relative flex-shrink-0" ref={notifRef}>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className={cn(
            'relative p-2 rounded-lg transition-all duration-200',
            'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
            notifOpen && 'bg-slate-100 text-slate-700'
          )}
          aria-label="Notifikasi"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
        <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
      </div>

      {/* Role Switcher */}
      <div className="relative flex-shrink-0" ref={roleRef}>
        <button
          onClick={() => setRoleOpen(!roleOpen)}
          className={cn(
            'flex items-center gap-2.5 pl-3 pr-2 py-1.5 border-l border-slate-200 transition-colors',
            'hover:bg-slate-50 rounded-r-lg',
            roleOpen && 'bg-slate-50'
          )}
        >
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', currentRoleConfig.bgColor, 'border')}>
            <RoleIcon size={15} className={currentRoleConfig.color} />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-slate-900 leading-none">{currentRoleConfig.label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-none">{currentRoleConfig.description}</p>
          </div>
          <ChevronDown size={14} className={cn('hidden sm:block text-slate-400 transition-transform', roleOpen && 'rotate-180')} />
        </button>

        {/* Role Dropdown */}
        {roleOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Ganti Peran Akses</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Pilih peran untuk melihat tampilan & akses menu yang berbeda.</p>
            </div>
            <div className="p-2">
              {roleConfig.map((rc) => {
                const Icon = rc.icon;
                const isActive = role === rc.value;
                return (
                  <button
                    key={rc.value}
                    onClick={() => { setMockRole(rc.value); setRoleOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all',
                      isActive ? cn(rc.bgColor, 'border') : 'hover:bg-slate-50 border border-transparent'
                    )}
                  >
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? 'bg-white shadow-sm' : 'bg-slate-100')}>
                      <Icon size={18} className={isActive ? rc.color : 'text-slate-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-semibold', isActive ? 'text-slate-900' : 'text-slate-700')}>{rc.label}</p>
                      <p className="text-[11px] text-slate-500">{rc.description}</p>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

