import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { verifyEmail } from '@/lib/actions/auth';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export default async function VerifyEmailSlugPage({ params }: PageProps) {
  const resolvedParams = await params;
  const [uidb64, token] = resolvedParams.slug || [];

  // Verify the email on the server
  let result = { success: false, message: 'Invalid verification link.' };

  if (uidb64 && token) {
    result = await verifyEmail(uidb64, token);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <Button variant="link" className="mb-6 flex items-center text-gray-600" asChild>
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </Button>

        <Card className="border border-gray-100">
          <CardHeader className="flex flex-col items-center space-y-2 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                {result.success ? (
                  <CheckCircle className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl">
              {result.success ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {result.success
                ? 'Your email has been successfully verified. You can now log in to your account.'
                : result.message ||
                  'The verification link is invalid or has expired. Please request a new verification email.'}
            </CardDescription>
          </CardHeader>

          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" asChild>
              <Link href="/login">Go to Login</Link>
            </Button>
            {!result.success && (
              <Button variant="outline" className="w-full bg-transparent" asChild>
                <Link href="/resend-verification">Resend Verification Email</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
