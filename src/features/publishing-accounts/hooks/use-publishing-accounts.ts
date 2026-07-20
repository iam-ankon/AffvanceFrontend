import { publishingApi } from '@/lib/api/publishing';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  PublishingAccountCreatePayload,
  PublishingAccountUpdatePayload,
  WordPressCategory,
  WordPressTag
} from '@/types/publishing';

export const PUBLISHING_QUERY_KEYS = {
  PLATFORMS: ['publishing', 'platforms'] as const,
  ACCOUNTS: ['publishing', 'accounts'] as const,
  ACCOUNT: (id: string) => ['publishing', 'account', id] as const,
  CATEGORIES: (id: string) => ['publishing', 'categories', id] as const,
  TAGS: (id: string) => ['publishing', 'tags', id] as const
};

// Get all publishing platforms
export function usePublishingPlatforms() {
  return useQuery({
    queryKey: PUBLISHING_QUERY_KEYS.PLATFORMS,
    queryFn: async () => {
      const response = await publishingApi.getPlatforms();
      return response.data.results;
    }
  });
}

// Get all publishing accounts
export function usePublishingAccounts() {
  return useQuery({
    queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS,
    queryFn: async () => {
      const response = await publishingApi.getAccounts();
      return response.data.results;
    }
  });
}

// Get single publishing account
export function usePublishingAccount(id: string, enabled = true) {
  return useQuery({
    queryKey: PUBLISHING_QUERY_KEYS.ACCOUNT(id),
    queryFn: async () => {
      const response = await publishingApi.getAccount(id);
      return response.data;
    },
    enabled
  });
}

// Create publishing account
export function useCreatePublishingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PublishingAccountCreatePayload) => {
      const response = await publishingApi.createAccount(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS });
      toast.success('Publishing account created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create publishing account');
    }
  });
}

// Update publishing account
export function useUpdatePublishingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PublishingAccountUpdatePayload }) => {
      const response = await publishingApi.updateAccount(id, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS });
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNT(variables.id) });
      toast.success('Publishing account updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update publishing account');
    }
  });
}

// Delete publishing account
export function useDeletePublishingAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await publishingApi.deleteAccount(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS });
      toast.success('Publishing account deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete publishing account');
    }
  });
}

// Test connection
export function useTestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await publishingApi.testConnection(id);
      return response.data;
    },
    onSuccess: (data, accountId) => {
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNTS });
      queryClient.invalidateQueries({ queryKey: PUBLISHING_QUERY_KEYS.ACCOUNT(accountId) });

      if (data.success) {
        toast.success(data.message || 'Connection successful!');
      } else {
        toast.error(data.message || 'Connection failed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to test connection');
    }
  });
}

// Fetch categories
interface FetchCategoriesData {
  categories: WordPressCategory[];
  total: number;
  cached: boolean;
}

export function useFetchCategories(accountId: string) {
  return useMutation<FetchCategoriesData, Error, boolean | void>({
    mutationFn: async (forceRefresh = false) => {
      const response = await publishingApi.fetchCategories(accountId, forceRefresh as boolean);
      return response.data as FetchCategoriesData;
    },
    onSuccess: (data) => {
      toast.success(`Fetched ${data.categories.length} categories successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch categories');
    }
  });
}

// Fetch tags
interface FetchTagsData {
  tags: WordPressTag[];
  total: number;
  cached: boolean;
}

export function useFetchTags(accountId: string) {
  return useMutation<FetchTagsData, Error, boolean | void>({
    mutationFn: async (forceRefresh = false) => {
      const response = await publishingApi.fetchTags(accountId, forceRefresh as boolean);
      return response.data as FetchTagsData;
    },
    onSuccess: (data) => {
      toast.success(`Fetched ${data.tags.length} tags successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to fetch tags');
    }
  });
}
