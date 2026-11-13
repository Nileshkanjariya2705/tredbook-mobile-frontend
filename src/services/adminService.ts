import { api } from './api';

export interface AdminOverview {
  totalUsers: number;
  totalCompanies: number;
  activeSubscriptions: number;
  totalCatalogProducts: number;
  pendingKycReviews: number;
  activeDisputes: number;
  reportedProducts: number;
  platformHealth: string;
}

export interface AdminUser {
  id: number;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  suspendReason?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface MerchantKycItem {
  id: number;
  businessName: string;
  gstNumber: string;
  panNumber: string;
  phone: string;
  email: string;
  address: string;
  status: 'verified' | 'pending_review' | 'suspended';
  documentSubmitted: string;
  createdAt: string;
}

export interface ModerationProduct {
  id: number;
  name: string;
  itemCode: string;
  price: number;
  isPublished: boolean;
  companyId: number;
  flaggedReason?: string;
  reportsCount: number;
}

export interface DisputeItem {
  id: string;
  orderId: string;
  merchantName: string;
  customerName: string;
  amount: number;
  reason: string;
  status: string;
  slaHoursRemaining: number;
  evidence: Array<{ type: string; url: string }>;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  adminName: string;
  action: string;
  route: string;
  subject: string;
  details: string;
  isSecurity: boolean;
  timestamp: string;
}

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const res = await api.get('/admin/overview');
    return res.data?.data || res.data;
  },

  async getUsers(search?: string): Promise<AdminUser[]> {
    const res = await api.get('/admin/users', {
      params: search ? { search } : undefined,
    });
    return res.data?.data || res.data || [];
  },

  async updateUserStatus(userId: number, status: 'active' | 'suspended', reason?: string) {
    const res = await api.patch(`/admin/users/${userId}/status`, { status, reason });
    return res.data?.data || res.data;
  },

  async getMerchantKycList(): Promise<MerchantKycItem[]> {
    const res = await api.get('/admin/merchants/kyc');
    return res.data?.data || res.data || [];
  },

  async verifyMerchantKyc(companyId: number, status: 'approved' | 'rejected', notes?: string) {
    const res = await api.post(`/admin/merchants/${companyId}/verify`, { status, notes });
    return res.data?.data || res.data;
  },

  async getModerationProducts(): Promise<ModerationProduct[]> {
    const res = await api.get('/admin/moderation/products');
    return res.data?.data || res.data || [];
  },

  async moderateProduct(itemId: number, status: 'published' | 'taken_down', reason?: string) {
    const res = await api.patch(`/admin/moderation/products/${itemId}/take-down`, {
      status,
      reason,
    });
    return res.data?.data || res.data;
  },

  async getDisputes(): Promise<DisputeItem[]> {
    const res = await api.get('/admin/disputes');
    return res.data?.data || res.data || [];
  },

  async resolveDispute(
    disputeId: string,
    status: 'resolved' | 'dismissed' | 'upheld',
    resolution: 'refund' | 'replace' | 'dismiss' | 'upheld',
    notes: string,
  ) {
    const res = await api.post(`/admin/disputes/${disputeId}/resolve`, {
      status,
      resolution,
      notes,
    });
    return res.data?.data || res.data;
  },

  async getAuditLogs(): Promise<AuditLogItem[]> {
    const res = await api.get('/admin/audit-logs');
    return res.data?.data || res.data || [];
  },
};
