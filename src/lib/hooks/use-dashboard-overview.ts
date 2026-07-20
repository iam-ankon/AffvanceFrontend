'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export interface DashboardCredits {
  has_subscription?: boolean;
  keyword_credits?: number;
  ai_credits?: number;
  plan_name?: string | null;
}

export interface DashboardTopArticle {
  id: string;
  title: string;
  views: number;
  status: string;
  published_at: string | null;
  url?: string;
}

export interface DashboardViewsTrendPoint {
  date: string;
  views: number;
}

export interface ViewsByGenerationType {
  name: string;
  views: number;
  percent: number;
}

export interface DashboardRecommendedAction {
  id: number;
  type: 'warning' | 'info' | 'check' | 'error';
  text: string;
}

export interface DashboardAnalyticsMeta {
  source: string;
  ga4_available: boolean;
  ga4_property_id?: string | null;
  tracked_paths_count: number;
  warning?: string;
}

export interface DashboardOverviewPayload {
  published_this_calendar_month: number;
  scheduled_pending_count: number;
  views_last_30_days_total: number;
  top_article_views_max: number;
  zero_views_last_14_days_count: number;
  credits: DashboardCredits;
  top_articles: DashboardTopArticle[];
  views_trend_daily: DashboardViewsTrendPoint[];
  views_by_generation_type: ViewsByGenerationType[];
  recommended_actions: DashboardRecommendedAction[];
  analytics: DashboardAnalyticsMeta;
  views_trend_days: number;
}

interface StandardResponse<T> {
  status_code: number;
  success: boolean;
  message: string;
  path: string;
  timestamp: string;
  data: T;
}

export function useDashboardOverview(
  refetchMs: number = 60_000,
  trendDays: 7 | 30 = 7
) {
  return useQuery({
    queryKey: ['content', 'dashboard-overview', trendDays],
    queryFn: async () => {
      const res = await api.get<StandardResponse<DashboardOverviewPayload>>(
        `/content/dashboard/overview/?trend_days=${trendDays}`
      );
      return res.data;
    },
    staleTime: 45_000,
    refetchInterval: refetchMs
  });
}
