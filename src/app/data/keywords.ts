import { Keyword } from '@/lib/api/types';

export const keywords: Keyword[] = [
  {
    id: '1',
    keyword: 'best seo tools',
    volume: 5400,
    difficulty: 42,
    cpc: '$12.50',
    url: 'https://example.com/best-seo-tools',
    position: 8,
    status: 'success'
  },
  {
    id: '2',
    keyword: 'how to improve seo',
    volume: 2900,
    difficulty: 35,
    cpc: '$8.75',
    url: 'https://example.com/improve-seo',
    position: 12,
    status: 'processing'
  },
  {
    id: '3',
    keyword: 'keyword research tools',
    volume: 3600,
    difficulty: 38,
    cpc: '$15.20',
    url: 'https://example.com/keyword-research-tools',
    position: 5,
    status: 'success'
  },
  {
    id: '4',
    keyword: 'on page seo checklist',
    volume: 1800,
    difficulty: 28,
    cpc: '$9.80',
    url: 'https://example.com/on-page-seo-checklist',
    position: 3,
    status: 'success'
  },
  {
    id: '5',
    keyword: 'technical seo audit',
    volume: 2400,
    difficulty: 45,
    cpc: '$18.30',
    url: 'https://example.com/technical-seo-audit',
    position: 18,
    status: 'failed'
  },
  {
    id: '6',
    keyword: 'local seo strategy',
    volume: 3200,
    difficulty: 32,
    cpc: '$14.50',
    url: 'https://example.com/local-seo-strategy',
    position: 7,
    status: 'processing'
  },
  {
    id: '7',
    keyword: 'content marketing ideas',
    volume: 4100,
    difficulty: 29,
    cpc: '$11.75',
    url: 'https://example.com/content-marketing-ideas',
    position: 15,
    status: 'success'
  },
  {
    id: '8',
    keyword: 'backlink analysis tools',
    volume: 2700,
    difficulty: 41,
    cpc: '$16.90',
    url: 'https://example.com/backlink-tools',
    position: 22,
    status: 'pending'
  },
  {
    id: '9',
    keyword: 'seo for beginners',
    volume: 3800,
    difficulty: 19,
    cpc: '$7.80',
    url: 'https://example.com/seo-for-beginners',
    position: 4,
    status: 'success'
  },
  {
    id: '10',
    keyword: 'ecommerce seo tips',
    volume: 3100,
    difficulty: 37,
    cpc: '$20.10',
    url: 'https://example.com/ecommerce-seo-tips',
    position: 11,
    status: 'processing'
  },
  {
    id: '11',
    keyword: 'affiliate marketing',
    volume: 4500,
    difficulty: 33,
    cpc: '$13.20',
    url: 'https://example.com/affiliate-marketing',
    position: 9,
    status: 'success'
  },
  {
    id: '12',
    keyword: 'blogging for beginners',
    volume: 2800,
    difficulty: 22,
    cpc: '$6.90',
    url: 'https://example.com/blogging-beginners',
    position: 6,
    status: 'success'
  },
  {
    id: '13',
    keyword: 'wordpress seo',
    volume: 4200,
    difficulty: 40,
    cpc: '$17.80',
    url: 'https://example.com/wordpress-seo',
    position: 14,
    status: 'processing'
  },
  {
    id: '14',
    keyword: 'content optimization',
    volume: 3500,
    difficulty: 31,
    cpc: '$11.40',
    url: 'https://example.com/content-optimization',
    position: 8,
    status: 'success'
  },
  {
    id: '15',
    keyword: 'google analytics',
    volume: 6800,
    difficulty: 48,
    cpc: '$22.50',
    url: 'https://example.com/google-analytics',
    position: 16,
    status: 'failed'
  },
  {
    id: '16',
    keyword: 'link building strategies',
    volume: 3900,
    difficulty: 44,
    cpc: '$19.70',
    url: 'https://example.com/link-building',
    position: 13,
    status: 'processing'
  },
  {
    id: '17',
    keyword: 'mobile seo',
    volume: 4600,
    difficulty: 36,
    cpc: '$14.90',
    url: 'https://example.com/mobile-seo',
    position: 10,
    status: 'success'
  },
  {
    id: '18',
    keyword: 'voice search optimization',
    volume: 2100,
    difficulty: 25,
    cpc: '$8.30',
    url: 'https://example.com/voice-search',
    position: 5,
    status: 'success'
  },
  {
    id: '19',
    keyword: 'schema markup',
    volume: 3300,
    difficulty: 39,
    cpc: '$16.20',
    url: 'https://example.com/schema-markup',
    position: 17,
    status: 'pending'
  },
  {
    id: '20',
    keyword: 'core web vitals',
    volume: 5700,
    difficulty: 42,
    cpc: '$21.10',
    url: 'https://example.com/core-web-vitals',
    position: 12,
    status: 'success'
  }
];

export const mockPagination = {
  page: 1,
  pageSize: 20,
  total: 20,
  total_pages: 1
};

export const mockApiResponse = {
  data: keywords,
  pagination: mockPagination,
  success: true,
  message: 'Keywords retrieved successfully'
};
