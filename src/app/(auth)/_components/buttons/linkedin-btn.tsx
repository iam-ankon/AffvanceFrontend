'use client';

import { Button } from '@/components/ui/button';
import React from 'react';
import { useLinkedIn } from 'react-linkedin-login-oauth2';

interface LinkedInAuthBtnProps {
  onSuccess?: (code: string) => void;
  onError?: (error: { error: string; errorMessage: string }) => void;
}

export function LinkedinBtn({
  onSuccess = () => {},
  onError = () => {}
}: LinkedInAuthBtnProps = {}) {
  const { linkedInLogin } = useLinkedIn({
    clientId: '86gfwce8pbtmaj',
    redirectUri: `https://affvance.com/linkedin/auth/callback/`,
    onSuccess,
    onError
  });

  return (
    <Button
      variant="outline"
      type="button"
      className="flex w-full items-center justify-center gap-2"
      onClick={linkedInLogin}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="#0A66C2"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.327-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.368-1.85 3.601 0 4.268 2.37 4.268 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM6.814 20.452H3.861V9h2.953v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.225.792 24 1.771 24h20.451C23.2 24 24 23.225 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
      </svg>
      Continue with LinkedIn
    </Button>
  );
}
