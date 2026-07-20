import { api } from './client';

export interface ContentType {
  id: number;
  name: string;
  description: string;
  use_case: string;
  created_at: string;
}

export interface ContentTypesResponse {
  status_code: number;
  success: boolean;
  message: string;
  path: string;
  timestamp: string;
  data: {
    results: ContentType[];
    pagination: {
      count: number;
      total_pages: number;
      current_page: number;
      page_size: number;
      next: string | null;
      previous: string | null;
      has_next: boolean;
      has_previous: boolean;
    };
  };
}

const CONTENT_ENDPOINTS = {
  TYPES: '/content/types/'
};

export const contentApi = {
  // Get all content types
  getContentTypes: async (): Promise<ContentTypesResponse> => {
    return api.get<ContentTypesResponse>(CONTENT_ENDPOINTS.TYPES);
  }
};
