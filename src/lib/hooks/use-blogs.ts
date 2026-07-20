import { ApiError, api } from '@/lib/api/client';
import {
  ContentRequestListResponse,
  ContentRequestResponse,
  GeneratedContentListResponse
} from '@/lib/api/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface SaveBlogContentPayload {
  title?: string;
  html_content?: string;
  featured_image_url?: string | null;
}

export function useBlogs(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  filters: Record<string, string> = {}
) {
  return useQuery({
    queryKey: ['blogs', page, pageSize, search, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        ...filters
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get<ContentRequestListResponse>(
        `/content/requests/?${params.toString()}`
      );
      return response;
    }
  });
}

export function useGeneratedBlogs(
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
  filters: Record<string, string> = {},
  status?: 'published' | 'generated' | 'scheduled'
) {
  return useQuery({
    queryKey: ['generated-blogs', page, pageSize, search, filters, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      if (search) {
        params.append('search', search);
      }

      // Add status filter if provided
      if (status) {
        if (status === 'generated') {
          params.append('status', 'generated,edited');
        } else {
          params.append('status', status);
        }
      }

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && key !== 'status') {
          params.append(key, value);
        }
      });

      const response = await api.get<GeneratedContentListResponse>(
        `/content/generated/?${params.toString()}`
      );
      return response;
    }
  });
}

export function useGetBlogDetails(id: string) {
  return useQuery({
    queryKey: ['blog', id],
    queryFn: async () => {
      const response = await api.get<ContentRequestResponse>(`/content/generated/${id}`);
      return response;
    },
    enabled: !!id
  });
}

export function useSaveBlogContent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveBlogContentPayload) => {
      try {
        const response = await api.put<ContentRequestResponse>(`/content/generated/${id}/`, data);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save blog content';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Blog content saved successfully');
      // Invalidate the blog details query to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['blog', id] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save blog content');
    }
  });
}
