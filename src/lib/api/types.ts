export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  name?: string;
  avatar?: string;
}

export interface Tour {
  status: string;
  author: User;
  words: number;
  published: boolean;
  id: string;
  title: string;
  publishedDate: string;
  tourType: string;
  country: string;
  tourDuration: string;
  tourDescription: string;
  tourImage: string;
}

export interface Blog {
  id: string;
  words: number;
  views: number;
  title: string;
  content: string;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
  author?: User;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface Pagination {
  total_records: number;
  current_page: number;
  total_pages: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
  status: boolean;
  code: number;
  message: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  accessExpiresAt?: string;
  refreshExpiresAt?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  access_expires_in?: number;
  refresh_expires_in?: number;
  access_expires_at?: string;
  refresh_expires_at?: string;
}
export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    tokenType?: string;
    expiresIn?: number;
    accessExpiresAt?: string;
    refreshExpiresAt?: string;

    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    access_expires_in?: number;
    refresh_expires_in?: number;
    access_expires_at?: string;
    refresh_expires_at?: string;
  };
  message?: string;
}

export interface Keyword {
  id: string;
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: string;
  url: string;
  position: number;
  status: string;
}

export interface ContentRequest {
  id: string;
  team: string;
  created_by: number;
  generation_type: string;
  generation_type_display: string;
  status: string;
  status_display: string;
  title: string;
  celery_task_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  structure_type: string;
  progress_percentage: number;
  request_info?: {
    id: string;
    title: string;
    generation_type: string;
    status: string;
  };
  keyword?: string;
  word_count?: number;
  form_data?: Record<string, any>;
}

export interface PaginationMetadata {
  count: number;
  total_pages: number;
  current_page: number;
  page_size: number;
  next: string | null;
  previous: string | null;
  has_next: boolean;
  has_previous: boolean;
}

export interface ContentRequestListResponse {
  data: {
    results: ContentRequest[];
    pagination: PaginationMetadata;
  };
  status_code: number;
  success: boolean;
  message: string;
}

export interface GeneratedContent {
  id: string;
  request: string;
  request_title: string;
  keyword: string;
  keyword_suggestion_item: string;
  is_custom_keyword: boolean;
  title: string;
  word_count: number;
  status: string;
  status_display: string;
  tokens_used: number;
  prompt_tokens: number;
  completion_tokens: number;
  generation_cost: string;
  model_used: string;
  schedule_time: string | null;
  published_at: string | null;
  error_message: string | null;
  generation_attempts: number;
  created_at: string;
  updated_at: string;
  generated_at: string | null;
  featured_image_url: string | null;
  image_urls?: string[];
  og_image?: string | null;
  additional_image_urls: string[];
  video_urls: string[];
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface GeneratedContentListResponse {
  status_code: number;
  success: boolean;
  message: string;
  path?: string;
  timestamp?: string;
  data: {
    results: GeneratedContent[];
    pagination: PaginationMetadata;
  };
}

export interface ContentRequestResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: ContentRequest & {
    html_content?: string;
    featured_image_url?: string | null;
    keyword_suggestion_info?: {
      keyword: string;
      search_volume: number;
      keyword_difficulty: number;
      competition: number;
    };
  };
}

// Publishing Platform Types
export interface PublishingPlatform {
  id: string;
  name: string;
  platform_type: string;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// Publishing Account Types
export interface PublishingAccount {
  id: string;
  team: string;
  created_by: number;
  platform: string | PublishingPlatform;
  platform_name?: string;
  platform_type?: string;
  account_name: string;
  name?: string;
  site_url: string | null;
  username: string | null;
  status: string;
  status_display: string;
  error_message: string | null;
  last_tested_at: string | null;
  jwt_token_expires_at?: string | null;
  ga4_property_id?: string | null;
  ga4_measurement_id?: string | null;
  gtm_container_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishingAccountListResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: PublishingAccount[];
    pagination: PaginationMetadata;
  };
}

// WordPress Category & Tag Types
export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number;
  count: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface WordPressCategoriesResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    categories: WordPressCategory[];
    total: number;
    cached: boolean;
  };
}

export interface WordPressTagsResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    tags: WordPressTag[];
    total: number;
    cached: boolean;
  };
}

// Scheduled Publication Types
export interface ScheduledPublication {
  id: string;
  generated_content: string;
  publishing_account: PublishingAccount;
  scheduled_time: string;
  status: string;
  status_display: string;
  published_url: string | null;
  published_post_id: string | null;
  error_message: string | null;
  category_id: number | null;
  tag_ids: number[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface ScheduledPublicationListResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: ScheduledPublication[];
    pagination: PaginationMetadata;
  };
}

export interface PublicationsForContentResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    content_id: string;
    content_title: string;
    content_status: string;
    publications: ScheduledPublication[];
    total_publications: number;
  };
}

// Content Score Types
export interface ContentScore {
  id: string;
  generated_content: string;
  overall_score: number;
  score_level: 'poor' | 'basic' | 'average' | 'good';
  score_level_display: string;

  // Individual metric scores (0-100)
  readability_score: number;
  seo_score: number;
  structure_score: number;
  keyword_score: number;
  word_count_score: number;
  link_score: number;
  image_score: number;

  // Readability metrics
  flesch_reading_ease: number;
  flesch_kincaid_grade: number;
  gunning_fog_index: number;
  sentence_count: number;
  paragraph_count: number;
  avg_sentence_length: number;
  avg_word_length: number;

  // Heading analysis
  h1_count: number;
  h2_count: number;
  h3_count: number;
  h4_count: number;
  total_headings: number;

  // Link analysis
  internal_links: number;
  external_links: number;
  total_links: number;

  // Image analysis
  image_count: number;
  images_with_alt: number;

  // Keyword analysis
  keyword_density: number;
  keyword_in_title: boolean;
  keyword_in_first_paragraph: boolean;
  keyword_in_headings: number;
  keyword_occurrences: number;

  // SEO elements
  has_meta_title: boolean;
  has_meta_description: boolean;
  meta_title_length: number;
  meta_description_length: number;
  meta_title_has_keyword: boolean;
  meta_description_has_keyword: boolean;

  // Category re-score limits (3 uses per category per article)
  category_rescore_limits?: Partial<
    Record<
      'readability' | 'seo' | 'structure' | 'keywords' | 'links' | 'images' | 'word_count',
      { count: number; remaining: number; max: number }
    >
  >;
  readability_rescore_count?: number;
  readability_rescore_remaining?: number;
  readability_rescore_max?: number;

  // AI analysis
  ai_suggestions?: AISuggestion[];
  ai_quality_notes?: string | null;
  ai_enabled?: boolean;
  ai_analysis?: {
    scores?: {
      seo_score: number;
      link_score: number;
      image_score: number;
      keyword_score: number;
      overall_score: number;
      readability_score: number;
      structure_score: number;
      word_count_score: number;
    };
    metrics?: Record<string, unknown>;
  };

  // Additional fields
  target_word_count?: number;
  generated_content_title?: string;
  complex_words?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
  analyzed_at: string | null;
}

export interface AISuggestion {
  title?: string;
  category: string;
  message: string;
  details?: string | null;
  priority: 'low' | 'medium' | 'high';
}

export interface ContentScoreResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: ContentScore;
}

export type GenerateContentScoreResponse = ContentScoreResponse;
