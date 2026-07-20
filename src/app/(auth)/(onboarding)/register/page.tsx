import Link from 'next/link';

import RegisterForm from '../../_components/forms/register-form';

export default function Page() {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Enter your details below to register your account
        </p>
      </div>
      <RegisterForm />
      {/* <p className="text-muted-foreground px-8 text-center text-sm">
        By clicking register, you agree to our{' '}
        <a href="/terms" className="hover:text-primary underline underline-offset-4">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="hover:text-primary underline underline-offset-4">
          Privacy Policy
        </a>
      </p> */}

      {/* Add login link */}
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="hover:text-primary underline underline-offset-4">
          Login
        </Link>
      </p>
    </div>
  );
}
