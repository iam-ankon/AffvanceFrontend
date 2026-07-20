import {
  AlertCircle,
  BarChart3,
  Clock,
  ExternalLink
} from 'lucide-react';

export const viewsData = [
  { name: 'Mar 21', views: 400 },
  { name: 'Mar 22', views: 300 },
  { name: 'Mar 23', views: 600 },
  { name: 'Mar 24', views: 800 },
  { name: 'Mar 25', views: 500 },
  { name: 'Mar 26', views: 900 },
  { name: 'Mar 27', views: 1200 }
];

export const contentTypeData = [
  { name: 'Quick', value: 45, color: '#8b5cf6' },
  { name: 'Co-pilot', value: 30, color: '#ec4899' },
  { name: 'Bulk', value: 25, color: '#06b6d4' }
];

export const topArticles = [
  { id: 1, title: 'Best Robot Vacuum Cleaners 2026', views: 12450, status: 'Published', date: 'Mar 15' },
  { id: 2, title: '10 Niche Affiliate Marketing Tips', views: 8900, status: 'Published', date: 'Mar 18' },
  { id: 3, title: 'AI Content Strategy for Blogs', views: 5600, status: 'Published', date: 'Mar 20' },
  { id: 4, title: 'Smart Home Security Guide', views: 4200, status: 'Published', date: 'Mar 22' },
  { id: 5, title: 'Future of SaaS in 2026', views: 3800, status: 'Published', date: 'Mar 24' }
];

export const actionItems = [
  { id: 1, type: 'warning' as const, text: 'Low credits warning: 116 remaining', icon: AlertCircle },
  { id: 2, type: 'info' as const, text: '3 posts ready to publish', icon: Clock },
  { id: 3, type: 'check' as const, text: '5 articles need affiliate links checked', icon: ExternalLink },
  { id: 4, type: 'error' as const, text: '4 posts have no views yet — improve title', icon: BarChart3 }
];

export const analyticsPerformanceChartData = [
  { name: 'Mon', views: 4000, clicks: 2400 },
  { name: 'Tue', views: 3000, clicks: 1398 },
  { name: 'Wed', views: 2000, clicks: 9800 },
  { name: 'Thu', views: 2780, clicks: 3908 },
  { name: 'Fri', views: 1890, clicks: 4800 },
  { name: 'Sat', views: 2390, clicks: 3800 },
  { name: 'Sun', views: 3490, clicks: 4300 }
];

export const analyticsHealthRows = [
  { title: 'Best Robot Vacuum Cleaners 2026', seo: 92, read: 'Good', health: 'Healthy' },
  { title: '10 Niche Affiliate Marketing Tips', seo: 85, read: 'Excellent', health: 'Healthy' },
  { title: 'AI Content Strategy for Blogs', seo: 78, read: 'Fair', health: 'Needs Optimization' },
  { title: 'Smart Home Security Guide', seo: 64, read: 'Good', health: 'Critical' }
];
