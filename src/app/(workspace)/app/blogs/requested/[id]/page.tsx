import { Main } from '@/components/layout/main';
import { RequestedBlogDetails } from '@/features/blogs/components/requested/requested-blog-details';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import CreditDropdown from '@/components/credit-dropdown';
import { ProfileDropdown } from '@/components/profile-dropdown';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function RequestedBlogDetailsPage({ params }: PageProps) {
    const { id } = await params;

    return (
        <>
            <Header fixed>
                <div className="ml-auto flex items-center gap-2">
                    <CreditDropdown />
                    <ProfileDropdown />
                </div>
            </Header>
            <Main>
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 gap-1 text-muted-foreground hover:text-foreground">
                        <Link href="/app/blogs/requested">
                            <ChevronLeft className="h-4 w-4" />
                            Back to Requests
                        </Link>
                    </Button>
                </div>

                <Suspense fallback={<div className="p-4">Loading details...</div>}>
                    <RequestedBlogDetails id={id} />
                </Suspense>
            </Main>
        </>
    );
}
