'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAcceptInvitation } from '@/features/teams/hooks/use-teams';
import { useAuthStore } from '@/lib/stores/auth-store';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AcceptInvitationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const acceptInvitation = useAcceptInvitation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'unauthenticated'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('unauthenticated');
      return;
    }

    if (!params.token) {
      setStatus('error');
      setErrorMessage('Invalid invitation link.');
      return;
    }

    acceptInvitation.mutate(
      { token: params.token },
      {
        onSuccess: () => {
          setStatus('success');
          setTimeout(() => router.push('/app/team'), 2000);
        },
        onError: (error) => {
          setStatus('error');
          setErrorMessage(error.message || 'Failed to accept invitation.');
        },
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, params.token]);

  if (status === 'unauthenticated') {
    const returnUrl = `/accept-invitation/${params.token}`;
    router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`);
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>Processing your team invitation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {status === 'loading' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm">Accepting invitation...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="font-medium">Invitation accepted!</p>
              <p className="text-muted-foreground text-sm">Redirecting to your team...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-10 w-10 text-destructive" />
              <p className="font-medium">Failed to accept invitation</p>
              <p className="text-muted-foreground text-center text-sm">{errorMessage}</p>
              <Button variant="outline" onClick={() => router.push('/app')}>
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
