import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Check, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type BillingCycle = 'monthly' | 'yearly';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Plan content overrides based on user request
const planContentOverrides: Record<string, any> = {
  pro: {
    originalPrice: 39,
    price: 29,
    tokens: '250,000 Tokens',
    keywords: '500 Keywords',
    features: [
      'SEO Quality Score',
      'CMS Sync',
      'Originality Shield',
      'Weekly Growth Report',
    ],
    buttonText: 'Try Pro',
  },
  growth: {
    originalPrice: 99,
    price: 79,
    tokens: '1 Million Tokens',
    keywords: '1500 Keywords',
    features: [
      'Bulk Content Mode',
      'Auto-Link Clusters',
      'Priority Search Node',
      'Keyword Lab Pro',
      'Snippet Pro',
    ],
    buttonText: 'Start Growth',
  },
  agency: {
    originalPrice: 249,
    price: 199,
    tokens: '3 Million Tokens',
    keywords: '5000 Keywords',
    features: [
      'Team Workspaces',
      'API Automation',
      'Expert Consult',
      'White-Label Hub',
      'Managed Loops',
    ],
    buttonText: 'Join Agency',
  },
};

export function PlanCards() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const { data: plans, isLoading } = useSubscriptionPlans();
  const { data: activeSub } = useActiveSubscription();
  const checkout = useCreateCheckout();
  const { paddle } = usePaddle();

  const [isSuccess, setIsSuccess] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const filteredPlans =
    plans?.filter((p: SubscriptionPlan) => p.billing_cycle === cycle) ?? [];

  // Listen for Paddle checkout events
  useEffect(() => {
    if (!paddle) return;

    const checkoutInstance = (paddle as any).Checkout;
    const on = checkoutInstance?.on ?? (paddle as any).on;
    const off = checkoutInstance?.off ?? (paddle as any).off;

    if (!on) return;

    // Success event
    const handleCompleted = (data: any) => {
      console.log('Checkout completed:', data);
      setIsSuccess(true);

      // Invalidate queries to refresh the user's status immediately
      queryClient.invalidateQueries({ queryKey: ['subscription-active'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-credits'] });

      toast.success('Subscription activated! Redirecting to content creator in 5 seconds...', {
        duration: 5000,
      });

      // Set a timer for the automatic redirect
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }

      redirectTimerRef.current = setTimeout(() => {
        router.push('/app/blogs/new');
      }, 5000);
    };

    // Closed event
    const handleClosed = () => {
      // If payment was already successful, redirect immediately on close
      // instead of waiting for the 5s timer
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
        paddle.Checkout.open({
          transactionId: result.transaction_id,
        });
      } else if (result.checkout_url) {
        window.open(result.checkout_url, '_blank');
      }
    } finally {
      setProcessingPlanId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[450px] rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-full bg-muted/30 p-1.5 backdrop-blur-sm border border-border/50 shadow-sm">
          <button
            onClick={() => setCycle('monthly')}
            className={`relative px-5 py-2 text-sm font-medium transition-all duration-200 rounded-full ${
              cycle === 'monthly'
                ? 'bg-background text-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle('yearly')}
            className={`relative px-5 py-2 text-sm font-medium transition-all duration-200 rounded-full flex items-center gap-2 ${
              cycle === 'yearly'
                ? 'bg-background text-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Yearly
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-1.5 py-0 text-[10px] font-bold"
            >
              -20%
            </Badge>
          </button>
        </div>
      </div>

      {/* Plan cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="wait">
          {filteredPlans.map((plan: SubscriptionPlan) => {
            const isCurrentPlan =
              activeSub?.plan_details?.id === plan.id && activeSub?.is_active;

            // Get overrides based on plan name (lowercase)
            const override = planContentOverrides[plan.name.toLowerCase()];

            const features = plan.features as Record<
              string,
              boolean | string
            > | null;
            const featureList = override?.features || (features
              ? Object.entries(features)
                  .filter(([, v]) => v === true || typeof v === 'string')
                  .map(([k]) => k.replace(/_/g, ' '))
              : []);

            const isPremium = plan.is_featured;
            const isProcessing = processingPlanId === plan.id;

            return (
              <motion.div
                key={`${plan.id}-${cycle}`}
                variants={item}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="flex"
              >
                <Card
                  className={`relative flex flex-col w-full overflow-hidden transition-all duration-300 border-2 rounded-2xl ${
                    isPremium
                      ? 'border-primary shadow-[0_15px_40px_rgba(var(--primary),0.12)] ring-1 ring-primary/10 bg-background/60 dark:bg-zinc-900/60'
                      : 'border-border/50 hover:border-border shadow-md bg-background/40 hover:bg-background/80'
                  } backdrop-blur-xl`}
                >
                  {isPremium && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-[9px] font-bold px-7 py-0.5 rotate-45 translate-x-[28%] translate-y-[50%] shadow uppercase tracking-wider">
                        Most Popular
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-3 px-5 pt-5">
                    <div className="flex items-center gap-2 mb-1">
                      {isPremium ? (
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <Zap size={15} />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-lg bg-muted text-muted-foreground">
                          <Sparkles size={15} />
                        </div>
                      )}
                      <CardTitle className="text-lg font-bold tracking-tight">
                        {plan.name}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-xs min-h-[30px] leading-relaxed opacity-80">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4 px-5">
                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      {override?.originalPrice && (
                        <span className="text-muted-foreground text-lg line-through opacity-30 font-medium">
                          ${override.originalPrice}
                        </span>
                      )}
                      <span className="text-4xl font-extrabold tracking-tighter">
                        ${override?.price || plan.price}
                      </span>
                      <span className="text-muted-foreground text-[10px] font-medium opacity-60">
                        / {plan.billing_cycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>

                    {/* Credits & Limits - Horizontal Bar */}
                    <div
                      className={`grid grid-cols-2 gap-2 rounded-xl border border-border/20 p-2.5 transition-colors ${
                        isPremium ? 'bg-primary/5' : 'bg-muted/30'
                      }`}
                    >
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Tokens
                        </div>
                        <div className="text-xs font-bold">
                          {override?.tokens?.split(' ')[0] || plan.ai_credits.toLocaleString()}
                        </div>
                      </div>
                      <div className="border-l border-border/30 pl-2.5">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/60">
                          Keywords
                        </div>
                        <div className="text-xs font-bold">
                          {override?.keywords?.split(' ')[0] || plan.keyword_credits.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Features - Grid */}
                    <div className="space-y-2.5">
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 flex items-center gap-2">
                        Features
                        <div className="h-px bg-border/20 flex-1" />
                      </h4>
                      {featureList.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                          {featureList.map((feature: string) => (
                            <li
                              key={feature}
                              className="flex items-center gap-1.5 text-[10px] group"
                            >
                              <div
                                className={`rounded-full p-0.5 shrink-0 ${
                                  isPremium
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-muted/60 text-muted-foreground/70'
                                }`}
                              >
                                <Check className="h-2 w-2" strokeWidth={4} />
                              </div>
                              <span className="capitalize truncate leading-tight group-hover:text-foreground transition-colors">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 pb-5 px-5">
                    {isCurrentPlan ? (
                      <Button
                        className="w-full h-9 rounded-lg border-dashed text-[10px]"
                        variant="secondary"
                        disabled
                      >
                        Active Plan
                      </Button>
                    ) : (
                      <Button
                        className={`w-full h-9 rounded-lg text-[10px] font-bold shadow-sm transition-all active:scale-95 group overflow-hidden ${
                          isPremium
                            ? 'bg-primary text-primary-foreground hover:bg-primary/95'
                            : 'bg-foreground text-background hover:bg-foreground/90'
                        }`}
                        onClick={() => handleSubscribe(plan)}
                        disabled={isProcessing}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-1.5">
                          {isProcessing ? 'Processing...' : (override?.buttonText || 'Upgrade')}
                          {!isProcessing && (
                            <Zap className="w-3 h-3 fill-current group-hover:scale-110 transition-transform" />
                          )}
                        </span>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredPlans.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border"
        >
          <p className="text-muted-foreground font-medium">
            No plans available for {cycle} billing.
          </p>
        </motion.div>
      )}
    </div>
  );
}