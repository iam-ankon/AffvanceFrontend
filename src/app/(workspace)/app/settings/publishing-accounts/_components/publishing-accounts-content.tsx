'use client';

import CreditDropdown from '@/components/credit-dropdown';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import Title from '@/components/title';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AccountCard } from '@/features/publishing-accounts/components/account-card';
import { AccountDialog } from '@/features/publishing-accounts/components/account-dialog';
import { BloggerConnectDialog } from '@/features/publishing-accounts/components/blogger-connect-dialog';
import {
    useDeletePublishingAccount,
    usePublishingAccounts,
    usePublishingPlatforms
} from '@/features/publishing-accounts/hooks/use-publishing-accounts';
import type { PublishingAccount } from '@/types/publishing';
import { publishingApi } from '@/lib/api/publishing';
import { AlertCircle, Download, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function PublishingAccountsContent() {
    const searchParams = useSearchParams();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [bloggerDialogOpen, setBloggerDialogOpen] = useState(false);
    const [bloggerOauthState, setBloggerOauthState] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<PublishingAccount | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<PublishingAccount | null>(null);
    const [startingBloggerOAuth, setStartingBloggerOAuth] = useState(false);

    useEffect(() => {
        const oauthStatus = searchParams.get('blogger_oauth');
        const state = searchParams.get('state');
        const message = searchParams.get('message');

        if (oauthStatus === 'success' && state) {
            setBloggerOauthState(state);
            setBloggerDialogOpen(true);
            window.history.replaceState({}, '', '/app/settings/publishing-accounts');
        } else if (oauthStatus === 'error') {
            toast.error(message ? decodeURIComponent(message) : 'Blogger connection failed');
            window.history.replaceState({}, '', '/app/settings/publishing-accounts');
        }
    }, [searchParams]);

    const { data: platforms, isLoading: platformsLoading } = usePublishingPlatforms();
    const { data: accounts, isLoading: accountsLoading } = usePublishingAccounts();
    const deleteAccount = useDeletePublishingAccount();

    const handleAddAccount = () => {
        setSelectedAccount(null);
        setDialogOpen(true);
    };

    const handleConnectBlogger = async () => {
        try {
            setStartingBloggerOAuth(true);
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
                const uri = savedRedirectUri || 'the redirect URI from the OAuth start response';
                message = `Google OAuth redirect URI mismatch. Add this exact URL in Google Cloud Console > Credentials > Authorized redirect URIs: ${uri}`;
            }
            toast.error(message);
            setStartingBloggerOAuth(false);
        }
    };

    const handleEditAccount = (account: PublishingAccount) => {
        setSelectedAccount(account);
        setDialogOpen(true);
    };

    const handleDeleteClick = (account: PublishingAccount) => {
        setAccountToDelete(account);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = () => {
        if (accountToDelete) {
            deleteAccount.mutate(accountToDelete.id);
            setDeleteDialogOpen(false);
            setAccountToDelete(null);
        }
    };

    const isLoading = platformsLoading || accountsLoading;

    return (
        <>
            <Header fixed>
                <div className="ml-auto flex items-center gap-2">
                    <CreditDropdown />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <Title title="Publishing Accounts" />
                        <p className="mt-1 text-sm text-muted-foreground">
                            Manage your WordPress, Blogger, and other publishing platform accounts
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" asChild disabled={isLoading}>
                            <a href="https://affvance.com/download-plugin" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                WordPress Plugin
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleConnectBlogger}
                            disabled={isLoading || startingBloggerOAuth}
                        >
                            {startingBloggerOAuth ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Connect Blogger
                        </Button>
                        <Button onClick={handleAddAccount} disabled={isLoading}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Account
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && accounts && accounts.length === 0 && (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
                            <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                    <AlertCircle className="h-10 w-10 text-muted-foreground" />
                                </div>

                                <h3 className="mt-6 text-xl font-semibold">No Publishing Accounts</h3>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    You haven&apos;t connected any publishing accounts yet. Add your first account to start
                                    publishing content to WordPress and other platforms.
                                </p>

                                <Button onClick={handleAddAccount} className="mt-6">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Your First Account
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Accounts Grid */}
                    {!isLoading && accounts && accounts.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {accounts.map((account) => (
                                <AccountCard
                                    key={account.id}
                                    account={account}
                                    onEdit={handleEditAccount}
                                    onDelete={handleDeleteClick}
                                />
                            ))}
                        </div>
                    )}

                </div>
            </Main>

            {/* Add/Edit Dialog */}
            <AccountDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                account={selectedAccount}
                platforms={platforms || []}
            />

            <BloggerConnectDialog
                open={bloggerDialogOpen}
                onOpenChange={setBloggerDialogOpen}
                oauthState={bloggerOauthState}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the publishing account &quot;
                            {accountToDelete?.account_name}&quot;. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteAccount.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
