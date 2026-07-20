import { ArticleStructureType } from '@/app/data/templates';
import { useArticleTemplates } from '@/lib/hooks/use-article-templates';
import { ApiError, api } from '@/lib/api/client';
import { normalizeFormData } from '@/lib/utils/form-normalizer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type FormDataWithOptionalStructureType = {
  structureType?: string;
};

export function useCreateContentRequest<TFormData extends object = Record<string, unknown>>(
  generationType: string = 'one_click'
) {
  const { templates } = useArticleTemplates();

  return useMutation({
    mutationFn: async (data: TFormData) => {
      try {
        const structureTypeKey = (data as FormDataWithOptionalStructureType).structureType as
          | ArticleStructureType
          | undefined;
        const structureName =
          (structureTypeKey ? templates[structureTypeKey]?.name : undefined) ||
          'Standard Blog Post';

        // Normalize form data to ensure consistent format across all modes
        // This converts wordCount strings to {min, max} objects,
        // normalizes language codes, and ensures region/country consistency
        const normalizedData = normalizeFormData(data as Record<string, unknown>);

        const payload = {
          generation_type: generationType,
          form_data: normalizedData,
          structure_type: structureName
        };

        const response = await api.post('/content/requests/', payload);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create content request';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Content request submitted successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit content request');
    }
  });
}

interface GenerateContentResponse {
  estimated_credits?: number;
  credits_warning?: boolean;
  credits_available?: number;
  data?: Record<string, unknown>;
}

export function useGenerateContent() {
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.post<GenerateContentResponse>(`/content/requests/${id}/generate/`, {});
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to start content generation';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: (data) => {
      const result = data as GenerateContentResponse;
      if (result?.credits_warning) {
        toast.warning(
          `Content generation started. Note: you only have ${result.credits_available ?? 0} AI credits remaining — generation may be limited.`,
          { duration: 6000 }
        );
      } else {
        toast.success('Content generation started successfully');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start content generation');
    }
  });
}

export interface GeneratedContentItem {
  id: string;
  title?: string;
  keyword?: string;
  status: string;
  status_display?: string;
  word_count?: number;
  model_used?: string;
  generated_at?: string;
  error_message?: string;
  meta_description?: string;
  tokens_used?: number;
  generation_cost?: string;
  image_urls?: string[];
  featured_image_url?: string;
  video_urls?: string[];
}

export interface ContentRequestData {
  id: string;
  title?: string;
  status: string;
  status_display?: string;
  progress_percentage?: number;
  completed_keywords?: number;
  total_keywords?: number;
  failed_keywords?: number;
  error_message?: string;
  generation_type?: string;
  generation_type_display?: string;
  structure_type?: string;
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  created_by?: number;
  celery_task_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form_data?: Record<string, any>;
  content_type_info?: {
    name: string;
    use_case: string;
  };
  generated_contents?: GeneratedContentItem[];
}

export function useDeleteContentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await api.delete(`/content/requests/${id}/`);
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete content request';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Content request deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['content-requests'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete content request');
    }
  });
}

export function useGetContentRequest(id: string | null) {
  return useQuery<ContentRequestData | null>({
    queryKey: ['content-request', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const response = await api.get(`/content/requests/${id}/`);
        return ((response as { data?: ContentRequestData }).data || response) as ContentRequestData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch content request details';
        toast.error(errorMessage);
        throw new ApiError(errorMessage, 500);
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Poll while any article is actively generating (e.g. right after a retry),
    // so the status updates live instead of requiring a manual refresh.
    refetchInterval: (query) => {
      const items = query.state.data?.generated_contents ?? [];
      const isActive = items.some((item) =>
        ['generating', 'processing'].includes(item.status?.toLowerCase())
      );
      return isActive ? 4000 : false;
    }
  });
}

export function useRetryGeneratedContent(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (generatedContentId: string) => {
      try {
        const response = await api.post(`/content/generated/${generatedContentId}/retry/`, {});
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to retry content generation';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: () => {
      toast.success('Retry started — this article is regenerating now');
      queryClient.invalidateQueries({ queryKey: ['content-request', requestId] });
      queryClient.invalidateQueries({ queryKey: ['generated-blogs'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to retry content generation');
    }
  });
}
