'use client';

import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Search,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';
import * as React from 'react';
import Link from 'next/link';
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

// ---------------------------------------------------------------------------
// Types (match content/services/dashboard_aggregate.py response shapes)
// ---------------------------------------------------------------------------

interface ContentHealthRow {
  id: string;
  title: string;
  seo_score: number;
  readability_label: string;
  health_label: 'Healthy' | 'Needs Optimization' | 'Critical' | string;
}

interface SeoScoreBucket {
  label: string;
  percent: number;
}

interface ContentQualityOverview {
  total_articles: number;
  scored_articles: number;
  total_words: number;
  avg_seo_score: number;
  avg_readability_score: number;
  avg_overall_score: number;
  avg_read_time_minutes: number;
  seo_score_distribution: SeoScoreBucket[];
  content_health: ContentHealthRow[];
  traffic_metrics_available: boolean;
}

interface DashboardTrendPoint {
  date: string;
  views: number;
}

interface DashboardOverview {
  published_this_calendar_month: number;
  scheduled_pending_count: number;
  views_last_30_days_total: number;
  views_trend_daily: DashboardTrendPoint[];
  analytics: {
    ga4_available: boolean;
  };
}

interface ApiEnvelope<T> {
  data?: T;
}

function useContentQualityOverview() {
  return useQuery<ContentQualityOverview>({
    queryKey: ['content-quality-overview'],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<ContentQualityOverview>>(
        '/content/dashboard/content-quality/'
      );
      return (
        response?.data ?? {
          total_articles: 0,
          scored_articles: 0,
          total_words: 0,
          avg_seo_score: 0,
          avg_readability_score: 0,
          avg_overall_score: 0,
          avg_read_time_minutes: 0,
          seo_score_distribution: [],
          content_health: [],
          traffic_metrics_available: false
        }
      );
    },
    staleTime: 60 * 1000
  });
}

function useDashboardOverview() {
  return useQuery<DashboardOverview>({
    queryKey: ['dashboard-overview'],
    queryFn: async () => {
      const response = await api.get<ApiEnvelope<DashboardOverview>>('/content/dashboard/overview/');
      return (
        response?.data ?? {
          published_this_calendar_month: 0,
          scheduled_pending_count: 0,
          views_last_30_days_total: 0,
          views_trend_daily: [],
          analytics: { ga4_available: false }
        }
      );
    },
    staleTime: 60 * 1000
  });
}

function formatWordCount(total: number): string {
  if (total >= 1_000_000) return `${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `${(total / 1_000).toFixed(1)}K`;
  return String(total);
}

const SEO_BUCKET_COLORS: Record<string, string> = {
  Excellent: '#10b981',
  Good: '#8b5cf6',
  Poor: '#f43f5e'
};

export function DashboardAnalyticsView() {
  const gid = React.useId().replace(/:/g, '');
  const quality = useContentQualityOverview();
  const overview = useDashboardOverview();

  const isLoading = quality.isLoading || overview.isLoading;
  const q = quality.data;
  const ov = overview.data;

  const handleExportCSV = () => {
    if (!q || q.content_health.length === 0) return;
    const rows = q.content_health
      .map((row) => `"${row.title.replace(/"/g, '""')}",${row.seo_score},${row.readability_label},${row.health_label}`)
      .join('\n');
    const csvContent = `Article,SEO Score,Readability,Health\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'content_health_audit.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullAudit = () => {
    if (!q) return;
    const needsOptimization = q.content_health.filter((row) => row.health_label !== 'Healthy').length;
    const articleLines = q.content_health
      .map(
        (row, idx) =>
          `${idx + 1}. ${row.title}\n   - SEO Score: ${row.seo_score}\n   - Readability: ${row.readability_label}\n   - Status: ${row.health_label}`
      )
      .join('\n\n');

    const auditContent = `AFFVANCE CONTENT HEALTH AUDIT REPORT
Generated on: ${new Date().toLocaleDateString()}

OVERALL PERFORMANCE:
- Average SEO Score: ${q.avg_seo_score}/100
- Articles Scored: ${q.scored_articles} of ${q.total_articles}
- Optimization Needed: ${needsOptimization} Article(s)

ARTICLE BREAKDOWN:
${articleLines || '(No scored articles yet.)'}
`;

    const blob = new Blob([auditContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'full_audit_report.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const hasScoredContent = (q?.scored_articles ?? 0) > 0;
  const ga4Available = ov?.analytics.ga4_available ?? false;

  return (
    <div className="space-y-8 p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. SEO Score</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {hasScoredContent ? `${q!.avg_seo_score}/100` : '—'}
            </h3>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Words</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {formatWordCount(q?.total_words ?? 0)}
            </h3>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Read Time</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {q && q.avg_read_time_minutes > 0 ? `${q.avg_read_time_minutes} min` : '—'}
            </h3>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Published This Month</p>
            <h3 className="text-2xl font-bold text-slate-900">{ov?.published_this_calendar_month ?? 0}</h3>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Content Performance</h3>
                <p className="text-xs text-slate-500">
                  {ga4Available
                    ? 'Page views for your published content (Google Analytics)'
                    : 'Requires Google Analytics to show real view trends'}
                </p>
              </div>
              {ga4Available && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-violet-500" /> Views
                </span>
              )}
            </div>
            {ga4Available && ov && ov.views_trend_daily.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ov.views_trend_daily}>
                    <defs>
                      <linearGradient id={`${gid}-av`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
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
                      fill={`url(#${gid}-av)`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center gap-2 rounded-xl bg-slate-50/50 text-center">
                <TrendingUp size={28} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No view data yet</p>
                <p className="max-w-xs text-xs text-slate-400">
                  Connect Google Analytics (GA4_PROPERTY_ID) to see real page-view trends for your published
                  articles here.
                </p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-50 p-6">
              <h3 className="font-bold text-slate-900">Content Health Audit</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={!hasScoredContent}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={handleFullAudit}
                  disabled={!hasScoredContent}
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-violet-200 transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Full Audit
                </button>
              </div>
            </div>
            {hasScoredContent ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Article
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        SEO Score
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Readability
                      </th>
                      <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Health
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {q!.content_health.map((item) => (
                      <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700">{item.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  item.seo_score > 80
                                    ? 'bg-emerald-500'
                                    : item.seo_score > 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                )}
                                style={{ width: `${item.seo_score}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{item.seo_score}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-slate-600">{item.readability_label}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'h-2 w-2 rounded-full',
                                item.health_label === 'Healthy'
                                  ? 'bg-emerald-500'
                                  : item.health_label === 'Needs Optimization'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                              )}
                            />
                            <span className="text-xs font-bold text-slate-700">{item.health_label}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
                <FileText size={28} className="text-slate-300" />
                <p className="text-sm font-medium text-slate-500">No scored articles yet</p>
                <p className="max-w-xs text-xs text-slate-400">
                  Generate an article and it will be scored automatically — SEO, readability, and health will
                  show up here.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <div className="space-y-8 lg:col-span-4">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 font-bold text-slate-900">SEO Score Distribution</h3>
            {hasScoredContent && q!.seo_score_distribution.length > 0 ? (
              <>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={q!.seo_score_distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="percent"
                        nameKey="label"
                      >
                        {q!.seo_score_distribution.map((bucket) => (
                          <Cell key={bucket.label} fill={SEO_BUCKET_COLORS[bucket.label] ?? '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {q!.seo_score_distribution.map((bucket) => (
                    <div key={bucket.label} className="text-center">
                      <p className="text-[10px] font-bold uppercase text-slate-400">{bucket.label}</p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: SEO_BUCKET_COLORS[bucket.label] ?? '#475569' }}
                      >
                        {bucket.percent}%
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="py-8 text-center text-xs text-slate-400">
                Score distribution appears once you have scored articles.
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 font-bold text-slate-900">Top Driving Keywords</h3>
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <Search size={24} className="text-slate-300" />
              <p className="text-xs text-slate-400">
                Keyword-level traffic requires Google Search Console, which isn&apos;t connected yet.
              </p>
            </div>
            <Link
              href="/app/keyword-lab"
              className="mt-2 block w-full py-2 text-center text-xs font-bold text-violet-600 transition-colors hover:text-violet-700"
            >
              Keyword Lab →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
          >
            <h3 className="mb-6 font-bold text-slate-900">Traffic Sources</h3>
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <TrendingUp size={24} className="text-slate-300" />
              <p className="text-xs text-slate-400">
                Traffic-source breakdown requires Google Analytics with channel grouping enabled.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}