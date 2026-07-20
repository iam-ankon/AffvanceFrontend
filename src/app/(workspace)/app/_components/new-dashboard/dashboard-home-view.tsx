'use client';

import { cn } from '@/lib/utils';
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Eye,
  MoreVertical,
  TrendingUp,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import { useDashboardOverview } from '@/lib/hooks/use-dashboard-overview';

import { StatCard } from './stat-card';

const TYPE_COLORS: Record<string, string> = {
  Quick: '#8b5cf6',
  'Co-pilot': '#ec4899',
  Bulk: '#06b6d4',
  Other: '#94a3b8'
};

const ACTION_ICONS = {
  warning: AlertCircle,
  info: Clock,
  check: CheckCircle2,
  error: BarChart3
} as const;

/** Compact label for GA view counts (e.g. 24500 → "24.5k"). */
function formatCompactViews(value: number): string {
  if (value >= 1_000_000) {
    const n = value / 1_000_000;
    return `${n >= 10 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    const n = value / 1_000;
    return `${n >= 10 ? Math.round(n) : n.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return String(value);
}

function formatGa4ChartLabel(dateKey: string): string {
  if (dateKey.length === 8) {
    const d = new Date(
      `${dateKey.slice(0, 4)}-${dateKey.slice(4, 6)}-${dateKey.slice(6, 8)}T12:00:00`
    );
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }
  return dateKey;
}

function formatPublishedDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function DashboardHomeView() {
  const gid = React.useId().replace(/:/g, '');
  const [trendDays, setTrendDays] = React.useState<7 | 30>(7);

  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError
  } = useDashboardOverview(60_000, trendDays);

  const overviewUnavailable = isOverviewLoading || isOverviewError;

  const publishedMonthLabel = overviewUnavailable
    ? '—'
    : String(overview?.published_this_calendar_month ?? 0);

  const scheduledPendingLabel = overviewUnavailable
    ? '—'
    : String(overview?.scheduled_pending_count ?? 0);

  const creditsSplit = overviewUnavailable
    ? { content: 0, keywords: 0 }
    : {
        content: overview?.credits?.ai_credits ?? 0,
        keywords: overview?.credits?.keyword_credits ?? 0
      };

  const viewsLast30Label = overviewUnavailable
    ? '—'
    : formatCompactViews(overview?.views_last_30_days_total ?? 0);

  const topArticleViewsLabel = overviewUnavailable
    ? '—'
    : formatCompactViews(overview?.top_article_views_max ?? 0);

  const zeroViews14Label = overviewUnavailable
    ? '—'
    : String(overview?.zero_views_last_14_days_count ?? 0);

  const viewsTrendData = React.useMemo(
    () =>
      (overview?.views_trend_daily ?? []).map((point) => ({
        name: formatGa4ChartLabel(point.date),
        views: point.views
      })),
    [overview?.views_trend_daily]
  );

  const contentTypeData = React.useMemo(
    () =>
      (overview?.views_by_generation_type ?? []).map((row) => ({
        name: row.name,
        value: row.percent,
        views: row.views,
        color: TYPE_COLORS[row.name] ?? TYPE_COLORS.Other
      })),
    [overview?.views_by_generation_type]
  );

  const pieTotalPercent = contentTypeData.reduce((sum, row) => sum + row.value, 0);

  const topArticles = overview?.top_articles ?? [];
  const recommendedActions = overview?.recommended_actions ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 p-4 sm:p-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      >
        <StatCard
          label="Published (Month)"
          value={publishedMonthLabel}
          icon={CheckCircle2}
          color="bg-violet-500"
        />

        <StatCard
          label="Scheduled Pending"
          value={scheduledPendingLabel}
          icon={Clock}
          color="bg-amber-500"
        />

        <StatCard
          label="Views (Last 30 Days)"
          value={viewsLast30Label}
          icon={Eye}
          color="bg-blue-500"
        />

        <StatCard
          label="Credits Left"
          splitValue={creditsSplit}
          icon={Zap}
          color="bg-rose-500"
        />

        <StatCard
          label="Top Article Views"
          value={topArticleViewsLabel}
          icon={TrendingUp}
          color="bg-emerald-500"
        />

        <StatCard
          label="Zero Views (Last 14 Days)"
          value={zeroViews14Label}
          icon={AlertCircle}
          color="bg-slate-700"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8 lg:col-span-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-between"
            >
              <div>
                <h3 className="font-bold text-slate-900">Views Trend</h3>

                <p className="text-xs text-slate-500">
                  Daily GA4 views for published articles — last {trendDays} days
                </p>
              </div>

              <select
                className="cursor-pointer rounded-lg border-none bg-slate-50 px-3 py-2 text-xs font-medium outline-none"
                value={trendDays}
                onChange={(e) => setTrendDays(Number(e.target.value) as 7 | 30)}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </motion.div>

            <div className="h-[300px] w-full">
              {viewsTrendData.length === 0 && !overviewUnavailable ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex h-full items-center justify-center text-sm text-slate-400"
                >
                  No GA4 views in this period for tracked articles.
                </motion.div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={viewsTrendData}>
                    <defs>
                      <linearGradient id={`${gid}-views`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                      dy={10}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#94a3b8' }}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill={`url(#${gid}-views)`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-50 p-6">
              <h3 className="font-bold text-slate-900">Top 5 Articles</h3>

              <span className="text-xs text-slate-400">
                By GA4 views (30 days)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Article Title
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Views
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Published
                    </th>

                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {topArticles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-sm text-slate-400"
                      >
                        {overviewUnavailable
                          ? 'Loading articles…'
                          : 'No published articles with URLs yet.'}
                      </td>
                    </tr>
                  ) : (
                    topArticles.map((article) => (
                      <tr
                        key={article.id}
                        className="group transition-colors hover:bg-slate-50/50"
                      >
                        <td className="px-6 py-4">
                          {article.url ? (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-bold text-slate-700 transition-colors group-hover:text-violet-600"
                            >
                              {article.title}
                            </a>
                          ) : (
                            <p className="text-sm font-bold text-slate-700">
                              {article.title}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Eye size={14} className="text-slate-400" />

                            <span className="text-sm font-medium text-slate-600">
                              {article.views.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-600">
                            {article.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-500">
                            {formatPublishedDate(article.published_at)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-8 lg:col-span-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 font-bold text-slate-900">
              Views by Content Type
            </h3>

            <div className="relative h-[200px] w-full">
              {contentTypeData.length === 0 ? (
                <motion.div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No view data yet
                </motion.div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}

              {contentTypeData.length > 0 && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    {Math.round(pieTotalPercent)}%
                  </span>

                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Split
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {contentTypeData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <motion.div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />

                    <span className="text-sm font-medium text-slate-600">
                      {item.name}
                    </span>
                  </motion.div>

                  <span className="text-sm font-bold text-slate-900">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}