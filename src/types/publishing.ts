// Publishing Platform Types
export interface PublishingPlatform {
  id: string;
  name: string;
  platform_type: 'wordpress' | 'blogger' | 'devto';
  platform_type_display: string;
  description: string;
  logo_url: string | null;
  is_active: boolean;
  requires_api_key: boolean;
  requires_username: boolean;
  requires_site_url: boolean;
  created_at: string;
  updated_at: string;
}

// Publishing Account Types
export interface PublishingAccount {
  id: string;
  platform: string;
  platform_name: string;
  platform_type: 'wordpress' | 'blogger' | 'devto';
  team: string;
  created_by: number;
  account_name: string;
  site_url: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error';
  status_display: string;
  last_tested_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface BloggerBlog {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export interface BloggerOAuthStartResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    auth_url: string;
    state: string;
    redirect_uri?: string;
  };
}

export interface BloggerOAuthSessionResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    state: string;
    google_email: string;
    blogs: BloggerBlog[];
  };
}

export interface PublishingAccountCreatePayload {
  platform: string;
  account_name: string;
  site_url?: string;
  username?: string;
  api_key: string;
  api_secret?: string;
  settings?: Record<string, unknown>;
}

export interface PublishingAccountUpdatePayload {
  account_name?: string;
  site_url?: string;
  username?: string;
  api_key?: string;
  api_secret?: string;
  settings?: Record<string, unknown>;
}

// WordPress Category/Tag Types
export interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
}

export interface WordPressTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

// API Response Types
export interface PublishingPlatformResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: PublishingPlatform[];
  };
}

export interface PublishingAccountResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: PublishingAccount[];
  };
}

export interface PublishingAccountDetailResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: PublishingAccount;
}

export interface ConnectionTestResponse {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    success: boolean;
    message: string;
    tested_at: string;
    plugin_info?: {
      site_name: string;
      site_url: string;
      wordpress_version: string;
      plugin_version: string;
    };
  };
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
