// src/lib/hooks/use-keyword-collections.tsx
import { api } from '@/lib/api/client';
import { type UseQueryResult, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface KeywordCollectionItem {
  id: string;
  keyword: string;
  se_type?: string;
  search_volume?: number;
  competition?: number;
  competition_level?: 'LOW' | 'MEDIUM' | 'HIGH';
  cpc?: number;
  keyword_difficulty?: number;
  difficulty_level?: string;
  last_updated_time?: string;
  main_search_intent?: string;
  user_priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user_notes?: string;
  user_tags?: string[];
  is_selected?: boolean;
  is_custom_keyword?: boolean;
  content_generated?: boolean;
  content_generated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface KeywordCollection {
  id: string;
  title: string;
  description: string;
  status: 'DRAFT' | 'SAVED' | 'ARCHIVED';
  seed_keyword: string;
  location_code: number;
  location_name: string;
  language_code: string;
  language_name: string;
  total_suggestions_received: number;
  total_keywords_saved: number;
  api_cost: number;
  avg_search_volume?: number;
  avg_competition?: number;
  avg_cpc?: number;
  avg_seo_opportunity?: number;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  team?: {
    id: string;
    name: string;
  };
  keywords?: KeywordCollectionItem[];
}

export interface CollectionStats {
  total_collections: number;
  total_keywords: number;
  total_api_cost: number;
  avg_search_volume: number;
  avg_competition: number;
  avg_cpc: number;
  collections_by_status: {
    draft: number;
    saved: number;
    archived: number;
  };
}

export interface CollectionFilters {
  search?: string;
  status?: 'DRAFT' | 'SAVED' | 'ARCHIVED';
  location_name?: string;
  language_code?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface UpdateCollectionPayload {
  title?: string;
  description?: string;
  status?: 'DRAFT' | 'SAVED' | 'ARCHIVED';
}

export interface UpdateKeywordPayload {
  keyword_id: string;
  user_priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user_notes?: string;
  user_tags?: string[];
  is_selected?: boolean;
}

export interface BulkUpdateKeywordsPayload {
  add_keywords?: Array<{
    keyword: string;
    search_volume?: number;
    competition?: number;
    cpc?: number;
    keyword_difficulty?: number;
  }>;
  update_keywords?: UpdateKeywordPayload[];
  delete_keyword_ids?: string[];
}

type CollectionsApiResponse = {
  data?: KeywordCollection[] | { results?: KeywordCollection[]; count?: number };
  results?: KeywordCollection[];
  count?: number;
  next?: string;
  previous?: string;
  [key: string]: unknown;
};

type CollectionDetailApiResponse = {
  data?: KeywordCollection;
  [key: string]: unknown;
};

type CollectionStatsApiResponse = {
  data?: CollectionStats;
  [key: string]: unknown;
};

// Query key factory
export const collectionKeys = {
  all: ['collections'] as const,
  lists: () => [...collectionKeys.all, 'list'] as const,
  list: (filters: CollectionFilters) => [...collectionKeys.lists(), filters] as const,
  details: () => [...collectionKeys.all, 'detail'] as const,
  detail: (id: string) => [...collectionKeys.details(), id] as const,
  stats: () => [...collectionKeys.all, 'stats'] as const
};

/**
 * Fetch all collections with optional filters
 */
export function useCollections(
  filters: CollectionFilters = {}
): UseQueryResult<{ results: KeywordCollection[]; count: number }, Error> {
  return useQuery({
    queryKey: collectionKeys.list(filters),
    queryFn: async () => {
      const params: Record<string, unknown> = {
        page: filters.page ?? 1,
        page_size: filters.page_size ?? 20
      };

      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.location_name) params.location_name = filters.location_name;
      if (filters.language_code) params.language_code = filters.language_code;
      if (filters.ordering) params.ordering = filters.ordering;

      const response = await api.get<CollectionsApiResponse>('/keywords/collections/', {
        params,
        _skipErrorHandler: true
      });

      // Handle different response shapes
      if (Array.isArray(response)) {
        return { results: response, count: response.length };
      }

      if (response.results && Array.isArray(response.results)) {
        return {
          results: response.results,
          count: response.count ?? response.results.length
        };
      }

      const data = response.data as
        | KeywordCollection[]
        | { results?: KeywordCollection[]; count?: number }
        | undefined;

      if (Array.isArray(data)) {
        return { results: data, count: data.length };
      }

      if (data?.results && Array.isArray(data.results)) {
        return {
          results: data.results,
          count: data.count ?? data.results.length
        };
      }

      return { results: [], count: 0 };
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 1
  });
}

/**
 * Fetch a single collection by ID
 */
export function useCollection(id: string): UseQueryResult<KeywordCollection, Error> {
  return useQuery({
    queryKey: collectionKeys.detail(id),
    queryFn: async () => {
      const response = await api.get<CollectionDetailApiResponse>(`/keywords/collections/${id}/`, {
        _skipErrorHandler: true
      });

      let collection: KeywordCollection;

      if (response.data) {
        collection = response.data;
      } else {
        collection = response as unknown as KeywordCollection;
      }

      // Map suggestion_keywords to keywords if needed
      const rawCollection = collection as unknown as {
        suggestion_keywords?: KeywordCollectionItem[];
        keywords?: KeywordCollectionItem[];
      };

      if (rawCollection.suggestion_keywords && !rawCollection.keywords) {
        collection.keywords = rawCollection.suggestion_keywords;
      }

      return collection;
    },
    enabled: !!id,
    staleTime: 30 * 1000,
    retry: 1
  });
}

/**
 * Fetch collection statistics
 */
export function useCollectionStats(): UseQueryResult<CollectionStats, Error> {
  return useQuery({
    queryKey: collectionKeys.stats(),
    queryFn: async () => {
      const response = await api.get<CollectionStatsApiResponse>('/keywords/collections/stats/', {
        _skipErrorHandler: true
      });

      if (response.data) {
        return response.data;
      }

      return response as unknown as CollectionStats;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1
  });
}

/**
 * Update a collection
 */
export function useUpdateCollection() {
  const queryClient = useQueryClient();

  return useMutation<KeywordCollection, Error, { id: string; payload: UpdateCollectionPayload }>({
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch<CollectionDetailApiResponse>(
        `/keywords/collections/${id}/`,
        payload,
        { _skipErrorHandler: true }
      );

      if (response.data) {
        return response.data;
      }

      return response as unknown as KeywordCollection;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.id) });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.stats() });

      toast.success('Collection updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update collection: ' + error.message);
    }
  });
}

/**
 * Delete (archive) a collection
 */
export function useDeleteCollection() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await api.delete(`/keywords/collections/${id}/`, {
        _skipErrorHandler: true
      });
    },
    onSuccess: (_, id) => {
      // Invalidate queries
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.stats() });

      toast.success('Collection deleted successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete collection: ' + error.message);
    }
  });
}

/**
 * Update keywords in a collection (bulk operations)
 */
export function useUpdateKeywords() {
  const queryClient = useQueryClient();

  return useMutation<
    KeywordCollection,
    Error,
    { collectionId: string; payload: BulkUpdateKeywordsPayload }
  >({
    mutationFn: async ({ collectionId, payload }) => {
      const response = await api.patch<CollectionDetailApiResponse>(
        `/keywords/collections/${collectionId}/keywords/`,
        payload,
        { _skipErrorHandler: true }
      );

      if (response.data) {
        return response.data;
      }

      return response as unknown as KeywordCollection;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({
        queryKey: collectionKeys.detail(variables.collectionId)
      });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: collectionKeys.stats() });

      toast.success('Keywords updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update keywords: ' + error.message);
    }
  });
}
