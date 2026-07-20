import { Suspense } from 'react';
import { BloggerOAuthCallbackContent } from './callback-content';

export default function BloggerOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">Completing Google Blogger connection...</p>
        </div>
      }
    >
      <BloggerOAuthCallbackContent />
    </Suspense>
  );
}
