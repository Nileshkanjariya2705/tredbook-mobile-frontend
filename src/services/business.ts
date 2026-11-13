import { api } from './api';

export interface BusinessCompany {
  id: string;
  businessName: string;
  gstNumber: string;
  panNumber?: string;
  businessAddress?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  trustScore: number;
  businessCode: string;
  isVerified: boolean;
  isPrimary?: boolean;
}

export interface BusinessItem {
  id: string;
  companyId: string;
  name: string;
  itemCode: string;
  hsnSacCode: string;
  salePrice: number;
  mrp: number;
  stockCount: number;
  unit: string;
  description: string;
  category: string;
  isPublished: boolean;
  image?: string;
}

export interface MerchantOrder {
  id: string;
  orderCode: string;
  userId: number;
  customerName?: string;
  customerPhone?: string;
  shopId: string;
  shopName: string;
  items: Array<{
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
  createdAt: string | Date;
}

export const businessApi = {
  getCompanies: async (): Promise<BusinessCompany[]> => {
    const res = await api.get('/business/companies');
    return res.data?.data || res.data || [];
  },

  createCompany: async (payload: {
    businessName: string;
    gstNumber?: string;
    panNumber?: string;
    businessAddress?: string;
    pincode?: string;
    phone?: string;
    email?: string;
  }): Promise<{ message: string; company: BusinessCompany }> => {
    const res = await api.post('/business/companies', payload);
    return res.data?.data || res.data;
  },

  getItems: async (companyId?: string): Promise<BusinessItem[]> => {
    const res = await api.get('/business/items', {
      params: companyId ? { companyId } : undefined,
    });
    return res.data?.data || res.data || [];
  },

  createItem: async (payload: {
    companyId?: string;
    name: string;
    itemCode?: string;
    hsnSacCode?: string;
    price: number;
    mrp?: number;
    unit?: string;
    stockCount?: number;
    description?: string;
    category?: string;
    publishedToMarketplace?: boolean;
  }): Promise<{ message: string; item: BusinessItem }> => {
    const res = await api.post('/business/items', payload);
    return res.data?.data || res.data;
  },

  togglePublishItem: async (
    itemId: string,
    publish: boolean,
  ): Promise<{ success: boolean; itemId: string; isPublished: boolean }> => {
    const res = await api.patch(`/business/items/${itemId}/publish`, {
      publish,
    });
    return res.data?.data || res.data;
  },

  getOrders: async (companyId?: string): Promise<MerchantOrder[]> => {
    const res = await api.get('/business/orders', {
      params: companyId ? { companyId } : undefined,
    });
    return res.data?.data || res.data || [];
  },

  updateOrderStatus: async (
    orderId: string,
    status: 'PREPARING' | 'DISPATCHED' | 'DELIVERED',
  ): Promise<{ success: boolean; orderId: string; status: string; message: string }> => {
    const res = await api.patch(`/business/orders/${orderId}/status`, {
      status,
    });
    return res.data?.data || res.data;
  },

  generateSsoTicket: async (
    companyId?: string,
  ): Promise<{ ticket: string; redirectUrl: string; message: string }> => {
    const res = await api.post('/business/sso-ticket', { companyId });
    return res.data?.data || res.data;
  },
};
