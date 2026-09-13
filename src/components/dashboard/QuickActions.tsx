import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Copy,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import { quickActions } from '../../data/dashboard';
import { cn } from '../../lib/utils';
import type { QuickActionData } from '../../types';

// ─────────────────────────────────────────────
// Icon Map
// ─────────────────────────────────────────────

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  AlertTriangle,
  Copy,
  CheckCircle,
  BarChart2,
};

// ─────────────────────────────────────────────
// Variant Config
// ─────────────────────────────────────────────

const variantConfig = {
  primary: {
    bg: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-white',
    iconBg: 'bg-blue-500/30',
    border: 'border-blue-500',
  },
  secondary: {
    bg: 'bg-slate-100',
    hover: 'hover:bg-slate-200',
    text: 'text-slate-700',
    iconBg: 'bg-slate-200',
    border: 'border-slate-200',
  },
  danger: {
    bg: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-white',
    iconBg: 'bg-red-500/30',
    border: 'border-red-500',
  },
  warning: {
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    text: 'text-white',
    iconBg: 'bg-orange-400/30',
    border: 'border-orange-400',
  },
};

// ─────────────────────────────────────────────
// Quick Action Button
// ─────────────────────────────────────────────

interface QuickActionButtonProps {
  action: QuickActionData;
  onNavigate: (route: string) => void;
}

function QuickActionButton({ action, onNavigate }: QuickActionButtonProps) {
  const Icon = iconMap[action.icon] || AlertTriangle;
  const config = variantConfig[action.variant];

  return (
    <button
      onClick={() => onNavigate(action.route)}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-xl',
        'border transition-all duration-200 text-left',
        'hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0',
        config.bg,
        config.hover,
        config.text,
        config.border
      )}
    >
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.iconBg)}>
        <Icon size={18} />
      </div>
      <span className="text-sm font-semibold">{action.label}</span>
    </button>
  );
}

// ─────────────────────────────────────────────
// Quick Actions Component
// ─────────────────────────────────────────────

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="card p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Aksi Cepat</h3>
        <p className="text-sm text-slate-500 mt-0.5">Pintasan ke fitur utama</p>
      </div>
      <div className="grid grid-cols-1 gap-2.5">
        {quickActions.map((action) => (
          <QuickActionButton
            key={action.id}
            action={action}
            onNavigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}
