'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { publishingApi } from '@/lib/api/publishing';
import type { PublishingAccount, PublishingPlatform } from '@/types/publishing';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import {
  useCreatePublishingAccount,
  useUpdatePublishingAccount
} from '../hooks/use-publishing-accounts';

const accountSchema = z
  .object({
    platform: z.string().min(1, 'Platform is required'),
    account_name: z.string().optional(),
    site_url: z.string().optional(),
    username: z.string().optional(),
    api_key: z.string().optional(),
    platform_type: z.enum(['wordpress', 'blogger', 'devto']).optional()
  })
  .superRefine((data, ctx) => {
    if (data.platform_type === 'blogger') {
      return;
    }

    if (data.platform_type === 'devto') {
      if (!data.account_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Account name is required',
          path: ['account_name']
        });
      }
      return;
    }

    if (!data.account_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Account name is required',
        path: ['account_name']
      });
    }
    if (!data.site_url?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Must be a valid URL',
        path: ['site_url']
      });
    } else {
      try {
        z.string().url().parse(data.site_url);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Must be a valid URL',
          path: ['site_url']
        });
      }
    }
    if (!data.username?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Username is required',
        path: ['username']
      });
    }
  });

type AccountFormData = z.infer<typeof accountSchema>;

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account?: PublishingAccount | null;
  platforms: PublishingPlatform[];
}

export function AccountDialog({ open, onOpenChange, account, platforms }: AccountDialogProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [startingBloggerOAuth, setStartingBloggerOAuth] = useState(false);
  const isEditMode = !!account;

  const createAccount = useCreatePublishingAccount();
  const updateAccount = useUpdatePublishingAccount();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      platform: '',
      platform_type: undefined,
      account_name: '',
      site_url: '',
      username: '',
      api_key: ''
    }
  });

  const selectedPlatformId = watch('platform');
  const selectedPlatform = useMemo(
    () => platforms.find((platform) => String(platform.id) === selectedPlatformId),
    [platforms, selectedPlatformId]
  );
  const isBlogger = selectedPlatform?.platform_type === 'blogger';
  const isDevto = selectedPlatform?.platform_type === 'devto';

  useEffect(() => {
    if (
      selectedPlatform?.platform_type === 'blogger' ||
      selectedPlatform?.platform_type === 'wordpress' ||
      selectedPlatform?.platform_type === 'devto'
    ) {
      setValue('platform_type', selectedPlatform.platform_type);
    } else {
      setValue('platform_type', undefined);
    }
    if (isBlogger) {
      clearErrors();
    }
  }, [selectedPlatform?.platform_type, isBlogger, setValue, clearErrors]);

  useEffect(() => {
    if (open && account) {
      reset({
        platform: String(account.platform),
        account_name: account.account_name,
        site_url: account.site_url,
        username: account.username,
        api_key: ''
      });
    } else if (open && !account) {
      const defaultPlatform = platforms.length > 0 ? String(platforms[0].id) : '';
      reset({
        platform: defaultPlatform,
        account_name: '',
        site_url: '',
        username: '',
        api_key: ''
      });
    } else if (!open) {
      reset({
        platform: '',
        account_name: '',
        site_url: '',
        username: '',
        api_key: ''
      });
      setSubmissionError(null);
    }
  }, [open, account, reset, platforms]);

  const handleBloggerConnect = async () => {
    if (!selectedPlatformId) {
      toast.error('Select Blogger as the platform first');
      return;
    }

    try {
      setStartingBloggerOAuth(true);
      setSubmissionError(null);
      const response = await publishingApi.startBloggerOAuth();
      const authUrl = response?.data?.auth_url;
      const redirectUri = response?.data?.redirect_uri;
      if (!authUrl) {
        throw new Error('Server did not return a Google sign-in URL');
      }
      if (redirectUri) {
        sessionStorage.setItem('blogger_oauth_redirect_uri', redirectUri);
      }
      window.location.assign(authUrl);
    } catch (error) {
      let message =
        error instanceof Error ? error.message : 'Failed to start Blogger connection';
      const savedRedirectUri = sessionStorage.getItem('blogger_oauth_redirect_uri');
      if (message.toLowerCase().includes('redirect_uri_mismatch')) {
        const uri = savedRedirectUri || 'the redirect URI shown in Settings > Publishing Accounts';
        message = `Google OAuth redirect URI mismatch. In Google Cloud Console, add this exact URL under Credentials > Authorized redirect URIs: ${uri}`;
      }
      setSubmissionError(message);
      toast.error(message);
      setStartingBloggerOAuth(false);
    }
  };

  const onSubmit = async (data: AccountFormData) => {
    if (isBlogger && !isEditMode) {
      await handleBloggerConnect();
      return;
    }

    try {
      setSubmissionError(null);

      if (isEditMode) {
        const payload: Record<string, string> = {
          account_name: data.account_name || account.account_name
        };

        if (!isDevto) {
          payload.site_url = data.site_url || '';
          payload.username = data.username || '';
        }

        if (data.api_key && data.api_key.trim()) {
          payload.api_key = data.api_key;
        }

        await updateAccount.mutateAsync({ id: account.id, payload });
      } else {
        if (isDevto) {
          if (!data.api_key?.trim()) {
            throw new Error('Dev.to API key is required');
          }
          await createAccount.mutateAsync({
            platform: data.platform,
            account_name: data.account_name || 'Dev.to',
            api_key: data.api_key
          });
        } else {
          if (!data.api_key || !data.api_key.trim()) {
            throw new Error('Password/API Key is required');
          }

          await createAccount.mutateAsync({
            ...data,
            account_name: data.account_name || '',
            site_url: data.site_url || '',
            username: data.username || '',
            api_key: data.api_key
          });
        }
      }

      onOpenChange(false);
      reset();
      setSubmissionError(null);
    } catch (error) {
      const defaultMessage = isDevto
        ? 'Failed to connect Dev.to. Check your API key from dev.to Settings > Extensions.'
        : 'Connection to the WordPress site failed! Please review the site domain, login credentials, and confirm that the Affvance plugin is installed and activated in your WordPress admin';
      setSubmissionError(error instanceof Error ? error.message : defaultMessage);
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Publishing Account' : 'Add Publishing Account'}</DialogTitle>
          <DialogDescription>
            {isBlogger && !isEditMode
              ? 'Connect your Google Blogger account with OAuth. No password is required.'
              : isDevto && !isEditMode
                ? 'Paste your Dev.to API key from Settings > Extensions > DEV Community API Keys.'
              : isEditMode
                ? 'Update your publishing account credentials and settings.'
                : 'Connect a new publishing platform to start publishing content.'}
          </DialogDescription>
        </DialogHeader>

        {submissionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {submissionError}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platform">Platform *</Label>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value || undefined}
                  disabled={isEditMode}
                >
                  <SelectTrigger id="platform" className="w-full">
                    <SelectValue placeholder="Select a platform">
                      {field.value
                        ? platforms.find((p) => String(p.id) === field.value)?.name
                        : 'Select a platform'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {platforms.length > 0 ? (
                      platforms.map((platform) => (
                        <SelectItem key={platform.id} value={String(platform.id)}>
                          {platform.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading platforms...
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform && (
              <p className="text-sm text-red-600">{errors.platform.message}</p>
            )}
          </div>

          {isBlogger && !isEditMode ? (
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Affvance will ask Google for permission to publish posts to your Blogger site.
                Use the Google account that owns the blog you want to connect.
              </p>
              <Button
                type="button"
                className="w-full"
                disabled={startingBloggerOAuth || !selectedPlatformId}
                onClick={() => void handleBloggerConnect()}
              >
                {startingBloggerOAuth && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Connect with Google
              </Button>
            </div>
          ) : isDevto ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name *</Label>
                <Input
                  id="account_name"
                  placeholder="My Dev.to Profile"
                  {...register('account_name')}
                />
                {errors.account_name && (
                  <p className="text-sm text-red-600">{errors.account_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">
                  {isEditMode
                    ? 'Dev.to API Key (leave empty to keep current)'
                    : 'Dev.to API Key *'}
                </Label>
                <div className="relative">
                  <Input
                    id="api_key"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? '••••••••' : 'Paste your Dev.to API key'}
                    autoComplete="off"
                    {...register('api_key')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.api_key && <p className="text-sm text-red-600">{errors.api_key.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Get your key from dev.to → Settings → Extensions → DEV Community API Keys
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="account_name">Account Name *</Label>
                <Input
                  id="account_name"
                  placeholder="My WordPress Blog"
                  {...register('account_name')}
                />
                {errors.account_name && (
                  <p className="text-sm text-red-600">{errors.account_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_url">Site URL *</Label>
                <Input
                  id="site_url"
                  type="url"
                  placeholder="https://yourblog.com"
                  {...register('site_url')}
                />
                {errors.site_url && <p className="text-sm text-red-600">{errors.site_url.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="admin"
                  autoComplete="username"
                  {...register('username')}
                />
                {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="api_key">
                  {isEditMode
                    ? 'Password / Application Password (leave empty to keep current)'
                    : 'Password / Application Password *'}
                </Label>
                <div className="relative">
                  <Input
                    id="api_key"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditMode ? '••••••••' : 'Enter your password or app password'}
                    autoComplete={isEditMode ? 'new-password' : 'current-password'}
                    {...register('api_key')}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.api_key && <p className="text-sm text-red-600">{errors.api_key.message}</p>}
                <p className="text-xs text-muted-foreground">
                  For WordPress, we recommend using an Application Password instead of your main
                  password.
                </p>
              </div>
            </>
          )}

          {!(isBlogger && !isEditMode) && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createAccount.isPending || updateAccount.isPending}
              >
                {(isSubmitting || createAccount.isPending || updateAccount.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditMode ? 'Update Account' : 'Add Account'}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
