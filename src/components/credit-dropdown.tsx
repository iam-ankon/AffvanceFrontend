'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useCreditBalance } from '@/features/subscriptions/hooks/use-subscriptions';
import { useActiveSubscription } from '@/features/subscriptions/hooks/use-subscriptions';
import { Loader2, Search, Sparkles, Wallet, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CreditDropdown() {
  const { data: credits, isLoading, isError } = useCreditBalance();
  const { data: sub } = useActiveSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 px-3 py-1.5">
        <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
        <span className="text-muted-foreground text-[10px] font-medium">Loading...</span>
      </div>
    );
  }

  const aiCredits = credits?.ai_credits ?? 0;
  const kwCredits = credits?.keyword_credits ?? 0;
  const hasSubscription = credits?.has_subscription ?? false;

  const planAiTotal = sub?.plan_details?.ai_credits ?? 0;
  const planKwTotal = sub?.plan_details?.keyword_credits ?? 0;
  const aiPercent = planAiTotal > 0 ? Math.round((aiCredits / planAiTotal) * 100) : aiCredits > 0 ? 100 : 0;
  const kwPercent = planKwTotal > 0 ? Math.round((kwCredits / planKwTotal) * 100) : kwCredits > 0 ? 100 : 0;

  const aiLow = hasSubscription && planAiTotal > 0 && aiCredits <= Math.floor(planAiTotal * 0.1);
  const kwLow = hasSubscription && planKwTotal > 0 && kwCredits <= Math.floor(planKwTotal * 0.1);
  const showUpgrade = !hasSubscription || aiLow || kwLow;

  const display = (n: number) => (isError ? '—' : n.toLocaleString());

  return (
    <div className="flex items-stretch overflow-hidden rounded-full border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 backdrop-blur-md transition-all hover:border-purple-400/50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex cursor-pointer items-center transition-all hover:bg-purple-500/10">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                aiLow ? 'text-rose-600' : 'text-purple-600'
              }`}
              title="AI Credits"
            >
              <Sparkles className={`h-4 w-4 ${aiLow ? 'text-rose-500' : 'text-purple-500'}`} />
              <span className="text-sm font-semibold tracking-tight">{display(aiCredits)}</span>
              <span className="text-muted-foreground text-[10px] font-medium">AI</span>
            </div>
            <div className="self-center h-4 w-[1px] bg-purple-500/20" />
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                kwLow ? 'text-rose-600' : 'text-indigo-600'
              }`}
              title="Keyword Credits"
            >
              <Search className={`h-4 w-4 ${kwLow ? 'text-rose-500' : 'text-indigo-500'}`} />
              <span className="text-sm font-semibold tracking-tight">{display(kwCredits)}</span>
              <span className="text-muted-foreground text-[10px] font-medium">KW</span>
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
          {hasSubscription ? (
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>{credits?.plan_name ?? 'Plan'}</span>
              <span className="text-muted-foreground text-xs font-normal">
                {credits?.days_remaining ?? 0}d remaining
              </span>
            </DropdownMenuLabel>
          ) : (
            <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
              No active subscription
            </DropdownMenuLabel>
          )}

          <div className="space-y-3 px-3 pb-2 pt-1">
            <div>
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  AI Credits
                </span>
                <span className="font-medium">
                  {aiCredits.toLocaleString()}
                  {planAiTotal > 0 && (
                    <span className="text-muted-foreground"> / {planAiTotal.toLocaleString()}</span>
                  )}
                </span>
              </div>
              <Progress value={aiPercent} className="bg-muted h-1.5" />
            </div>
            <div>
              <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Search className="h-3 w-3 text-indigo-500" />
                  Keyword Credits
                </span>
                <span className="font-medium">
                  {kwCredits.toLocaleString()}
                  {planKwTotal > 0 && (
                    <span className="text-muted-foreground"> / {planKwTotal.toLocaleString()}</span>
                  )}
                </span>
              </div>
              <Progress value={kwPercent} className="bg-muted h-1.5" />
            </div>
          </div>

          <DropdownMenuSeparator />

          {hasSubscription ? (
            <DropdownMenuItem asChild>
              <Link href="/app/subscription" className="cursor-pointer">
                <Wallet className="mr-2 h-4 w-4" />
                Manage Subscription
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/app/subscription/plans" className="cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                Subscribe to a Plan
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {showUpgrade && (
        <>
          <div className="self-center h-4 w-[1px] bg-purple-500/20" />
          <Link
            href="/app/subscription/plans"
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 text-[11px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
          >
            <Zap className="h-3 w-3 fill-current" />
            Upgrade
          </Link>
        </>
      )}
    </div>
  );
}
