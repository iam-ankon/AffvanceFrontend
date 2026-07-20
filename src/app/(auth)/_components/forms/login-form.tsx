'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLogin } from '@/lib/hooks/use-auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { GoogleBtn } from '../buttons/google-btn';
import { LinkedinBtn } from '../buttons/linkedin-btn';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const login = useLogin();

  const getFriendlyError = (error: unknown): { title: string; description?: string } => {
    const raw = error instanceof Error ? error.message : String(error);
    const lower = raw.toLowerCase();

    if (lower.includes('no active account')) {
      return {
        title: 'Sign in failed',
        description:
          'Invalid email or password, or your account is not yet verified. Please check your inbox for the verification email.'
      };
    }
    if (lower.includes('invalid credentials') || lower.includes('wrong password')) {
      return { title: 'Invalid email or password', description: 'Please double-check and try again.' };
    }
    if (lower.includes('network') || lower.includes('connect')) {
      return { title: 'Connection error', description: 'Unable to reach the server. Please check your internet connection.' };
    }
    return { title: 'Sign in failed', description: raw || 'An unexpected error occurred.' };
  };

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      await login.mutateAsync(values, {
        onSuccess: (data) => {
          if (data?.user) {
            toast.success('Login successful!');
            router.push('/app/blogs/new');
            router.refresh();
          } else {
            throw new Error('Invalid response from server');
          }
        }
      });
    } catch (error) {
      const { title, description } = getFriendlyError(error);
      toast.error(title, { description });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="you@example.com"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background text-muted-foreground px-2">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <GoogleBtn />
        <LinkedinBtn />
      </div>
    </div>
  );
}
