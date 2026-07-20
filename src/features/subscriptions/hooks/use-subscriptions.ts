import { subscriptionsApi } from '@/lib/api/subscriptions';
import { useCreditStore } from '@/lib/stores/credit-store';
import type {
  CancelSubscriptionRequest,
  ChangePlanRequest,
  CheckoutRequest,
  CreditPackCheckoutRequest,
} from '@/types/subscription';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'sonner';

// Query keys
const keys = {
  plans: ['subscription-plans'] as const,
  active: ['subscription-active'] as const,
  credits: ['subscription-credits'] as const,
  transactions: ['credit-transactions'] as const,
  history: ['subscription-history'] as const,
  billingPortal: ['billing-portal'] as const,
  creditPacks: ['credit-packs'] as const,
  creditPacksFeatured: ['credit-packs', 'featured'] as const,
  creditPackPurchases: ['credit-pack-purchases'] as const,
};

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: keys.plans,
    queryFn: subscriptionsApi.getPlans,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActiveSubscription() {
  return useQuery({
    queryKey: keys.active,
    queryFn: subscriptionsApi.getActiveSubscription,
    retry: false,
  });
}

export function useCreditBalance() {
  const setCredits = useCreditStore((s) => s.setCredits);

  const query = useQuery({
    queryKey: keys.credits,
    queryFn: subscriptionsApi.getCredits,
    refetchInterval: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setCredits(query.data);
    }
  }, [query.data, setCredits]);

  return query;
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CancelSubscriptionRequest }) =>
      subscriptionsApi.cancelSubscription(id, data),
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      queryClient.invalidateQueries({ queryKey: keys.active });
      queryClient.invalidateQueries({ queryKey: keys.credits });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });
}

export function useReactivateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.reactivateSubscription(id),
    onSuccess: () => {
      toast.success('Subscription reactivated successfully');
      queryClient.invalidateQueries({ queryKey: keys.active });
      queryClient.invalidateQueries({ queryKey: keys.credits });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reactivate subscription');
    },
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: (data: CheckoutRequest) => subscriptionsApi.createCheckout(data),
    onError: (error) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });
}

export function useCreditTransactions() {
  return useQuery({
    queryKey: keys.transactions,
    queryFn: subscriptionsApi.getTransactions,
  });
}

export function useSubscriptionHistory() {
  return useQuery({
    queryKey: keys.history,
    queryFn: subscriptionsApi.getHistory,
  });
}

export function useBillingPortal() {
  return useQuery({
    queryKey: keys.billingPortal,
    queryFn: subscriptionsApi.getBillingPortal,
    enabled: false,
  });
}

export function useToggleAutoRenew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => subscriptionsApi.toggleAutoRenew(id),
    onSuccess: (data) => {
      toast.success(data.auto_renew ? 'Auto-renew enabled' : 'Auto-renew disabled');
      queryClient.invalidateQueries({ queryKey: keys.active });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update auto-renew');
    },
  });
}

export function useChangePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChangePlanRequest }) =>
      subscriptionsApi.changePlan(id, data),
    onSuccess: (data) => {
      toast.success(data.detail || 'Plan change initiated. Your subscription will be updated shortly.');
      queryClient.invalidateQueries({ queryKey: keys.active });
      queryClient.invalidateQueries({ queryKey: keys.credits });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to change plan');
    },
  });
}

// =========================================================================
// Credit Packs
// =========================================================================

export function useCreditPacks() {
  return useQuery({
    queryKey: keys.creditPacks,
    queryFn: subscriptionsApi.getCreditPacks,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedCreditPacks() {
  return useQuery({
    queryKey: keys.creditPacksFeatured,
    queryFn: subscriptionsApi.getFeaturedCreditPacks,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreditPackPurchases() {
  return useQuery({
    queryKey: keys.creditPackPurchases,
    queryFn: subscriptionsApi.getCreditPackPurchases,
  });
}

/**
 * Mutation for one-time credit pack checkout.
 *
 * 402 from this endpoint means "subscribe first" — NOT "out of credits". We
 * surface a dedicated toast/error rather than opening the global upgrade
 * modal that the client interceptor uses for usage 402s.
 */
export function useCreditPackCheckout() {
  return useMutation({
    mutationFn: (data: CreditPackCheckoutRequest) =>
      subscriptionsApi.createCreditPackCheckout(data),
    onError: (error: { status?: number; message?: string }) => {
      if (error.status === 402) {
        toast.error(
          error.message ||
            'You need an active subscription before buying credit packs. Subscribe to a plan first.'
        );
      } else {
        toast.error(error.message || 'Failed to start credit pack checkout');
      }
    },
  });
}