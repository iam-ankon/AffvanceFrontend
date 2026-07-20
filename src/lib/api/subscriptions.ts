import { api } from './client';
import type {
  SubscriptionPlan,
  Subscription,
  CreditBalance,
  CreditTransaction,
  SubscriptionHistoryItem,
  CheckoutRequest,
  CheckoutResponse,
  BillingPortalResponse,
  CancelSubscriptionRequest,
  ToggleAutoRenewResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  CreditPack,
  CreditPackPurchase,
  CreditPackCheckoutRequest,
  CreditPackCheckoutResponse,
} from '@/types/subscription';

// Paginated endpoints (go through StandardPagination) return this wrapper
interface PaginatedResponse<T> {
  status_code: number;
  success: boolean;
  message: string;
  data: {
    results: T[];
  };
}

// NOTE: Detail/action endpoints return raw data (no {data: ...} wrapper)
// Only list/paginated endpoints use the PaginatedResponse wrapper.

const ENDPOINTS = {
  PLANS: '/subscriptions/plans/',
  FEATURED_PLANS: '/subscriptions/plans/featured/',
  SUBSCRIPTIONS: '/subscriptions/subscriptions/',
  ACTIVE: '/subscriptions/subscriptions/active/',
  CREDITS: '/subscriptions/subscriptions/credits/',
  CANCEL: (id: string) => `/subscriptions/subscriptions/${id}/cancel/`,
  REACTIVATE: (id: string) => `/subscriptions/subscriptions/${id}/reactivate/`,
  TOGGLE_AUTO_RENEW: (id: string) => `/subscriptions/subscriptions/${id}/toggle-auto-renew/`,
  CHANGE_PLAN: (id: string) => `/subscriptions/subscriptions/${id}/change-plan/`,
  TRANSACTIONS: '/subscriptions/transactions/',
  HISTORY: '/subscriptions/history/',
  CHECKOUT: '/subscriptions/checkout/',
  BILLING_PORTAL: '/subscriptions/billing-portal/',
  CREDIT_PACKS: '/subscriptions/credit-packs/',
  FEATURED_CREDIT_PACKS: '/subscriptions/credit-packs/featured/',
  CREDIT_PACK_CHECKOUT: '/subscriptions/credit-packs/checkout/',
  CREDIT_PACK_PURCHASES: '/subscriptions/credit-pack-purchases/',
};

export const subscriptionsApi = {
  // Plans — paginated list, uses {data: {results: [...]}} wrapper
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await api.get<PaginatedResponse<SubscriptionPlan>>(ENDPOINTS.PLANS);
    return response.data.results;
  },

  // Featured plans — returns raw array (not paginated)
  getFeaturedPlans: async (): Promise<SubscriptionPlan[]> => {
    return api.get<SubscriptionPlan[]>(ENDPOINTS.FEATURED_PLANS);
  },

  // Active subscription — raw response (no {data: ...} wrapper)
  getActiveSubscription: async (): Promise<Subscription | null> => {
    try {
      return await api.get<Subscription>(ENDPOINTS.ACTIVE);
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 404) return null;
      throw error;
    }
  },

  // Credits — raw response
  getCredits: async (): Promise<CreditBalance> => {
    return api.get<CreditBalance>(ENDPOINTS.CREDITS);
  },

  // Cancel — raw response (returns the updated subscription)
  cancelSubscription: async (
    id: string,
    data: CancelSubscriptionRequest
  ): Promise<Subscription> => {
    return api.post<Subscription>(ENDPOINTS.CANCEL(id), data);
  },

  // Reactivate — raw response
  reactivateSubscription: async (id: string): Promise<Subscription> => {
    return api.post<Subscription>(ENDPOINTS.REACTIVATE(id));
  },

  // Toggle auto-renew — raw response
  toggleAutoRenew: async (id: string): Promise<ToggleAutoRenewResponse> => {
    return api.post<ToggleAutoRenewResponse>(ENDPOINTS.TOGGLE_AUTO_RENEW(id));
  },

  // Change plan — raw response
  changePlan: async (id: string, data: ChangePlanRequest): Promise<ChangePlanResponse> => {
    return api.post<ChangePlanResponse>(ENDPOINTS.CHANGE_PLAN(id), data);
  },

  // Transactions — paginated list
  getTransactions: async (): Promise<CreditTransaction[]> => {
    const response = await api.get<PaginatedResponse<CreditTransaction>>(ENDPOINTS.TRANSACTIONS);
    return response.data.results;
  },

  // History — paginated list
  getHistory: async (): Promise<SubscriptionHistoryItem[]> => {
    const response = await api.get<PaginatedResponse<SubscriptionHistoryItem>>(ENDPOINTS.HISTORY);
    return response.data.results;
  },

  // Checkout — raw response
  createCheckout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    return api.post<CheckoutResponse>(ENDPOINTS.CHECKOUT, data);
  },

  // Billing portal — raw response
  getBillingPortal: async (): Promise<BillingPortalResponse> => {
    return api.get<BillingPortalResponse>(ENDPOINTS.BILLING_PORTAL);
  },

  // ─── Credit Packs ────────────────────────────────────────────────────────

  // Catalog (paginated)
  getCreditPacks: async (): Promise<CreditPack[]> => {
    const response = await api.get<PaginatedResponse<CreditPack>>(ENDPOINTS.CREDIT_PACKS);
    return response.data.results;
  },

  // Featured packs (raw array, custom action)
  getFeaturedCreditPacks: async (): Promise<CreditPack[]> => {
    return api.get<CreditPack[]>(ENDPOINTS.FEATURED_CREDIT_PACKS);
  },

  // Pack checkout — raw response. Throws ApiError(402) when user has no
  // active subscription (see PackEligibilityError shape).
  // _skipErrorHandler bypasses the global 402 → upgrade-modal interceptor
  // because here 402 means "subscribe first", not "out of credits".
  createCreditPackCheckout: async (
    data: CreditPackCheckoutRequest
  ): Promise<CreditPackCheckoutResponse> => {
    return api.post<CreditPackCheckoutResponse>(ENDPOINTS.CREDIT_PACK_CHECKOUT, data, {
      _skipErrorHandler: true,
    });
  },

  // Purchase history (paginated)
  getCreditPackPurchases: async (): Promise<CreditPackPurchase[]> => {
    const response = await api.get<PaginatedResponse<CreditPackPurchase>>(ENDPOINTS.CREDIT_PACK_PURCHASES);
    return response.data.results;
  },
};
