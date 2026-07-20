import { getArticleTemplates, type ArticleStructureType, type ArticleTemplate } from '@/app/data/templates';
import { useContentTypes } from './use-content-types';

/**
 * Hook to get article templates from API with fallback to hardcoded templates
 */
export function useArticleTemplates() {
  const { data: contentTypesResponse, isLoading, error } = useContentTypes();

  const contentTypes = contentTypesResponse?.data?.results;
  const templates = getArticleTemplates(contentTypes);

  return {
    templates,
    isLoading,
    error,
    contentTypes
  };
}

/**
 * Hook to get a specific template by structure type
 */
export function useArticleTemplate(structureType: ArticleStructureType) {
  const { templates, isLoading, error } = useArticleTemplates();

  return {
    template: templates[structureType] || templates.blog,
    isLoading,
    error,
    allTemplates: templates
  };
}
