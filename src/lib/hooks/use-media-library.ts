'use client';

import { api } from '@/lib/api/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
export interface MediaTag {
  id: string;
  name: string;
  color: string;
  media_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: string;
  name: string;
  file_url: string;
  thumbnail_url: string | null;
  media_type: 'image' | 'video';
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  tags: MediaTag[];
  alt_text: string;
  description: string;
  uploaded_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface MediaListResponse {
  data: {
    results: MediaItem[];
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

export interface MediaStatsResponse {
  data: {
    total_files: number;
    images: number;
    videos: number;
    total_size_bytes: number;
    total_size_mb: number;
    tag_count: number;
  };
}

export interface MediaUploadResponse {
  data: MediaItem;
  message: string;
  success: boolean;
}

export interface BulkUrlsResponse {
  data: {
    media: Array<{
      id: string;
      name: string;
      file_url: string;
      thumbnail_url: string | null;
      media_type: string;
    }>;
  };
}

interface MediaFilters {
  search?: string;
  media_type?: 'image' | 'video';
  tag?: string;
  page?: number;
  page_size?: number;
}

// Query keys
export const mediaLibraryKeys = {
  all: ['media-library'] as const,
  list: (filters?: MediaFilters) => [...mediaLibraryKeys.all, 'list', filters] as const,
  detail: (id: string) => [...mediaLibraryKeys.all, 'detail', id] as const,
  stats: () => [...mediaLibraryKeys.all, 'stats'] as const,
  tags: () => [...mediaLibraryKeys.all, 'tags'] as const
};

// Hooks
export function useMediaLibrary(filters?: MediaFilters) {
  return useQuery({
    queryKey: mediaLibraryKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.media_type) params.append('media_type', filters.media_type);
      if (filters?.tag) params.append('tag', filters.tag);
      if (filters?.page) params.append('page', String(filters.page));
      if (filters?.page_size) params.append('page_size', String(filters.page_size));

      const queryString = params.toString();
      const url = `/media/${queryString ? `?${queryString}` : ''}`;
      return api.get<MediaListResponse>(url);
    }
  });
}

export function useMediaStats() {
  return useQuery({
    queryKey: mediaLibraryKeys.stats(),
    queryFn: async () => {
      return api.get<MediaStatsResponse>('/media/stats/');
    }
  });
}

export function useMediaTags() {
  return useQuery({
    queryKey: mediaLibraryKeys.tags(),
    queryFn: async () => {
      return api.get<{ data: { results: MediaTag[] } }>('/media/tags/');
    }
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      name,
      alt_text,
      description,
      onProgress
    }: {
      file: File;
      name?: string;
      alt_text?: string;
      description?: string;
      onProgress?: (progress: number) => void;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      if (name) formData.append('name', name);
      if (alt_text) formData.append('alt_text', alt_text);
      if (description) formData.append('description', description);

      return api.upload<MediaUploadResponse>('/media/upload/', file, onProgress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all });
      toast.success('Media uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload media');
    }
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/media/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all });
      toast.success('Media deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete media');
    }
  });
}

export function useBulkGetUrls() {
  return useMutation({
    mutationFn: async (mediaIds: string[]) => {
      return api.post<BulkUrlsResponse>('/media/bulk-urls/', { media_ids: mediaIds });
    }
  });
}

export function useBulkDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaIds: string[]) => {
      return api.post('/media/bulk-delete/', { media_ids: mediaIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaLibraryKeys.all });
      toast.success('Media deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete media');
    }
  });
}
