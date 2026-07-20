'use client';

import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

export type StatCardProps = {
  label: string;
  value?: string;
  trend?: string;
  icon: LucideIcon;
  color: string;
  splitValue?: { content: number; keywords: number };
};

/**
 * Compact number label using k (thousand), L (lakh, 1,00,000) and
 * M (million) so large counts stay short enough to fit inside a card
 * instead of being clipped. e.g. 100997 -> "1.01L", 24500 -> "24.5k".
 */
function formatCompactNumber(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);

  const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');

  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}${n >= 100 ? Math.round(n) : trim(n)}M`;
  }
  if (abs >= 100_000) {
    const n = abs / 100_000;
    return `${sign}${n >= 100 ? Math.round(n) : trim(n)}L`;
  }
  if (abs >= 1_000) {
    const n = abs / 1_000;
    return `${sign}${n >= 100 ? Math.round(n) : trim(n)}k`;
  }
  return `${sign}${abs}`;
}

export function StatCard({ label, value, trend, icon: Icon, color, splitValue }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className={cn('rounded-xl p-2.5', color)}>
          <Icon size={20} className="text-white" />
        </div>
        {trend && (
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="truncate text-sm font-medium text-slate-500">{label}</p>
        {splitValue ? (
          <div className="mt-1.5 space-y-2">
            <div>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">Content</p>
              <h3
                className="truncate text-lg font-bold leading-tight tabular-nums text-slate-900"
                title={splitValue.content.toLocaleString()}
              >
                {formatCompactNumber(splitValue.content)}
              </h3>
            </div>
            <div>
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">Keywords</p>
              <h3
                className="truncate text-lg font-bold leading-tight tabular-nums text-slate-900"
                title={splitValue.keywords.toLocaleString()}
              >
                {formatCompactNumber(splitValue.keywords)}
              </h3>
            </div>
          </div>
        ) : (
          <h3 className="truncate text-2xl font-bold tabular-nums text-slate-900">{value}</h3>
        )}
      </div>
    </motion.div>
  );
}
