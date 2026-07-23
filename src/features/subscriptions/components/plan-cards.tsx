'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  useActiveSubscription,
  useCreateCheckout,
  useSubscriptionPlans,
} from '@/features/subscriptions/hooks/use-subscriptions';
import { usePaddle } from '@/lib/providers/paddle-provider';
import type { SubscriptionPlan } from '@/types/subscription';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type BillingCycle = 'monthly' | 'yearly';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Strip the "Affvance " prefix for display — the brand is already implied
// by the app the user is sitting in (matches how the marketing page shows
// just "Pro" / "Growth" / "Agency" without repeating the product name).
function shortName(name: string) {
  return name.replace(/^Affvance\s+/i, '');
}

// Build a readable feature list for a plan. Prefers the curated
// `features.highlights` array (set by the seed data / admin), falling back
// to turning boolean feature flags into readable labels if it's missing.
function getHighlights(plan: SubscriptionPlan): string[] {
  const features = plan.features as Record<string, unknown> | null;
  const highlights = features?.highlights;
  if (Array.isArray(highlights) && highlights.length > 0) {
    return highlights as string[];
  }
  if (!features) return [];
  return Object.entries(features)
    .filter(([k, v]) => v === true && k !== 'highlights')
    .map(([k]) => k.replace(/_/g, ' '));
}

export function PlanCards() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { data: activeSub } = useActiveSubscription();
  const checkout = useCreateCheckout();
  const { paddle } = usePaddle();

  const [isSuccess, setIsSuccess] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Recurring plans (Pro / Growth / Agency) for the selected billing cycle.
  const recurringPlans =
    plans?.filter(
      (p: SubscriptionPlan) => p.billing_cycle === cycle && !p.is_one_time_purchase
    ) ?? [];

  // The one-time Entry Pass — shown regardless of the monthly/yearly toggle,
  // since it isn't a recurring price in Paddle.
  const entryPass = plans?.find(
    (p: SubscriptionPlan) => p.is_one_time_purchase || p.billing_cycle === 'lifetime'
  );

  const allVisiblePlans: SubscriptionPlan[] = entryPass
    ? [...recurringPlans, entryPass]
    : recurringPlans;

  // Listen for Paddle checkout events
  useEffect(() => {
    if (!paddle) return;

    const checkoutInstance = (paddle as any).Checkout;
    const on = checkoutInstance?.on ?? (paddle as any).on;
    const off = checkoutInstance?.off ?? (paddle as any).off;

    if (!on) return;

    const handleCompleted = (data: any) => {
      console.log('Checkout completed:', data);
      setIsSuccess(true);

      queryClient.invalidateQueries({ queryKey: ['subscription-active'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-credits'] });

      toast.success('Subscription activated! Redirecting to content creator in 5 seconds...', {
        duration: 5000,
      });

      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = setTimeout(() => {
        router.push('/app/blogs/new');
      }, 5000);
    };

    const handleClosed = () => {
      if (isSuccess) {
        router.push('/app/blogs/new');
      }
    };

    on.call(checkoutInstance ?? paddle, 'checkout.completed', handleCompleted);
    on.call(checkoutInstance ?? paddle, 'checkout.closed', handleClosed);

    return () => {
      if (off) {
        off.call(checkoutInstance ?? paddle, 'checkout.completed', handleCompleted);
        off.call(checkoutInstance ?? paddle, 'checkout.closed', handleClosed);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [paddle, isSuccess, router, queryClient]);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setProcessingPlanId(plan.id);
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const result = await checkout.mutateAsync({
        plan_id: plan.id,
        billing_cycle: cycle,
        success_url: `${siteUrl}/app/subscription`,
      });

      if (result.transaction_id && paddle) {
        paddle.Checkout.open({ transactionId: result.transaction_id });
      } else if (result.checkout_url) {
        window.open(result.checkout_url, '_blank');
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  const scrollByCard = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="flex gap-5 overflow-x-hidden">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[620px] w-[320px] shrink-0 rounded-[3rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Billing cycle toggle — matches the marketing page */}
      <div className="flex items-center justify-center gap-6">
        <span
          className={`text-sm font-black uppercase tracking-widest transition-colors ${
            cycle === 'monthly' ? 'text-indigo-600' : 'text-muted-foreground'
          }`}
        >
          Monthly
        </span>
        <button
          onClick={() => setCycle(cycle === 'monthly' ? 'yearly' : 'monthly')}
          className="relative h-8 w-16 rounded-full bg-muted p-1 transition-colors hover:bg-muted/70"
        >
          <div
            className={`h-6 w-6 rounded-full bg-indigo-600 shadow-md transition-transform duration-300 ${
              cycle === 'yearly' ? 'translate-x-8' : 'translate-x-0'
            }`}
          />
        </button>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-black uppercase tracking-widest transition-colors ${
              cycle === 'yearly' ? 'text-indigo-600' : 'text-muted-foreground'
            }`}
          >
            Yearly
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-600">
            2 Months Free
          </span>
        </div>
      </div>

      {/* Scrollable plan strip — every plan, including the one-time pass */}
      <div className="relative">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border bg-background p-2 shadow-md hover:bg-muted md:flex"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border bg-background p-2 shadow-md hover:bg-muted md:flex"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <motion.div
          ref={scrollRef}
          variants={container}
          initial="hidden"
          animate="show"
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-1 pb-6 pt-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ scrollbarWidth: 'thin' }}
        >
          <AnimatePresence mode="popLayout">
            {allVisiblePlans.map((plan: SubscriptionPlan) => {
              const isCurrentPlan =
                activeSub?.plan_details?.id === plan.id && activeSub?.is_active;
              const isProcessing = processingPlanId === plan.id;
              const highlights = getHighlights(plan);
              const numericPrice = Number(plan.price);

              // ---- One-time Entry Pass: dark, standalone card style ----
              if (plan.is_one_time_purchase || plan.billing_cycle === 'lifetime') {
                return (
                  <motion.div
                    key={plan.id}
                    variants={item}
                    className="group relative flex w-[300px] shrink-0 snap-center flex-col overflow-hidden rounded-[3rem] border-2 border-indigo-500 bg-slate-950 p-8 text-white shadow-[0_25px_60px_-15px_rgba(79,70,229,0.4)] transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform duration-500 group-hover:rotate-12">
                      <Flame className="h-20 w-20 text-indigo-400" />
                    </div>
                    <div className="relative z-10 flex flex-1 flex-col">
                      <div className="mb-6 inline-block self-start rounded-full bg-indigo-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-lg">
                        Limited Pass
                      </div>
                      <h3 className="mb-1 text-3xl font-black leading-none tracking-tighter">
                        {shortName(plan.name)}
                      </h3>
                      <p className="mb-8 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                        Instant Entry License
                      </p>
                      <div className="relative mb-8 flex flex-col items-center justify-center rounded-[2.25rem] border border-white/10 bg-white/5 py-10 text-center shadow-2xl transition-colors group-hover:bg-white/10">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-indigo-400">$</span>
                          <span className="text-7xl font-black leading-none tracking-tighter text-white drop-shadow-2xl">
                            {numericPrice}
                          </span>
                        </div>
                        <div className="mb-1 mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          one-time
                        </div>
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-5 py-1.5 text-[9px] font-black uppercase tracking-widest shadow-lg">
                          One-Time Activation
                        </div>
                      </div>
                      <div className="mb-8 mt-4 space-y-4 px-1">
                        {highlights.map((f, idx) => (
                          <div key={f} className="flex items-center gap-3">
                            {idx === 0 ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-400" />
                            ) : idx === 1 ? (
                              <Zap className="h-4 w-4 shrink-0 text-indigo-400" />
                            ) : (
                              <ShieldCheck className="h-4 w-4 shrink-0 text-indigo-400" />
                            )}
                            <span className="text-xs font-bold leading-tight text-slate-200 capitalize">
                              {f}
                            </span>
                          </div>
                        ))}
                      </div>
                      {isCurrentPlan ? (
                        <button
                          disabled
                          className="mt-auto w-full rounded-[1.5rem] border border-dashed border-white/30 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400"
                        >
                          Active
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(plan)}
                          disabled={isProcessing}
                          className="mt-auto w-full rounded-[1.5rem] bg-white py-5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-900 shadow-2xl transition-all hover:bg-indigo-600 hover:text-white disabled:opacity-60"
                        >
                          {isProcessing ? 'Processing...' : `Get Pass for $${numericPrice}`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              }

              // ---- Recurring plans: Pro / Growth / Agency ----
              const isPopular = plan.is_featured;
              const monthlyEquivalent =
                cycle === 'yearly' ? Math.floor(numericPrice / 12) : numericPrice;

              return (
                <motion.div
                  key={`${plan.id}-${cycle}`}
                  variants={item}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className={`relative flex w-[300px] shrink-0 snap-center flex-col rounded-[3rem] border bg-background px-7 pb-10 pt-14 transition-all duration-500 ${
                    isPopular
                      ? 'border-indigo-600 shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-500/5'
                      : 'border-border shadow-lg'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-5 py-1.5 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-8 text-center">
                    <h3 className="mb-1 text-2xl font-black tracking-tight">
                      {shortName(plan.name)}
                    </h3>
                    <p className="mb-6 min-h-[28px] text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                      {plan.description}
                    </p>

                    <div className="flex flex-col items-center">
                      <div className="mb-1 flex items-center justify-center gap-1">
                        <span className="text-lg font-black text-muted-foreground">$</span>
                        <span className="text-6xl font-black leading-none tracking-tighter">
                          {numericPrice}
                        </span>
                      </div>

                      {cycle === 'monthly' ? (
                        <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          per month
                        </div>
                      ) : (
                        <div className="mb-3 flex flex-col items-center gap-0.5">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
                            Billed Yearly
                          </div>
                          <div className="text-[11px] font-medium leading-none text-muted-foreground">
                            (~ ${monthlyEquivalent}/month)
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/40 bg-indigo-50 px-3 py-2 dark:bg-indigo-500/10">
                        <div className="text-center">
                          <div className="text-[8px] font-black uppercase tracking-wider text-indigo-600/70">
                            AI Credits
                          </div>
                          <div className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                            {plan.ai_credits.toLocaleString()}
                          </div>
                        </div>
                        <div className="border-l border-indigo-200 text-center dark:border-indigo-500/20">
                          <div className="text-[8px] font-black uppercase tracking-wider text-indigo-600/70">
                            Keywords
                          </div>
                          <div className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                            {plan.keyword_credits.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ul className="mb-10 flex-1 space-y-4 border-t border-border/50 pt-8">
                    {highlights.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-3 text-[11px] font-bold leading-tight text-muted-foreground capitalize"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <button
                      disabled
                      className="w-full rounded-[1.75rem] border border-dashed py-5 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={isProcessing}
                      className={`w-full rounded-[1.75rem] py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all disabled:opacity-60 ${
                        isPopular
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700'
                          : 'bg-foreground text-background hover:bg-foreground/90'
                      }`}
                    >
                      {isProcessing ? 'Processing...' : `Get ${shortName(plan.name)}`}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 md:hidden">
          ← Swipe to see all plans →
        </p>
      </div>

      {allVisiblePlans.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-3xl border border-dashed border-border bg-muted/20 py-20 text-center"
        >
          <p className="font-medium text-muted-foreground">
            No plans available for {cycle} billing.
          </p>
        </motion.div>
      )}
    </div>
  );
}