import { api } from './api';

export interface TrustFactor {
  factor: string;
  weightPerc: number;
  score: number;
  description: string;
}

export interface VerifiedReview {
  id: string;
  userId: number;
  userName: string;
  companyId: string;
  invoiceCode: string;
  rating: number;
  comment: string;
  tags: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface CommercialDispute {
  id: string;
  userId: number;
  customerName: string;
  companyId: string;
  companyName: string;
  invoiceCode: string;
  reason: string;
  description: string;
  claimAmount?: number;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';
  slaExpiresAt: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface BtsScoreResponse {
  companyId: string;
  score: number;
  scale: string;
  tier: string;
  trend: string;
  reviewsCount: number;
  averageRating: number;
  breakdown: TrustFactor[];
  verifiedReviews: VerifiedReview[];
}

export interface CrsScoreResponse {
  userId: number;
  customerName: string;
  customerId: string;
  score: number;
  scale: string;
  tier: string;
  trend: string;
  breakdown: TrustFactor[];
  conductTips: string[];
}

export const trustApi = {
  getBts: async (companyId: string = '1'): Promise<BtsScoreResponse> => {
    const res = await api.get(`/trust/bts/${companyId}`);
    return res.data?.data || res.data;
  },

  getCrs: async (): Promise<CrsScoreResponse> => {
    const res = await api.get('/trust/crs');
    return res.data?.data || res.data;
  },

  submitReview: async (payload: {
    companyId: string;
    invoiceCode: string;
    rating: number;
    comment: string;
    tags?: string[];
  }): Promise<{ message: string; review: VerifiedReview }> => {
    const res = await api.post('/trust/reviews', payload);
    return res.data?.data || res.data;
  },

  createDispute: async (payload: {
    companyId: string;
    invoiceCode: string;
    reason: string;
    description: string;
    claimAmount?: number;
  }): Promise<{ message: string; dispute: CommercialDispute }> => {
    const res = await api.post('/trust/disputes', payload);
    return res.data?.data || res.data;
  },

  getDisputes: async (): Promise<CommercialDispute[]> => {
    const res = await api.get('/trust/disputes');
    return res.data?.data || res.data || [];
  },

  resolveDispute: async (
    disputeId: string,
    payload: { status: 'RESOLVED' | 'REJECTED'; resolutionNotes: string },
  ): Promise<{ message: string; dispute: CommercialDispute }> => {
    const res = await api.patch(`/trust/disputes/${disputeId}/resolve`, payload);
    return res.data?.data || res.data;
  },
};
