import { api } from '@/lib/api/client';
import { useMutation } from '@tanstack/react-query';

export interface UnsplashImage {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  alt_description: string;
  color: string;
  photographer: {
    name: string;
    url: string;
  };
  attribution_html: string;
  download_location: string;
  unsplash_url: string;
  source: string;
}

interface ImageSearchResponse {
  data?: {
    images: UnsplashImage[];
    query: string;
    total: number;
  };
  [key: string]: unknown;
}

export function useImageSearch() {
  return useMutation<UnsplashImage[], Error, { query: string; count?: number }>({
    mutationFn: async ({ query, count = 9 }) => {
      const response = await api.get<ImageSearchResponse>('/content/image-search/', {
        params: { query, count },
        _skipErrorHandler: true
      });
      return response?.data?.images ?? [];
    }
  });
}
