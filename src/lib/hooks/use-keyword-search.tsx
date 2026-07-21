// src/lib/hooks/use-keyword-search.ts
import { api } from '@/lib/api/client';
import { type UseQueryResult, useMutation, useQuery } from '@tanstack/react-query';

export interface Country {
  location_code: number | null;
  location_name: string;
  country_iso_code: string;
  available_languages: Array<{
    language: {
      language_name: string;
      language_code: string;
    };
    available_sources: string[];
  }>;
}

export interface Location {
  location_code: number;
  location_name: string;
  location_type: string;
  location_code_parent: number | null;
  country_name: string;
  country_iso_code: string;
}

export interface KeywordSuggestion {
  id?: string;
  keyword: string;
  se_type: string;
  search_volume: number;
  competition: number;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
  cpc: number;
  keyword_difficulty: number;
  last_updated_time: string;
  main_search_intent: string;
}

export interface SearchParams {
  keyword: string;
  language_code: string;
  location_code: number;
  limit?: number;
  min_search_volume?: number;
  max_search_volume?: number;
  min_cpc?: number;
  max_cpc?: number;
  min_keyword_difficulty?: number;
  max_keyword_difficulty?: number;
  min_words?: number;
  max_words?: number;
  competition_levels?: string[];
  exclude_keywords?: string[];
  include_keywords?: string[];
  question_only?: boolean;
}

interface KeywordApiInfo {
  cost?: number;
  processing_time?: string;
  tasks_count?: number;
  [key: string]: unknown;
}

interface KeywordSearchApiResponse {
  status_code?: number;
  success?: boolean;
  message?: string;
  path?: string;
  timestamp?: string;
  data?: {
    success?: boolean;
    credits_used?: number;
    credits_remaining?: number;
    requested_limit?: number;
    applied_limit?: number;
    data?: {
      seed_keyword_data?: KeywordSuggestion;
      keywords?: KeywordSuggestion[];
      total_keywords_available?: number;
      api_info?: KeywordApiInfo;
      [key: string]: unknown;
    };
    api_cost?: number;
    processing_time?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KeywordSearchResult {
  keywords: KeywordSuggestion[];
  seedKeyword?: KeywordSuggestion | null;
  totalKeywordsAvailable?: number;
  apiCost?: number;
  processingTime?: string;
  apiInfo?: KeywordApiInfo;
  creditsUsed?: number;
  creditsRemaining?: number;
  requestedLimit?: number;
  appliedLimit?: number;
  raw: KeywordSearchApiResponse;
}

export type SaveKeywordCollectionKeyword = KeywordSuggestion;

export interface SaveKeywordCollectionPayload {
  title: string;
  description: string;
  seed_keyword: string;
  location_code: number;
  location_name: string;
  language_code: string;
  language_name: string;
  total_suggestions_received: number;
  api_cost: number;
  keywords: SaveKeywordCollectionKeyword[];
}

export interface SaveKeywordCollectionApiResponse {
  status_code?: number;
  success?: boolean;
  message?: string;
  path?: string;
  timestamp?: string;
  data?: {
    id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface KeywordLibraryItem {
  id: string;
  keyword: string;
  collection_id?: string;
  collection_title?: string;
  search_volume?: number;
  competition?: number;
  competition_level?: string;
  cpc?: number;
  keyword_difficulty?: number;
  difficulty_level?: string;
  main_search_intent?: string;
  user_priority?: 'low' | 'medium' | 'high' | string;
  is_selected?: boolean;
  content_generated?: boolean;
  content_generated_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

type CountryQueryKey = ['countries', string | undefined];
type LocationQueryKey = ['locations', number | undefined, string | undefined];

// Search countries with debounce
type CountryApiResponse = {
  data?: Country[];
  [key: string]: unknown;
};

type LocationApiResponse = {
  data?: {
    locations?: Location[];
  };
  locations?: Location[];
  [key: string]: unknown;
};

/** `search` is sent to `/keywords/countries/?search=` — prefer ISO-3166 alpha-2 (e.g. `US`) over display names. */
export function useCountrySearch(search?: string): UseQueryResult<Country[], Error> {
  return useQuery<Country[], Error, Country[], CountryQueryKey>({
    queryKey: ['countries', search],
    queryFn: async () => {
      if (!search) {
        return [];
      }
      const response = await api.get<CountryApiResponse | Country[]>(`/keywords/countries/`, {
        params: { search },
        _skipErrorHandler: true
      });
      const data = Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);
      
      // Format country names to have a space after each comma
      return data.map(country => ({
        ...country,
        location_name: country.location_name.replace(/,/g, ', ')
      }));
    },
    enabled: !!search,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    // Add this to ensure we're working with the latest data
    refetchOnWindowFocus: false,
    // Add this to prevent unnecessary refetches
    refetchOnMount: false
  });
}

// Search locations within a country
export function useLocationSearch(
  countryCode?: number,
  locationType?: string
): UseQueryResult<{ locations: Location[] }, Error> {
  return useQuery<{ locations: Location[] }, Error, { locations: Location[] }, LocationQueryKey>({
    queryKey: ['locations', countryCode, locationType],
    queryFn: async () => {
      if (!countryCode) {
        return { locations: [] };
      }
      const params: Record<string, string | number> = { limit: 200 };
      if (locationType) params.location_type = locationType;
      const response = await api.get<LocationApiResponse>(
        `/keywords/countries/${countryCode}/locations/`,
        {
          params,
          _skipErrorHandler: true
        }
      );
      
      const locations = (Array.isArray(response.locations) 
        ? response.locations 
        : response.data?.locations) ?? [];

      // Format location names to have a space after each comma
      const formattedLocations = locations.map(loc => ({
        ...loc,
        location_name: loc.location_name.replace(/,/g, ', ')
      }));

      return { locations: formattedLocations };
    },
    enabled: !!countryCode,
    // Locations are stable — cache for 24 h so repeat country selections are instant.
    staleTime: 24 * 60 * 60 * 1000,
    // The first request for an unsynced country triggers a DataForSEO fetch on
    // the backend (a few seconds).  Give it a longer timeout and retry once.
    retry: 2,
    retryDelay: 1500,
    refetchOnWindowFocus: false,
  });
}

// Search for keywords
export function useKeywordSearch() {
  return useMutation<KeywordSearchResult, Error, SearchParams>({
    mutationFn: async (params: SearchParams) => {
      const response = await api.post<KeywordSearchApiResponse>('/keywords/suggestions/', params, {
        _skipErrorHandler: true
      });

      const nestedData = response?.data?.data;
      const keywords = Array.isArray(nestedData?.keywords) ? nestedData.keywords : [];

      return {
        keywords,
        seedKeyword: nestedData?.seed_keyword_data ?? null,
        totalKeywordsAvailable: nestedData?.total_keywords_available,
        apiCost: response?.data?.api_cost,
        processingTime: response?.data?.processing_time,
        apiInfo: nestedData?.api_info,
        creditsUsed: response?.data?.credits_used,
        creditsRemaining: response?.data?.credits_remaining,
        requestedLimit: response?.data?.requested_limit,
        appliedLimit: response?.data?.applied_limit,
        raw: response
      };
    }
  });
}

// Save keyword suggestions to a collection
export function useSaveKeywordCollection() {
  return useMutation<SaveKeywordCollectionApiResponse, Error, SaveKeywordCollectionPayload>({
    mutationFn: async (payload: SaveKeywordCollectionPayload) => {
      return api.post<SaveKeywordCollectionApiResponse, SaveKeywordCollectionPayload>(
        '/keywords/collections/save/',
        payload,
        { _skipErrorHandler: true }
      );
    }
  });
}

type KeywordLibrarySearchResponse =
  | KeywordLibraryItem[]
  | { data?: KeywordLibraryItem[];[key: string]: unknown }
  | { results?: KeywordLibraryItem[];[key: string]: unknown }
  | {
    data?: { results?: KeywordLibraryItem[];[key: string]: unknown };
    [key: string]: unknown;
  };

export function useKeywordLibrarySearch(params: {
  search?: string;
  page?: number;
  page_size?: number;
}): UseQueryResult<KeywordLibraryItem[], Error> {
  const page = params.page ?? 1;
  const pageSize = params.page_size ?? 10;
  const search = params.search ?? '';

  return useQuery<KeywordLibraryItem[], Error>({
    queryKey: ['keyword-library-search', search, page, pageSize],
    queryFn: async () => {
      const response = await api.get<KeywordLibrarySearchResponse>('/keywords/search/', {
        params: {
          page,
          page_size: pageSize,
          ...(search ? { search } : {})
        },
        _skipErrorHandler: true
      });

      // Supported shapes:
      // 1) KeywordLibraryItem[]
      // 2) { data: KeywordLibraryItem[] }
      // 3) { results: KeywordLibraryItem[] }
      // 4) { data: { results: KeywordLibraryItem[] } }
      if (Array.isArray(response)) return response;

      const rAny = response as unknown as {
        data?: unknown;
        results?: unknown;
      };

      if (Array.isArray(rAny?.results)) return rAny.results as KeywordLibraryItem[];
      if (Array.isArray(rAny?.data)) return rAny.data as KeywordLibraryItem[];

      const nested = rAny?.data as { results?: unknown } | undefined;
      if (Array.isArray(nested?.results)) return nested.results as KeywordLibraryItem[];

      return [];
    },
    staleTime: 30 * 1000,
    retry: 1
  });
}

// Get keyword suggestions with query key factory
export const keywordKeys = {
  all: ['keywords'] as const,
  lists: () => [...keywordKeys.all, 'list'] as const,
  list: (filters: SearchParams) => [...keywordKeys.lists(), { filters }] as const,
  detail: (id: string) => [...keywordKeys.all, id] as const
};

// Get keyword suggestions with query key
export function useGetKeywordSuggestions(params: SearchParams, options = {}) {
  return useQuery({
    queryKey: keywordKeys.list(params),
    queryFn: async () => {
      const response = await api.get('/keywords/suggestions/', {
        params,
        _skipErrorHandler: true
      });
      return response;
    },
    ...options,
    enabled: !!params.keyword && !!params.language_code && !!params.location_code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}
