// Subscription Plan
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  plan_type: 'individual' | 'team';
  keyword_credits: number;
  ai_credits: number;
  price: string;
  billing_cycle: 'monthly' | 'yearly' | 'lifetime';
  max_team_members: number;
  features: Record<string, unknown>;
  is_active: boolean;
  is_featured: boolean;
  is_one_time_purchase: boolean;
  is_team_plan: boolean;
  is_individual_plan: boolean;
}

// Full subscription detail
export interface Subscription {
  id: string;
  user: number;
  user_email: string;
  team: string | null;
  team_name: string | null;
  plan: string;
  plan_details: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'paused' | 'pending' | 'past_due' | 'trialing';
  keyword_credits_remaining: number;
  ai_credits_remaining: number;
  start_date: string;
  end_date: string | null;
  current_period_start: string;
  current_period_end: string;
  days_remaining: number;
  auto_renew: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  is_active: boolean;
  is_expired: boolean;
  is_team_subscription: boolean;
  is_trial: boolean;
  trial_end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Lightweight subscription for lists
export interface SubscriptionListItem {
  id: string;
  plan_name: string;
  team_name: string | null;
  status: string;
  keyword_credits_remaining: number;
  ai_credits_remaining: number;
  current_period_end: string;
  days_remaining: number;
  is_active: boolean;
  is_trial: boolean;
}

// Credit balance (from /subscriptions/subscriptions/credits/)
// Combined sub + pack-wallet totals plus per-bucket breakdown.
export interface CreditBalance {
  has_subscription: boolean;
  subscription_type: 'individual' | 'team' | null;
  // Spendable totals = subscription bucket + non-negative wallet bucket.
  keyword_credits: number;
  ai_credits: number;
  // Per-bucket breakdown (added with the credit-pack feature).
  sub_keyword_credits: number;
  sub_ai_credits: number;
  // Wallet balances may go negative on refund, so they're surfaced raw here.
  pack_keyword_credits: number;
  pack_ai_credits: number;
  subscription_id: string | null;
  plan_name: string | null;
  days_remaining: number;
  current_period_end: string | null;
}

// Credit transaction history
export interface CreditTransaction {
  id: string;
  user: number;
  user_email: string;
  subscription: string;
  subscription_plan: string;
  transaction_type: string;
  credit_type: 'keyword' | 'ai';
  amount: number;
  balance_after: number;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Subscription history
export interface SubscriptionHistoryItem {
  id: string;
  subscription: string;
  action: string;
  from_plan: string | null;
  from_plan_name: string | null;
  to_plan: string | null;
  to_plan_name: string | null;
  performed_by: number | null;
  performed_by_email: string | null;
  notes: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Checkout
export interface CheckoutRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  success_url?: string;
  cancel_url?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkout_url: string;
  transaction_id: string;
  plan_name: string;
  billing_cycle: string;
}

// Billing portal
export interface BillingPortalResponse {
  success: boolean;
  update_payment_url: string | null;
  cancel_url: string | null;
  subscription_id: string;
  plan_name: string;
  status: string;
}

// Cancel subscription
export interface CancelSubscriptionRequest {
  reason?: string;
  cancel_immediately?: boolean;
}

// Toggle auto-renew
export interface ToggleAutoRenewResponse {
  auto_renew: boolean;
  message: string;
  subscription: Subscription;
}

// Change plan
export interface ChangePlanRequest {
  plan_id: string;
  billing_cycle: 'monthly' | 'yearly';
  proration_mode?: 'prorated_immediately' | 'full_next_billing_period';
}

export interface ChangePlanResponse {
  detail: string;
  subscription: Subscription;
  new_plan: string;
}

// 402 error shape
export interface InsufficientCreditsError {
  error: 'insufficient_credits';
  message: string;
  credits_available: number;
  credits_needed: number;
  credit_type?: 'ai' | 'keyword';
}

// =========================================================================
// Credit Packs — one-time, non-expiring top-up purchases
// =========================================================================

// Catalog entry — admin-configurable in Django admin; auto-syncs to Paddle.
export interface CreditPack {
  id: string;
  name: string;
  description: string;
  keyword_credits: number;
  ai_credits: number;
  price: string;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

// User's purchase history record.
export interface CreditPackPurchase {
  id: string;
  pack: string;
  pack_name: string;
  keyword_credits_granted: number;
  ai_credits_granted: number;
  price_paid: string;
  currency: string;
  status: 'completed' | 'refunded' | 'failed';
  paddle_transaction_id: string;
  refunded_at: string | null;
  refund_reason: string;
  created_at: string;
}

// POST /subscriptions/credit-packs/checkout/
export interface CreditPackCheckoutRequest {
  pack_id: string;
  success_url?: string;
  cancel_url?: string;
}

export interface CreditPackCheckoutResponse {
  success: boolean;
  checkout_url: string;
  transaction_id: string;
  pack_name: string;
  keyword_credits: number;
  ai_credits: number;
  price: string;
}

// 402 thrown by the checkout endpoint when the user lacks an active subscription.
export interface PackEligibilityError {
  error: 'subscription_required';
  message: string;
}
