'use server';

import { SERVER_API_URL as API_URL } from '@/lib/constants';
import { cookies } from 'next/headers';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  tokens: {
    access: string;
    refresh: string;
  };
}

interface VerifyEmailResult {
  success: boolean;
  message: string;
  data?: LoginResponse;
}

export async function verifyEmail(uidb64: string, token: string): Promise<VerifyEmailResult> {
  try {
    const response = await fetch(`${API_URL}/auth/verify-email/?uid=${uidb64}&token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Verification failed. The link may be invalid or expired.'
      };
    }

    const data: LoginResponse = await response.json();

    // Set auth cookies if tokens are present
    if (data?.tokens) {
      const cookieStore = await cookies();

      // Set access token cookie (expires in 1 day)
      cookieStore.set('access_token', data.tokens.access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });

      // Set refresh token cookie (expires in 7 days)
      cookieStore.set('refresh_token', data.tokens.refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      // Store user data in a cookie (not sensitive data)
      cookieStore.set('user', JSON.stringify(data.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });
    }

    return {
      success: true,
      message: 'Email verified successfully!',
      data
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}

export async function resendVerificationEmail(email: string): Promise<VerifyEmailResult> {
  try {
    const response = await fetch(`${API_URL}/auth/resend-verification/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email }),
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || 'Failed to resend verification email.'
      };
    }

    return {
      success: true,
      message: 'Verification email sent successfully!'
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    };
  }
}