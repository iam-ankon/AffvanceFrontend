'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useActiveSubscription,
  useCreditPackCheckout,
  useCreditPacks,
} from '@/features/subscriptions/hooks/use-subscriptions';
import { usePaddle } from '@/lib/providers/paddle-provider';
import type { CreditPack } from '@/types/subscription';
import { useQueryClient } from '@tanstack/react-query';
import { Coins, Info, Sparkles, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Credit pack catalog. Lets users top up their non-expiring pack wallet.
 *
 * Eligibility: only users with an active subscription can purchase. The
 * backend enforces this with 402; we mirror it in the UI as a warning banner
 * to keep the buy buttons disabled when there's no active sub.
 *
 * Consumption order is handled server-side: subscription credits drain first,
 * pack wallet drains second. We surface that note on the cards.
 */
export function CreditPackCards() {
  const { data: packs, isLoading } = useCreditPacks();
  const { data: activeSub, isLoading: subLoading } = useActiveSubscription();
  const checkout = useCreditPackCheckout();
  const { paddle } = usePaddle();
  const queryClient = useQueryClient();
  const [processingPackId, setProcessingPackId] = useState<string | null>(null);

  const hasActiveSub = !!activeSub && activeSub.is_active;

  // Refresh balances when Paddle reports a completed pack checkout.
  useEffect(() => {
    if (!paddle) return;

    // The Paddle SDK exposes event hooks under different shapes across
    // versions; mirror the same defensive lookup the plan-cards component uses.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const checkoutInstance = (paddle as any).Checkout;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const on = checkoutInstance?.on ?? (paddle as any).on;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const off = checkoutInstance?.off ?? (paddle as any).off;
    if (!on) return;

    const handleCompleted = () => {
      toast.success('Credit pack purchased — credits added to your wallet.');
      queryClient.invalidateQueries({ queryKey: ['subscription-credits'] });
      queryClient.invalidateQueries({ queryKey: ['credit-pack-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['credit-transactions'] });
    };

    on.call(checkoutInstance ?? paddle, 'checkout.completed', handleCompleted);

    return () => {
      if (off) {
        off.call(checkoutInstance ?? paddle, 'checkout.completed', handleCompleted);
      }
    };
  }, [paddle, queryClient]);

  const handleBuy = async (pack: CreditPack) => {
    setProcessingPackId(pack.id);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const result = await checkout.mutateAsync({
        pack_id: pack.id,
        success_url: `${siteUrl}/app/subscription`,
      });

      if (result.transaction_id && paddle) {
        // Inline overlay checkout — same UX as subscription plans
        paddle.Checkout.open({ transactionId: result.transaction_id });
      } else if (result.checkout_url) {
        window.open(result.checkout_url, '_blank');
      }
    } catch {
      // Toast already shown by useCreditPackCheckout onError handler
    } finally {
      setProcessingPackId(null);
    }
  };

  if (isLoading || subLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!packs || packs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Coins className="h-5 w-5 text-amber-500" />
            Top up with a credit pack
          </h3>
          <p className="text-muted-foreground text-sm">
            One-time purchase. Pack credits don&apos;t expire and stack on top of your subscription.
            Used <span className="font-medium">after</span> your subscription credits each period.
          </p>
        </div>
      </div>

      {!hasActiveSub && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Subscribe first to unlock credit packs</AlertTitle>
          <AlertDescription>
            Credit packs are available to active subscribers only.{' '}
            <Link
              href="/app/subscription/plans"
              className="font-medium underline underline-offset-4"
            >
              Choose a plan
            </Link>{' '}
            to enable pack purchases.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packs.map((pack) => {
          const isProcessing = processingPackId === pack.id;
          return (
            <Card
              key={pack.id}
              className={`relative flex flex-col overflow-hidden border-2 transition-all duration-200 ${
                pack.is_featured
                  ? 'border-primary/60 bg-primary/5 shadow-md'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              {pack.is_featured && (
                <Badge className="absolute right-3 top-3 text-[10px] uppercase tracking-wider">
                  Best value
                </Badge>
              )}

              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`rounded-lg p-1.5 ${
                      pack.is_featured
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Sparkles size={14} />
                  </div>
                  <CardTitle className="text-base font-bold">{pack.name}</CardTitle>
                </div>
                {pack.description && (
                  <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                    {pack.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 space-y-4 pb-3">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight">
                    ${pack.price}
                  </span>
                  <span className="text-muted-foreground text-xs font-medium uppercase">
                    {pack.currency}
                  </span>
                  <span className="text-muted-foreground ml-auto text-[10px] uppercase tracking-wider">
                    one-time
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/40 bg-muted/30 p-2.5">
                  <div>
                    <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                      AI Credits
                    </div>
                    <div className="text-sm font-bold">
                      +{pack.ai_credits.toLocaleString()}
                    </div>
                  </div>
                  <div className="border-l border-border/40 pl-2.5">
                    <div className="text-muted-foreground text-[9px] font-bold uppercase tracking-wider">
                      Keyword
                    </div>
                    <div className="text-sm font-bold">
                      +{pack.keyword_credits.toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-muted-foreground text-[10px] leading-relaxed">
                  Never expires · Stacks across purchases · Drains after subscription credits
                </p>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  className="w-full"
                  size="sm"
                  variant={pack.is_featured ? 'default' : 'secondary'}
                  disabled={!hasActiveSub || isProcessing || checkout.isPending}
                  onClick={() => handleBuy(pack)}
                >
                  <Zap className="mr-1.5 h-3.5 w-3.5" />
                  {isProcessing ? 'Opening checkout…' : hasActiveSub ? 'Buy pack' : 'Subscribe to buy'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}