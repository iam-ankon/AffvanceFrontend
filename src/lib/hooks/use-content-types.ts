import { contentApi } from '@/lib/api/content';
import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch content types from the API
 */
export function useContentTypes() {
  return useQuery({
    queryKey: ['content-types'],
    queryFn: async () => {
      const response = await contentApi.getContentTypes();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - content types don't change often
    retry: 1
  });
}
