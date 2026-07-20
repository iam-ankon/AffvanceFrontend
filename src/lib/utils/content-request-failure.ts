import type { ContentRequestData } from '@/lib/hooks/use-content-requests';

/**
 * Build a user-facing failure summary for a content request detail page.
 */
export function getContentRequestFailureSummary(data: ContentRequestData): string | null {
  const failedItems =
    data.generated_contents?.filter(
      (item) =>
        item.status?.toLowerCase() === 'failed' &&
        typeof item.error_message === 'string' &&
        item.error_message.trim() !== ''
    ) ?? [];

  const itemErrors = [
    ...new Set(failedItems.map((item) => item.error_message!.trim()))
  ];

  if (itemErrors.length === 1) {
    return itemErrors[0];
  }

  if (itemErrors.length > 1) {
    return itemErrors.join(' • ');
  }

  if (data.error_message?.trim()) {
    return data.error_message.trim();
  }

  const requestFailed = data.status?.toLowerCase() === 'failed';
  const hasFailedKeywords = (data.failed_keywords ?? 0) > 0;

  if (requestFailed || hasFailedKeywords) {
    return 'Article generation failed. Please review your settings and try again.';
  }

  return null;
}

export function hasContentRequestFailures(data: ContentRequestData): boolean {
  return getContentRequestFailureSummary(data) !== null;
}
