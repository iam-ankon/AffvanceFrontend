import { ApiError, api } from '@/lib/api/client';
import { ContentScoreResponse, GenerateContentScoreResponse } from '@/lib/api/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Hook to fetch content score for a given content ID
 */
export function useContentScore(contentId: string) {
  return useQuery({
    queryKey: ['content-score', contentId],
    queryFn: async () => {
      try {
        const response = await api.get<ContentScoreResponse>(
          `/content/generated/${contentId}/score/`
        );
        return response;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!contentId,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}

export type ScoreCategory =
  | 'readability'
  | 'seo'
  | 'structure'
  | 'keywords'
  | 'links'
  | 'images'
  | 'word_count';

const CATEGORY_API_SLUG: Record<ScoreCategory, string> = {
  readability: 'readability',
  seo: 'seo',
  structure: 'structure',
  keywords: 'keyword',
  links: 'links',
  images: 'images',
  word_count: 'word_count',
};

const CATEGORY_LABEL: Record<ScoreCategory, string> = {
  readability: 'Readability',
  seo: 'SEO',
  structure: 'Structure',
  keywords: 'Keywords',
  links: 'Links',
  images: 'Images',
  word_count: 'Word Count',
};

/**
 * Re-score a single content quality category without changing other scores.
 */
export function useRescoreCategory(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: ScoreCategory) => {
      const slug = CATEGORY_API_SLUG[category];
      const response = await api.post<ContentScoreResponse>(
        `/content/generated/${contentId}/score/${slug}/rescore/`,
        {},
        { timeout: 90_000 }
      );
      return response;
    },
    onSuccess: (response, category) => {
      toast.success(`${CATEGORY_LABEL[category]} re-scored successfully`);
      queryClient.setQueryData(['content-score', contentId], response);
      queryClient.invalidateQueries({ queryKey: ['content-score', contentId] });
    },
    onError: (error, category) => {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to re-score ${CATEGORY_LABEL[category]}`;
      toast.error(message);
    },
  });
}

/** @deprecated Use useRescoreCategory instead */
export function useRescoreReadability(contentId: string) {
  const mutation = useRescoreCategory(contentId);
  return {
    ...mutation,
    mutate: () => mutation.mutate('readability'),
    mutateAsync: () => mutation.mutateAsync('readability'),
  };
}
export function useGenerateContentScore(contentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const response = await api.post<GenerateContentScoreResponse>(
          `/content/generated/${contentId}/score/regenerate/`,
          {},
          { timeout: 180_000 }
        );
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to generate content score';
        throw new ApiError(errorMessage, 500);
      }
    },
    onSuccess: (response) => {
      toast.success('Content score generated successfully');
      queryClient.setQueryData(['content-score', contentId], response);
      queryClient.invalidateQueries({ queryKey: ['content-score', contentId] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to generate content score');
    }
  });
}
