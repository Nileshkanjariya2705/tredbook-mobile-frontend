import { api } from './api';

export interface PurchaseBookRecord {
  id: string;
  invoiceNumber: string;
  merchantName: string;
  merchantGstin: string;
  merchantAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  gstAmount: number;
  grandTotal: number;
  purchaseDate: string;
  warrantyValidTill?: string;
  warrantyStatus: 'ACTIVE' | 'EXPIRED' | 'LIFETIME';
  category: string;
}

export interface LoyaltyData {
  balance: number;
  tier: string;
  benefits: string[];
  recentHistory: Array<{
    id: string;
    description: string;
    coins: string;
    type: 'CREDIT' | 'DEBIT';
    date: string;
  }>;
}

export interface HomeDashboardData {
  customer: {
    id: string;
    name: string;
    phone: string;
    customerId: string;
    reliabilityScore: number;
    scoreTier: string;
  };
  loyalty: {
    tredCoins: number;
    tier: string;
    nextTier: string;
    cashValue: string;
  };
  purchaseBookCount: number;
  activeOrder: {
    id: string;
    orderCode: string;
    userId: number;
    shopId: string;
    shopName: string;
    items: Array<{
      productId?: string;
      name: string;
      price: number;
      quantity: number;
    }>;
    totalAmount: number;
    gstAmount: number;
    grandTotal: number;
    paymentMethod: string;
    deliveryAddress: string;
    status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED';
    createdAt: string;
  };
  quickStats: {
    verifiedOrders: number;
    totalSaved: string;
    activeWarranties: number;
  };
}

export const homeApi = {
  getDashboard: async (): Promise<HomeDashboardData> => {
    const res = await api.get('/home/dashboard');
    return res.data?.data || res.data;
  },

  getPurchaseBook: async (): Promise<PurchaseBookRecord[]> => {
    const res = await api.get('/home/purchase-book');
    return res.data?.data || res.data || [];
  },

  getLoyalty: async (): Promise<LoyaltyData> => {
    const res = await api.get('/home/loyalty');
    return res.data?.data || res.data;
  },
};
