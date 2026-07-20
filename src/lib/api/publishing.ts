import { api } from './client';
import type {
  BloggerOAuthSessionResponse,
  BloggerOAuthStartResponse,
  ConnectionTestResponse,
  PublishingAccountCreatePayload,
  PublishingAccountDetailResponse,
  PublishingAccountResponse,
  PublishingAccountUpdatePayload,
  PublishingPlatformResponse,
  WordPressCategoriesResponse,
  WordPressTagsResponse
} from '@/types/publishing';

const PUBLISHING_ENDPOINTS = {
  PLATFORMS: '/content/publishing/platforms/',
  ACCOUNTS: '/content/publishing/accounts/',
  ACCOUNT_DETAIL: (id: string) => `/content/publishing/accounts/${id}/`,
  TEST_CONNECTION: (id: string) => `/content/publishing/accounts/${id}/test-connection/`,
  FETCH_CATEGORIES: (id: string) => `/content/publishing/accounts/${id}/categories/`,
  FETCH_TAGS: (id: string) => `/content/publishing/accounts/${id}/tags/`,
  BLOGGER_OAUTH_START: '/content/publishing/blogger/oauth/start/',
  BLOGGER_OAUTH_EXCHANGE: '/content/publishing/blogger/oauth/exchange/',
  BLOGGER_OAUTH_SESSION: '/content/publishing/blogger/oauth/session/',
  BLOGGER_OAUTH_CONNECT: '/content/publishing/blogger/oauth/connect/'
};

export const publishingApi = {
  // Get all publishing platforms
  getPlatforms: async (): Promise<PublishingPlatformResponse> => {
    return api.get<PublishingPlatformResponse>(PUBLISHING_ENDPOINTS.PLATFORMS);
  },

  // Get all publishing accounts
  getAccounts: async (): Promise<PublishingAccountResponse> => {
    return api.get<PublishingAccountResponse>(PUBLISHING_ENDPOINTS.ACCOUNTS);
  },

  // Get single publishing account
  getAccount: async (id: string): Promise<PublishingAccountDetailResponse> => {
    return api.get<PublishingAccountDetailResponse>(PUBLISHING_ENDPOINTS.ACCOUNT_DETAIL(id));
  },

  // Create new publishing account
  createAccount: async (
    payload: PublishingAccountCreatePayload
  ): Promise<PublishingAccountDetailResponse> => {
    return api.post<PublishingAccountDetailResponse>(PUBLISHING_ENDPOINTS.ACCOUNTS, payload);
  },

  // Update publishing account
  updateAccount: async (
    id: string,
    payload: PublishingAccountUpdatePayload
  ): Promise<PublishingAccountDetailResponse> => {
    return api.patch<PublishingAccountDetailResponse>(
      PUBLISHING_ENDPOINTS.ACCOUNT_DETAIL(id),
      payload
    );
  },

  // Delete publishing account
  deleteAccount: async (id: string): Promise<{ success: boolean; message: string }> => {
    return api.delete(PUBLISHING_ENDPOINTS.ACCOUNT_DETAIL(id));
  },

  // Test connection to publishing account
  testConnection: async (id: string): Promise<ConnectionTestResponse> => {
    return api.post<ConnectionTestResponse>(PUBLISHING_ENDPOINTS.TEST_CONNECTION(id));
  },

  // Fetch WordPress categories
  fetchCategories: async (id: string, forceRefresh = false): Promise<WordPressCategoriesResponse> => {
    const url = forceRefresh
      ? `${PUBLISHING_ENDPOINTS.FETCH_CATEGORIES(id)}?force_refresh=true`
      : PUBLISHING_ENDPOINTS.FETCH_CATEGORIES(id);
    return api.get<WordPressCategoriesResponse>(url);
  },

  // Fetch WordPress tags
  fetchTags: async (id: string, forceRefresh = false): Promise<WordPressTagsResponse> => {
    const url = forceRefresh
      ? `${PUBLISHING_ENDPOINTS.FETCH_TAGS(id)}?force_refresh=true`
      : PUBLISHING_ENDPOINTS.FETCH_TAGS(id);
    return api.get<WordPressTagsResponse>(url);
  },

  startBloggerOAuth: async (): Promise<BloggerOAuthStartResponse> => {
    return api.get<BloggerOAuthStartResponse>(PUBLISHING_ENDPOINTS.BLOGGER_OAUTH_START);
  },

  exchangeBloggerOAuth: async (payload: {
    code: string;
    state: string;
  }): Promise<{ success: boolean; message: string; data: { state: string } }> => {
    return api.post(PUBLISHING_ENDPOINTS.BLOGGER_OAUTH_EXCHANGE, payload);
  },

  getBloggerOAuthSession: async (state: string): Promise<BloggerOAuthSessionResponse> => {
    return api.get<BloggerOAuthSessionResponse>(
      `${PUBLISHING_ENDPOINTS.BLOGGER_OAUTH_SESSION}?state=${encodeURIComponent(state)}`
    );
  },

  connectBloggerAccount: async (payload: {
    state: string;
    blog_id: string;
    account_name?: string;
  }): Promise<PublishingAccountDetailResponse> => {
    return api.post<PublishingAccountDetailResponse>(
      PUBLISHING_ENDPOINTS.BLOGGER_OAUTH_CONNECT,
      payload
    );
  }
};
