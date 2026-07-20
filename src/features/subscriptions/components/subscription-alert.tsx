import { useCreditBalance, useActiveSubscription } from '@/features/subscriptions/hooks/use-subscriptions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SubscriptionAlertProps {
  className?: string;
  threshold?: number;
  type?: 'ai' | 'keyword';
}

export function useSubscriptionStatus(threshold = 0, type: 'ai' | 'keyword' = 'ai') {
  const { data: credits, isLoading } = useCreditBalance();
  const { data: sub, isLoading: isLoadingSubscription, isFetched: isSubscriptionFetched } =
    useActiveSubscription();

  const creditsLoaded = !!credits && !isLoading;
  const hasSubscription = credits?.has_subscription ?? false;
  const creditValue = type === 'ai' ? (credits?.ai_credits ?? 0) : (credits?.keyword_credits ?? 0);
  const subscriptionResolved = !hasSubscription || !creditsLoaded || isSubscriptionFetched;

  const planTotal =
    type === 'ai'
      ? (sub?.plan_details?.ai_credits ?? 0)
      : (sub?.plan_details?.keyword_credits ?? 0);

  // Match the credit dropdown behavior: subscribed users should only see the
  // warning once they are down to the last 10% of the plan allocation.
  // If plan details are unavailable, fall back to the explicit threshold.
  const effectiveThreshold = hasSubscription
    ? (planTotal > 0 ? Math.floor(planTotal * 0.1) : threshold)
    : threshold;

  const noSubscription = creditsLoaded && !hasSubscription;
  const lowCredits =
    creditsLoaded && hasSubscription && subscriptionResolved && creditValue <= effectiveThreshold;

  const isBlocked = noSubscription || (creditsLoaded && creditValue <= 0);
  const showAlert = noSubscription || lowCredits;
  const statusLoading = isLoading || (creditsLoaded && hasSubscription && isLoadingSubscription);

  return {
    isBlocked,
    showAlert,
    noSubscription,
    lowCredits,
    creditValue,
    isLoading: statusLoading,
    creditsLoaded,
  };
}

export default function SubscriptionAlert({ className, threshold = 0, type = 'ai' }: SubscriptionAlertProps) {
  const { showAlert, noSubscription, isLoading } = useSubscriptionStatus(threshold, type);

  if (isLoading || !showAlert) return null;

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm",
      className
    )}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <div>
        <div className="font-semibold">Action required</div>
        <div className="mt-1">
          {noSubscription
            ? `You need an active subscription to ${type === 'ai' ? 'generate articles' : 'search keywords'}.`
            : `You have low ${type === 'ai' ? 'AI' : 'keyword'} credits remaining.`}
          <span className="ml-1">
            <Link href="/app/subscription/plans" className="underline font-medium hover:text-red-700">
              View plans
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}