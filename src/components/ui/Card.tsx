import React from 'react';
import { cn } from '../../lib/utils';

// ─────────────────────────────────────────────
// Card Component
// ─────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  hoverable = false,
  padding = 'md',
  onClick,
}: CardProps) {
  return (
    <div
      className={cn(
        'card',
        paddingStyles[padding],
        hoverable && 'transition-shadow duration-200 hover:shadow-card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Card Header
// ─────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-5', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Section Card (Card with Header)
// ─────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className={contentClassName}>{children}</div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Stat Card (for KPI-like displays inside sections)
// ─────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  className?: string;
}

export function StatCard({ label, value, color = 'text-slate-900', className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn('text-2xl font-bold', color)}>{value}</span>
    </div>
  );
}
