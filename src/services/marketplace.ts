import { api } from './api';

export interface MarketplaceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface StorefrontShop {
  id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  pincode: string;
  phone?: string;
  gstNumber?: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  trustScore: number;
  isVerified: boolean;
  isOpen: boolean;
  timings: string;
  logo: string;
  banner: string;
  productCount: number;
}

export interface ProductItem {
  id: string;
  shopId: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  unit: string;
  description: string;
  image: string;
  inStock: boolean;
  stockCount?: number;
  hsnSacCode?: string;
  gstRate?: number;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}

export interface CreateOrderPayload {
  shopId: string;
  shopName: string;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    unit?: string;
  }>;
  paymentMethod: 'COD' | 'PAY_AT_STORE' | 'UPI';
  deliveryAddress: string;
  notes?: string;
}

export const marketplaceApi = {
  getCategories: async (): Promise<MarketplaceCategory[]> => {
    const res = await api.get('/marketplace/categories');
    return res.data?.data || res.data || [];
  },

  getShops: async (params?: { category?: string; search?: string; radiusKm?: number }): Promise<StorefrontShop[]> => {
    const res = await api.get('/marketplace/shops', { params });
    return res.data?.data || res.data || [];
  },

  getShopById: async (shopId: string): Promise<StorefrontShop> => {
    const res = await api.get(`/marketplace/shops/${shopId}`);
    return res.data?.data || res.data;
  },

  getShopProducts: async (shopId: string): Promise<ProductItem[]> => {
    const res = await api.get(`/marketplace/shops/${shopId}/products`);
    return res.data?.data || res.data || [];
  },

  inquireProduct: async (payload: {
    productId: string;
    shopId: string;
    productName: string;
    productPrice: number;
    productImage?: string;
    initialMessage?: string;
  }) => {
    const res = await api.post('/marketplace/inquire', payload);
    return res.data?.data || res.data;
  },

  createOrder: async (payload: CreateOrderPayload) => {
    const res = await api.post('/marketplace/orders', payload);
    return res.data?.data || res.data;
  },

  getCustomerOrders: async () => {
    const res = await api.get('/marketplace/orders');
    return res.data?.data || res.data || [];
  },
};
