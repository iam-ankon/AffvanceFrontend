'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useActiveSubscription,
  useBillingPortal,
  useCancelSubscription,
  useChangePlan,
  useCreditBalance,
  useCreditTransactions,
  useReactivateSubscription,
  useSubscriptionHistory,
  useSubscriptionPlans,
  useToggleAutoRenew,
} from '@/features/subscriptions/hooks/use-subscriptions';
import type { CreditTransaction, SubscriptionHistoryItem, SubscriptionPlan } from '@/types/subscription';
import { Coins, ExternalLink, History, RefreshCw, Sparkles, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { CreditPackPurchasesCard } from './credit-pack-purchases';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  trialing: 'secondary',
  cancelled: 'destructive',
  expired: 'destructive',
  paused: 'outline',
  pending: 'secondary',
  past_due: 'destructive',
};

function ChangePlanDialog({ subscriptionId }: { subscriptionId: string }) {
  const [open, setOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { data: activeSub } = useActiveSubscription();
  const changePlan = useChangePlan();

  const filteredPlans = plans?.filter((p: SubscriptionPlan) => p.billing_cycle === selectedCycle) ?? [];

  const handleChangePlan = async (plan: SubscriptionPlan) => {
    await changePlan.mutateAsync({
      id: subscriptionId,
      data: { plan_id: plan.id, billing_cycle: selectedCycle },
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Change Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Change Your Plan</DialogTitle>
          <DialogDescription>
            Choose a new plan. Proration will be applied immediately.
          </DialogDescription>
        </DialogHeader>

        {/* Billing cycle toggle */}
        <div className="flex items-center justify-center gap-4 py-2">
          <span className={`text-sm font-medium ${selectedCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <button
            onClick={() => setSelectedCycle(selectedCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="relative h-6 w-12 rounded-full bg-muted p-1 transition-colors"
          >
            <div
              className={`h-4 w-4 rounded-full bg-primary shadow-sm transition-transform duration-200 ${
                selectedCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${selectedCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredPlans.map((plan: SubscriptionPlan) => {
              const isCurrent =
                activeSub?.plan_details?.id === plan.id && activeSub?.plan_details?.billing_cycle === selectedCycle;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-lg border p-4 ${
                    isCurrent ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                >
                  {isCurrent && (
                    <Badge className="absolute -top-2 right-3 text-xs">Current</Badge>
                  )}
                  <div className="mb-3">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-2xl font-bold">
                      ${plan.price}
                      <span className="text-muted-foreground text-sm font-normal">
                        /{plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                  </div>
                  <div className="text-muted-foreground mb-3 space-y-0.5 text-xs">
                    <div>AI Credits: {plan.ai_credits.toLocaleString()}/mo</div>
                    <div>Keyword Credits: {plan.keyword_credits.toLocaleString()}/mo</div>
                    {plan.is_team_plan && <div>Team Members: up to {plan.max_team_members}</div>}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    variant={isCurrent ? 'outline' : 'default'}
                    disabled={isCurrent || changePlan.isPending}
                    onClick={() => handleChangePlan(plan)}
                  >
                    {isCurrent ? 'Current Plan' : changePlan.isPending ? 'Processing...' : 'Switch to this plan'}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function SubscriptionDashboard() {
  const { data: sub, isLoading: subLoading } = useActiveSubscription();
  const { data: credits } = useCreditBalance();
  const { data: transactions } = useCreditTransactions();
  const { data: history } = useSubscriptionHistory();
  const cancelMutation = useCancelSubscription();
  const reactivateMutation = useReactivateSubscription();
  const toggleAutoRenew = useToggleAutoRenew();
  const { refetch: fetchBillingPortal } = useBillingPortal();
  const [cancelReason, setCancelReason] = useState('');

  const handleManageBilling = async () => {
    const { data } = await fetchBillingPortal();
    if (data?.update_payment_url) {
      window.open(data.update_payment_url, '_blank');
    }
  };

  if (subLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  // No subscription state
  if (!sub) {
    const hasWalletCredits =
      !!credits && (credits.pack_keyword_credits > 0 || credits.pack_ai_credits > 0);

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Sparkles className="text-muted-foreground mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">No Active Subscription</h3>
            <p className="text-muted-foreground mb-6 text-center text-sm">
              Subscribe to a plan to start generating content and researching keywords.
              {hasWalletCredits && ' Your credit pack balance is preserved and ready to use once you subscribe.'}
            </p>
            <Button asChild>
              <Link href="/app/subscription/plans">Choose a Plan</Link>
            </Button>
          </CardContent>
        </Card>

        {hasWalletCredits && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-4 w-4 text-amber-500" />
                Credit Pack Wallet
              </CardTitle>
              <CardDescription>
                Pack credits never expire. They&apos;ll be consumed once you have an active subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wider">AI Credits</div>
                <div className="text-2xl font-bold">{credits?.pack_ai_credits.toLocaleString() ?? 0}</div>
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                <div className="text-muted-foreground text-xs uppercase tracking-wider">Keyword Credits</div>
                <div className="text-2xl font-bold">{credits?.pack_keyword_credits.toLocaleString() ?? 0}</div>
              </div>
            </CardContent>
          </Card>
        )}

        <CreditPackPurchasesCard />
      </div>
    );
  }

  const planDetails = sub.plan_details;
  const aiPercent = planDetails?.ai_credits
    ? Math.round((sub.ai_credits_remaining / planDetails.ai_credits) * 100)
    : 0;
  const kwPercent = planDetails?.keyword_credits
    ? Math.round((sub.keyword_credits_remaining / planDetails.keyword_credits) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>{planDetails?.name ?? 'Plan'}</CardTitle>
            <CardDescription>
              {sub.is_team_subscription ? 'Team' : 'Individual'} subscription
              {sub.is_trial && ' (Trial)'}
              {' · '}
              {planDetails?.billing_cycle === 'yearly' ? 'Annual (monthly credits)' : 'Monthly'}
            </CardDescription>
          </div>
          <Badge variant={statusVariant[sub.status] ?? 'outline'}>
            {sub.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block font-medium text-foreground">Billing Period</span>
              {new Date(sub.current_period_start).toLocaleDateString()} &mdash;{' '}
              {new Date(sub.current_period_end).toLocaleDateString()}
            </div>
            <div>
              <span className="block font-medium text-foreground">Days Remaining</span>
              {sub.days_remaining} days
            </div>
          </div>

          {/* Auto-renew toggle */}
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <div>
              <p className="text-sm font-medium">Auto-renew</p>
              <p className="text-muted-foreground text-xs">
                {sub.auto_renew
                  ? 'Your subscription renews automatically'
                  : 'Subscription will not renew — expires at period end'}
              </p>
            </div>
            <Switch
              checked={sub.auto_renew}
              disabled={toggleAutoRenew.isPending || sub.status !== 'active'}
              onCheckedChange={() => toggleAutoRenew.mutate(sub.id)}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <ChangePlanDialog subscriptionId={sub.id} />

            <Button variant="outline" size="sm" onClick={handleManageBilling}>
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Manage Billing
            </Button>

            {sub.status === 'cancelled' && (
              <Button
                variant="default"
                size="sm"
                onClick={() => reactivateMutation.mutate(sub.id)}
                disabled={reactivateMutation.isPending}
              >
                {reactivateMutation.isPending ? 'Reactivating...' : 'Reactivate'}
              </Button>
            )}

            {sub.status === 'active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will remain active until the end of the current billing
                      period. You can reactivate before it expires.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <textarea
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Reason for cancellation (optional)"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() =>
                        cancelMutation.mutate({ id: sub.id, data: { reason: cancelReason } })
                      }
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Credit Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Credit Usage This Period</CardTitle>
          <CardDescription>
            {credits?.has_subscription
              ? `${credits.days_remaining} days remaining in current period`
              : 'Credits refresh each billing period'}
            {credits && (credits.pack_ai_credits > 0 || credits.pack_keyword_credits > 0) && (
              <> · Pack wallet drains after subscription credits run out.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span>AI Credits</span>
              <span className="font-medium">
                {sub.ai_credits_remaining.toLocaleString()}
                {planDetails?.ai_credits ? ` / ${planDetails.ai_credits.toLocaleString()}` : ''}
              </span>
            </div>
            <Progress value={aiPercent} className="h-2" />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{aiPercent}% remaining</span>
              {credits && credits.pack_ai_credits !== 0 && (
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Coins className="h-3 w-3" />
                  +{credits.pack_ai_credits.toLocaleString()} pack
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="mb-1.5 flex justify-between text-sm">
              <span>Keyword Credits</span>
              <span className="font-medium">
                {sub.keyword_credits_remaining.toLocaleString()}
                {planDetails?.keyword_credits ? ` / ${planDetails.keyword_credits.toLocaleString()}` : ''}
              </span>
            </div>
            <Progress value={kwPercent} className="h-2" />
            <div className="mt-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{kwPercent}% remaining</span>
              {credits && credits.pack_keyword_credits !== 0 && (
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Coins className="h-3 w-3" />
                  +{credits.pack_keyword_credits.toLocaleString()} pack
                </span>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-amber-50 p-3 text-xs dark:bg-amber-950/30">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                <Wallet className="h-3.5 w-3.5" />
                Credit pack wallet (never expires)
              </div>
              <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                <Link href="/app/subscription/plans#credit-packs">
                  <Coins className="mr-1 h-3 w-3" />
                  Top up
                </Link>
              </Button>
            </div>
            <div className="text-muted-foreground mt-1 grid grid-cols-2 gap-3">
              <span>
                AI:{' '}
                <strong className="text-foreground">
                  {credits?.pack_ai_credits.toLocaleString() ?? 0}
                </strong>
              </span>
              <span>
                KW:{' '}
                <strong className="text-foreground">
                  {credits?.pack_keyword_credits.toLocaleString() ?? 0}
                </strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pack purchase history. The pack catalog itself lives on the
          /subscription/plans page, where users browse and buy. */}
      <CreditPackPurchasesCard />

      {/* Transaction History */}
      {transactions && transactions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/subscription/transactions">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Balance After</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(transactions as CreditTransaction[]).slice(0, 10).map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {tx.credit_type}
                      </Badge>
                    </TableCell>
                    <TableCell className={tx.amount < 0 ? 'text-red-500' : 'text-green-600'}>
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {tx.balance_after}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
                      {tx.description}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Subscription History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <span className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Subscription History
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history as SubscriptionHistoryItem[]).slice(0, 10).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">
                        {item.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {item.from_plan_name && item.to_plan_name
                        ? `${item.from_plan_name} → ${item.to_plan_name}`
                        : item.to_plan_name || item.from_plan_name || '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
                      {item.notes}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}