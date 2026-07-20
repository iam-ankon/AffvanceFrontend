import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { verifyEmail } from '@/lib/actions/auth';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params.email as string | undefined;
  const uidb64 = params.uid as string | undefined;
  const token = params.token as string | undefined;

  // If we don't have uid and token, show email sent view
  if (!uidb64 || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-100">
          <CardHeader className="flex flex-col items-center space-y-4 text-center">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-10 w-10 text-blue-600" />
              </div>
              <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription className="text-gray-600">
                {email ? (
                  <>
                    We&apos;ve sent a verification email to{' '}
                    <span className="font-semibold text-gray-900">{email}</span>
                  </>
                ) : (
                  'We&apos;ve sent a verification email to your inbox'
                )}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Next steps:</p>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                <li>Check your inbox (and spam folder)</li>
                <li>Click the verification link</li>
                <li>Return here to continue</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-center text-xs text-gray-500">
              This link will expire in 24 hours for security reasons.
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Verify the email on the server
  const result = await verifyEmail(uidb64, token);

  // Successfully verified
  if (result.success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border border-gray-100 p-6">
          <CardHeader className="items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription className="text-gray-600">
                Your email has been successfully verified.
              </CardDescription>
            </div>
          </CardHeader>
          <Button className="mt-4 w-full" asChild>
            <Link href="/login">Continue to Login</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Error state
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md border border-gray-100">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>
                {result.message || 'The verification link is invalid or has expired.'}
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
