import Link from 'next/link';

import LoginForm from '../../_components/forms/login-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm />
      {/* <p className="text-muted-foreground px-8 text-center text-sm">
        By clicking sign in, you agree to our{' '}
        <a href="/terms" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p> */}

      {/* Register link here */}
      <p className="text-muted-foreground text-center text-sm">
        Don’t have an account?{' '}
        <Link href="/register" className="hover:text-primary underline underline-offset-4">
          Register
        </Link>
      </p>
    </div>
  );
}
