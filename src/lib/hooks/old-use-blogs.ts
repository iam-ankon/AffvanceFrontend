import { ApiError, api } from '@/lib/api/client';
import type { Blog, PaginatedResponse } from '@/lib/api/types';
import { UseMutationOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface BlogFilters extends Record<string, unknown> {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: unknown;
}

// Query Keys Factory
export const blogKeys = {
  all: ['blogs'] as const,
  lists: () => [...blogKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown> = {}) => [...blogKeys.lists(), { filters }] as const,
  details: () => [...blogKeys.all, 'detail'] as const,
  detail: (id: string) => [...blogKeys.details(), id] as const
};

// Fetch all blogs
export function useBlogs(
  page = 1,
  limit = 10,
  search?: string,
  filters: Record<string, unknown> = {}
) {
  return useQuery<PaginatedResponse<Blog>>({
    queryKey: blogKeys.list({ page, limit, search, ...filters }),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);

      // Add additional filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      try {
        // const response = await api.get<PaginatedResponse<Blog>>(`/blogs?${params.toString()}`);
        // return response;
        const response = await fetch(`http://localhost:3000/api/blogs?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data as PaginatedResponse<Blog>;
      } catch (error) {
        if (error instanceof ApiError) throw error;

        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch blogs';
        throw new ApiError(errorMessage, 500);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  });
}

// Fetch single blog
export function useBlog(id: string) {
  return useQuery({
    queryKey: blogKeys.detail(id),
    queryFn: async () => {
      try {
        const response = await api.get<Blog>(`/api/blogs/${id}`);
        return response;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          throw new ApiError('Blog not found', 404);
        }
        throw new ApiError('Failed to fetch blog', 500);
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000
  });
}

// Create blog
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Blog) => {
      try {
        const response = await api.post<Blog>('/api/blogs', {
          ...data,
          id: `mock-${Date.now()}`
        });
        return response;
      } catch {
        throw new ApiError('Failed to create blog', 500);
      }
    },
    onMutate: async (newBlog) => {
      await queryClient.cancelQueries({ queryKey: blogKeys.lists() });

      const previousBlogs = queryClient.getQueryData(blogKeys.list({ page: 1, limit: 10 }));

      queryClient.setQueryData<PaginatedResponse<Blog>>(
        blogKeys.list({ page: 1, limit: 10 }),
        (old) => {
          if (!old || !old.data) return old;

          const optimisticBlog: Blog = {
            ...newBlog,
            id: `temp-${Date.now()}`,
            title: newBlog.title || 'New Blog',
            content: newBlog.content || '',
            words: newBlog.words || 0,
            views: newBlog.views || 0,
            published: newBlog.published || false,
            tags: newBlog.tags || [],
            author: newBlog.author,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          return {
            ...old,
            data: [optimisticBlog, ...(Array.isArray(old.data) ? old.data : [])]
          } as PaginatedResponse<Blog>;
        }
      );

      return { previousBlogs };
    },
    onError: (_error, _newBlog, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(blogKeys.list({ page: 1, limit: 10 }), context.previousBlogs);
      }
    },
    onSuccess: (newBlog) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.setQueryData(blogKeys.detail(newBlog.id), newBlog);
    }
  });
}

// Update blog
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Blog) => {
      try {
        const response = await api.put<Blog>(`/api/blogs/${data.id}`, data);
        return response;
      } catch {
        throw new ApiError('Failed to update blog', 500);
      }
    },
    onMutate: async (updatedBlog) => {
      await queryClient.cancelQueries({ queryKey: blogKeys.detail(updatedBlog.id) });

      const previous = queryClient.getQueryData<Blog>(blogKeys.detail(updatedBlog.id));
      queryClient.setQueryData<Blog>(blogKeys.detail(updatedBlog.id), {
        ...previous,
        ...updatedBlog
      });

      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(blogKeys.detail(variables.id), context.previous);
      }
    },
    onSuccess: (updatedBlog) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.setQueryData(blogKeys.detail(updatedBlog.id), updatedBlog);
    }
  });
}

// Delete blog
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.delete(`/api/blogs/${id}`);
        return id;
      } catch {
        throw new ApiError('Failed to delete blog', 500);
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: blogKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: blogKeys.lists() });

      const previous = queryClient.getQueryData<Blog>(blogKeys.detail(id));

      queryClient.removeQueries({ queryKey: blogKeys.detail(id) });
      queryClient.setQueryData<PaginatedResponse<Blog>>(
        blogKeys.list({ page: 1, limit: 10 }),
        (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: Array.isArray(old.data) ? old.data.filter((blog: Blog) => blog.id !== id) : []
          } as PaginatedResponse<Blog>;
        }
      );

      return { previous };
    },
    onError: (_err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(blogKeys.detail(id), context.previous);
      }
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.lists() });
      queryClient.removeQueries({ queryKey: blogKeys.detail(id) });
    }
  });
}

// Publish/unpublish blog
export function usePublishBlog() {
  const queryClient = useQueryClient();

  return useMutation<
    Blog, // return type
    Error, // error type
    { id: string; published: boolean }, // variables type
    { previousBlog?: Blog; previousBlogs?: PaginatedResponse<Blog> } // context type
  >({
    mutationFn: async ({ id, published }) => {
      try {
        const blogId = Number(id);
        console.log('Sending PATCH request to:', `/api/blogs/${blogId}`, { published });
        const response = await api.patch<Blog>(`/api/blogs/${blogId}`, { published });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update publish status';

        console.error('PATCH error:', {
          message: errorMessage,
          error
        });

        throw new ApiError(errorMessage, 500);
      }
    },
    onMutate: async ({ id, published }) => {
      await queryClient.cancelQueries({ queryKey: blogKeys.lists() });
      await queryClient.cancelQueries({ queryKey: blogKeys.detail(id) });

      const previousBlog = queryClient.getQueryData<Blog>(blogKeys.detail(id));
      const previousBlogs = queryClient.getQueryData<PaginatedResponse<Blog>>(blogKeys.list({}));

      if (previousBlog) {
        queryClient.setQueryData(blogKeys.detail(id), { ...previousBlog, published });
      }
      // Optimistically update the tour in the list query
      if (previousBlogs) {
        queryClient.setQueryData<PaginatedResponse<Blog>>(blogKeys.list({}), (old) => {
          if (!old || !old.data) return old;

          return {
            ...old,
            data: Array.isArray(old.data)
              ? old.data.map((blog) => (String(blog.id) === id ? { ...blog, published } : blog))
              : []
          } as PaginatedResponse<Blog>;
        });
      }

      return { previousBlog, previousBlogs };
    },
    onError: (error, variables, context) => {
      if (context?.previousBlog) {
        queryClient.setQueryData(blogKeys.detail(variables.id), context.previousBlog);
      }
      if (context?.previousBlogs) {
        queryClient.setQueryData(blogKeys.list({}), context.previousBlogs);
      }

      toast.error(error.message || 'Failed to update publish status');
    },
    onSuccess: (data, variables) => {
      toast.success(`Blog ${variables.published ? 'published' : 'unpublished'} successfully`);
    }
  });
}

// Prefetch blog
export function usePrefetchBlog() {
  const queryClient = useQueryClient();
  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: blogKeys.detail(id),
      queryFn: () => api.get<Blog>(`/api/blogs/${id}`),
      staleTime: 10 * 60 * 1000
    });
  };
}
