import { api } from './api';

export interface BusinessLoyaltyConfig {
  companyId: number;
  minInvoiceValue: number;
  pointsPerHundred: number;
  redemptionValuePerPoint: number;
  minRedemptionThreshold: number;
  maxInvoicePercentCap: number;
  expiryDays: number;
  isActive: boolean;
}

export interface CustomerReferralProfile {
  userId: number;
  customerId: string;
  referralCode: string;
  referralLink: string;
  qrPayload: string;
  rewardPointsPerReferral: number;
  refereeWelcomePoints: number;
  totalReferrals: number;
  successfulConversions: number;
  totalCoinsEarned: number;
  pendingRewardCoins: number;
}

export interface LoyaltyLedgerData {
  currentBalance: number;
  loyaltyTier: string;
  multiplier: number;
  expiringPointsNext30Days: number;
  ledger: Array<{
    id: string;
    date: string;
    type: string;
    points: number;
    description: string;
    transactionRef?: string;
    balanceAfter: number;
  }>;
}

export const loyaltyService = {
  async getBusinessConfig(companyId: number): Promise<BusinessLoyaltyConfig> {
    const res = await api.get(`/loyalty/business/config/${companyId}`);
    return res.data?.data || res.data;
  },

  async updateBusinessConfig(companyId: number, config: Partial<BusinessLoyaltyConfig>): Promise<BusinessLoyaltyConfig> {
    const res = await api.post(`/loyalty/business/config/${companyId}`, config);
    return res.data?.data || res.data;
  },

  async getCustomerReferralProfile(): Promise<CustomerReferralProfile> {
    const res = await api.get('/loyalty/customer/referral-code');
    return res.data?.data || res.data;
  },

  async claimReferral(referralCode: string) {
    const res = await api.post('/loyalty/referrals/claim', { referralCode });
    return res.data?.data || res.data;
  },

  async getCustomerLedger(): Promise<LoyaltyLedgerData> {
    const res = await api.get('/loyalty/customer/ledger');
    return res.data?.data || res.data;
  },

  async calculateRedemption(companyId: number, billAmount: number, pointsToRedeem: number) {
    const res = await api.post('/loyalty/redeem', { companyId, billAmount, pointsToRedeem });
    return res.data?.data || res.data;
  },
};
