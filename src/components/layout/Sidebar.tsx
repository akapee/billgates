import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard,
  Activity,
  Copy,
  AlertTriangle,
  ScanLine,
  CheckCircle,
  Search,
  BarChart2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ScrollText,
  Brain,
  Download,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────
// Nav Item Config
// ─────────────────────────────────────────────

interface NavItemConfig {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

interface NavSection {
  section: string;
  items: NavItemConfig[];
}

const navSections: NavSection[] = [
  {
    section: 'UTAMA',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { label: 'Monitoring Klaim', icon: Activity, path: '/claims' },
      { label: 'Deteksi Tagihan Ganda', icon: Copy, path: '/duplicate-detection' },
      { label: 'Deteksi Anomali', icon: AlertTriangle, path: '/anomalies' },
      { label: 'Radar Risiko Fraud', icon: ScanLine, path: '/risk-radar' },
      { label: 'Model Belajar', icon: Brain, path: '/learning' },
    ],
  },
  {
    section: 'INVESTIGASI',
    items: [
      { label: 'Pusat Verifikasi', icon: CheckCircle, path: '/verification' },
      { label: 'Investigasi', icon: Search, path: '/investigation' },
    ],
  },
  {
    section: 'ANALITIK',
    items: [
      { label: 'Laporan', icon: BarChart2, path: '/reports' },
      { label: 'Log Audit', icon: ScrollText, path: '/audit-log' },
      { label: 'Pengaturan', icon: Settings, path: '/settings' },
    ],
  },
];

// ─────────────────────────────────────────────
// Nav Item Component
// ─────────────────────────────────────────────

interface NavItemProps {
  item: NavItemConfig;
  collapsed: boolean;
  badge?: number;
  onClick?: () => void;
}

function NavItem({ item, collapsed, badge, onClick }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'sidebar-item group relative',
        isActive ? 'sidebar-item-active' : 'sidebar-item-inactive',
        collapsed && 'justify-center px-2'
      )}
    >
      <Icon size={18} className="flex-shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {badge !== undefined && badge > 0 && (
            <span className={cn(
              'flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
              isActive
                ? 'bg-white text-green-700'
                : 'bg-white/20 text-white'
            )}>
              {badge > 999 ? '999+' : badge}
            </span>
          )}
        </>
      )}
      {collapsed && badge !== undefined && badge > 0 && (
        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-red-400" />
      )}
      {/* Tooltip for collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md
          opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50
          shadow-lg transition-opacity duration-150 border border-slate-700">
          {item.label}
          {badge ? ` (${badge})` : ''}
        </div>
      )}
    </NavLink>
  );
}

// ─────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────

interface BadgeCounts {
  claims: number;
  duplicates: number;
  anomalies: number;
  verification: number;
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  badgeCounts: BadgeCounts;
}

/** Peta path → badge count dinamis */
function getBadge(path: string, counts: BadgeCounts): number | undefined {
  if (path === '/claims') return counts.claims;
  if (path === '/duplicate-detection') return counts.duplicates;
  if (path === '/anomalies') return counts.anomalies;
  if (path === '/verification') return counts.verification;
  return undefined;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose, badgeCounts }: SidebarProps) {
  const { canDecide, canInvestigate, canViewReports, canManageSystem, logout } = useAuth();
  const navigate = useNavigate();
  
  const visibleSections = navSections.map((sec) => ({
    ...sec,
    items: sec.items.filter((i) => {
      if (i.path === '/duplicate-detection' || i.path === '/anomalies' || i.path === '/verification' || i.path === '/claims') return canDecide;
      if (i.path === '/risk-radar' || i.path === '/investigation') return canInvestigate;
      if (i.path === '/reports') return canViewReports;
      if (i.path === '/audit-log' || i.path === '/learning' || i.path === '/settings') return canManageSystem;
      return true; // Dashboard is visible to all
    })
  })).filter(sec => sec.items.length > 0);

  const doLogout = async () => { onMobileClose(); await logout(); navigate('/login', { replace: true }); };
  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'gradient-bpjs shadow-sidebar',
          'transition-all duration-300 ease-in-out',
          // Desktop
          'lg:translate-x-0',
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile
          'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo Area */}
        <div className={cn(
          'flex items-center border-b border-white/10 flex-shrink-0',
          collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4'
        )}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Brand Logo */}
            <div className="relative flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}images/logo.png`}
                alt="Logo BILL GATES"
                className="w-9 h-9 rounded-xl object-contain bg-white shadow-sm"
              />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#0f1a3e] animate-pulse" />
            </div>

            {/* Branding Text */}
            {!collapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-white font-black text-base tracking-wide leading-none">
                    BILL
                  </h1>
                  <span className="text-green-200 font-black text-base tracking-wide leading-none">
                    GATES
                  </span>
                </div>
                <p className="text-white/70 text-[10px] leading-tight mt-1 font-medium">
                  Billing Ganda & Anomali
                  <br />
                  TerEliminasi Sistem
                </p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden flex-shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto sidebar-scroll py-4 px-2 space-y-1">
          {visibleSections.map((section) => (
            <div key={section.section} className="mb-2">
              {!collapsed && (
                <p className="px-3 py-1 text-[10px] font-bold tracking-widest text-white/70 uppercase mb-1">
                  {section.section}
                </p>
              )}
              {collapsed && (
                <div className="mx-3 border-t border-white/10 mb-2 mt-1" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    collapsed={collapsed}
                    badge={getBadge(item.path, badgeCounts)}
                    onClick={onMobileClose}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
            <a
              href={`${import.meta.env.BASE_URL}buku_panduan_pengguna.pdf`}
              download
              title={collapsed ? 'Unduh Panduan' : undefined}
              className={cn(
                'sidebar-item group relative w-full text-blue-100 hover:bg-blue-500/20 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <Download size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">Unduh Panduan</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-150 border border-slate-700">
                  Unduh Panduan
                </div>
              )}
            </a>
            
            <button
              type="button"
              onClick={doLogout}
              title={collapsed ? 'Keluar' : undefined}
              className={cn(
                'sidebar-item group relative w-full text-red-100 hover:bg-red-500/20 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!collapsed && <span className="flex-1">Keluar</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-150 border border-slate-700">
                  Keluar
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* System Status */}
        {!collapsed && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className="text-xs text-white/90 font-medium truncate">Sistem Aktif</span>
              </div>
              <span className="text-[10px] text-white/60 flex-shrink-0">v1.0-beta</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle (Desktop only) */}
        <button
          onClick={onToggleCollapse}
          className={cn(
            'hidden lg:flex absolute -right-3 top-20',
            'w-6 h-6 rounded-full bg-slate-700 border border-slate-600',
            'items-center justify-center text-slate-300',
            'hover:bg-slate-600 hover:text-white',
            'transition-all duration-200 shadow-md z-10',
            'focus:outline-none focus:ring-2 focus:ring-green-500/50'
          )}
          aria-label={collapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={12} />
          ) : (
            <ChevronLeft size={12} />
          )}
        </button>
      </aside>
    </>
  );
}
