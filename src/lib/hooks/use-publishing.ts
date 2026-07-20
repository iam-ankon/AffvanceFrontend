import { ApiError, api } from '@/lib/api/client';
import {
  PublishingAccountListResponse,
  WordPressCategoriesResponse,
  WordPressTagsResponse,
  ScheduledPublicationListResponse,
  PublicationsForContentResponse,
  ScheduledPublication,
  ApiResponse
} from '@/lib/api/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Publishing Accounts Hooks
export function usePublishingAccounts(
  page: number = 1,
  pageSize: number = 100
) {
  return useQuery({
    queryKey: ['publishing-accounts', page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      const response = await api.get<PublishingAccountListResponse>(
        `/content/publishing/accounts/?${params.toString()}`
      );
      return response;
    }
  });
}

// WordPress Categories Hook
export function useWordPressCategories(
  accountId: string | null,
  forceRefresh: boolean = false,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['wordpress-categories', accountId, forceRefresh],
    queryFn: async () => {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      const params = forceRefresh ? '?force_refresh=true' : '';
      const response = await api.get<WordPressCategoriesResponse>(
        `/content/publishing/accounts/${accountId}/categories/${params}`
      );
      return response;
    },
    enabled: enabled && !!accountId,
    staleTime: forceRefresh ? 0 : 15 * 60 * 1000 // 15 minutes cache
  });
}

// WordPress Tags Hook
export function useWordPressTags(
  accountId: string | null,
  forceRefresh: boolean = false
) {
  return useQuery({
    queryKey: ['wordpress-tags', accountId, forceRefresh],
    queryFn: async () => {
      if (!accountId) {
        throw new Error('Account ID is required');
      }

      const params = forceRefresh ? '?force_refresh=true' : '';
      const response = await api.get<WordPressTagsResponse>(
        `/content/publishing/accounts/${accountId}/tags/${params}`
      );
      return response;
    },
    enabled: !!accountId,
    staleTime: forceRefresh ? 0 : 15 * 60 * 1000 // 15 minutes cache
  });
}

// Scheduled Publications Hooks
export function useScheduledPublications(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    status?: string;
    content_id?: string;
    account_id?: string;
  } = {}
) {
  return useQuery({
    queryKey: ['scheduled-publications', page, pageSize, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });

      const response = await api.get<ScheduledPublicationListResponse>(
        `/content/publishing/scheduled/?${params.toString()}`
      );
      return response;
    }
  });
}

// Get Publications for a specific content
export function useContentPublications(contentId: string | null, statusFilter?: string) {
  return useQuery({
    queryKey: ['content-publications', contentId, statusFilter],
    queryFn: async () => {
      if (!contentId) {
        throw new Error('Content ID is required');
      }

      const params = statusFilter ? `?status=${statusFilter}` : '';
      const response = await api.get<PublicationsForContentResponse>(
        `/content/generated/${contentId}/publications/${params}`
      );
      return response;
    },
    enabled: !!contentId
  });
}

// Create Scheduled Publication
interface CreatePublicationPayload {
  generated_content: string;
  publishing_account: string;
  scheduled_time: string;
  category_id?: number | null;
  tag_ids?: number[];
}

export function useCreatePublication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePublicationPayload) => {
      try {
        const response = await api.post<ApiResponse<ScheduledPublication>>(
          '/content/publishing/scheduled/',
          data
        );
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to schedule publication';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: (_, variables) => {
      toast.success('Publication scheduled successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-publications'] });
      queryClient.invalidateQueries({ queryKey: ['content-publications', variables.generated_content] });
      queryClient.invalidateQueries({ queryKey: ['blog', variables.generated_content] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule publication');
    }
  });
}

// Update Scheduled Publication
interface UpdatePublicationPayload {
  scheduled_time?: string;
  category_id?: number | null;
  tag_ids?: number[];
}

export function useUpdatePublication(publicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdatePublicationPayload) => {
      try {
        const response = await api.patch<ApiResponse<ScheduledPublication>>(
          `/content/publishing/scheduled/${publicationId}/`,
          data
        );
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update publication';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Publication updated successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-publications'] });
      queryClient.invalidateQueries({ queryKey: ['content-publications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update publication');
    }
  });
}

// Publish Now
export function usePublishNow(publicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.post<ApiResponse<{ publication_id: string; task_id: string; message: string }>>(
          `/content/publishing/scheduled/${publicationId}/publish-now/`,
          {}
        );
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to publish';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Publishing started immediately');
      queryClient.invalidateQueries({ queryKey: ['scheduled-publications'] });
      queryClient.invalidateQueries({ queryKey: ['content-publications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to publish');
    }
  });
}

// Cancel/Delete Scheduled Publication
export function useCancelPublication(publicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.delete<ApiResponse<null>>(
          `/content/publishing/scheduled/${publicationId}/`
        );
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to cancel publication';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Publication cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['scheduled-publications'] });
      queryClient.invalidateQueries({ queryKey: ['content-publications'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel publication');
    }
  });
}
