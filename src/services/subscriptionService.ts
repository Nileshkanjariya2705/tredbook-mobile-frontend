import { api } from './api';

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  durationDays: number;
  features: {
    maxProducts?: number;
    maxStaff?: number;
    thermalPrinting?: boolean;
    radiusBoost?: number;
    prioritySupport?: boolean;
    customBranding?: boolean;
    loyaltyMultiplier?: number;
  };
  isActive: boolean;
  sortOrder: number;
}

export interface CurrentSubscription {
  id?: number;
  status: string;
  isTrial?: boolean;
  planName: string;
  planId: number;
  monthlyPrice: number;
  daysRemaining: number;
  startsAt?: string | null;
  endsAt?: string | null;
  autoRenewalActive: boolean;
  features: {
    maxProducts?: number;
    maxStaff?: number;
    thermalPrinting?: boolean;
    radiusBoost?: number;
    prioritySupport?: boolean;
    customBranding?: boolean;
    loyaltyMultiplier?: number;
  };
  usage: {
    itemsCount: number;
    maxProducts: number;
    isQuotaExceeded: boolean;
  };
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'percent' | 'amount';
  discountValue: number;
  discountAmount: number;
  finalAmount: number;
}

export interface CheckoutResult {
  orderId: string;
  planId: number;
  planName: string;
  billingCycle: 'monthly' | 'annual';
  baseAmount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  keyId: string;
}

export const subscriptionService = {
  async getPlans(): Promise<SubscriptionPlan[]> {
    const res = await api.get('/subscriptions/plans');
    return res.data?.data || res.data || [];
  },

  async getCurrentSubscription(companyId?: number): Promise<CurrentSubscription> {
    const res = await api.get('/subscriptions/current', {
      params: companyId ? { companyId } : undefined,
    });
    return res.data?.data || res.data;
  },

  async validateCoupon(code: string, planId: number): Promise<CouponValidationResult> {
    const res = await api.post('/subscriptions/validate-coupon', { code, planId });
    return res.data?.data || res.data;
  },

  async checkout(
    planId: number,
    billingCycle: 'monthly' | 'annual' = 'monthly',
    couponCode?: string,
    companyId?: number,
  ): Promise<CheckoutResult> {
    const res = await api.post(
      '/subscriptions/checkout',
      { planId, billingCycle, couponCode },
      { params: companyId ? { companyId } : undefined },
    );
    return res.data?.data || res.data;
  },

  async verifyPayment(data: {
    planId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    couponCode?: string;
    billingCycle?: 'monthly' | 'annual';
    companyId?: number;
  }) {
    const res = await api.post('/subscriptions/verify', data, {
      params: data.companyId ? { companyId: data.companyId } : undefined,
    });
    return res.data?.data || res.data;
  },

  async cancelAutoRenewal(companyId?: number, reason?: string) {
    const res = await api.post(
      '/subscriptions/cancel-auto-renewal',
      { reason },
      { params: companyId ? { companyId } : undefined },
    );
    return res.data?.data || res.data;
  },
};
