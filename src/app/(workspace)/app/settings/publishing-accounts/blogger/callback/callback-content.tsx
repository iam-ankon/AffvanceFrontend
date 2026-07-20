'use client';

import { publishingApi } from '@/lib/api/publishing';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

export function BloggerOAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) {
      return;
    }
    handledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const redirectWithError = (message: string) => {
      toast.error(message);
      router.replace(
        `/app/settings/publishing-accounts?blogger_oauth=error&message=${encodeURIComponent(message)}`
      );
    };

    if (error) {
      const savedRedirectUri = sessionStorage.getItem('blogger_oauth_redirect_uri');
      let message = error;
      if (error === 'redirect_uri_mismatch' || error.includes('redirect_uri_mismatch')) {
        const uri = savedRedirectUri || 'the redirect URI from the OAuth start response';
        message = `Google OAuth redirect URI mismatch. Add this exact URL in Google Cloud Console > Credentials > Authorized redirect URIs: ${uri}`;
      }
      redirectWithError(message);
      return;
    }

    if (!code || !state) {
      redirectWithError('Google did not return an authorization code. Please try again.');
      return;
    }

    publishingApi
      .exchangeBloggerOAuth({ code, state })
      .then(() => {
        router.replace(
          `/app/settings/publishing-accounts?blogger_oauth=success&state=${encodeURIComponent(state)}`
        );
      })
      .catch((exchangeError: Error) => {
        redirectWithError(exchangeError.message || 'Failed to complete Blogger connection');
      });
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Completing Google Blogger connection...</p>
    </div>
  );
}
