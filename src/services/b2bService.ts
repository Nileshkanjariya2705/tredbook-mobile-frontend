import { api } from './api';

export interface B2bSupplier {
  id: string;
  name: string;
  industry: 'TEXTILES' | 'ELECTRONICS' | 'JEWELLERY_METALS' | 'FMCG';
  businessType: 'MANUFACTURER' | 'MILL' | 'PRIMARY_DISTRIBUTOR';
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
  isGstVerified: boolean;
  trustScore: number;
  creditPaymentTerms: string;
  minOrderValue: number;
  contactPhone: string;
}

export interface WholesaleTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
}

export interface WholesaleProduct {
  id: string;
  supplierId: string;
  supplierName: string;
  productSlug: string;
  title: string;
  category: string;
  unit: string;
  moq: number;
  samplePrice: number;
  sampleMaxQty: number;
  pricingTiers: WholesaleTier[];
  leadTimeDays: number;
  specifications: Record<string, string>;
}

export interface B2bRfq {
  id: string;
  retailerUserId: number;
  supplierId: string;
  productId: string;
  quantity: number;
  targetUnitPrice: number;
  totalTargetAmount: number;
  deliveryPincode: string;
  requiredDate: string;
  isSampleOrder: boolean;
  status: 'RFQ_SUBMITTED' | 'QUOTE_RECEIVED' | 'PO_GENERATED' | 'REJECTED';
  supplierQuote?: {
    offeredUnitPrice: number;
    shippingCharge: number;
    totalAmount: number;
    paymentCreditTerms: string;
    promisedDispatchDate: string;
    notes: string;
    quotedAt: string;
  };
  generatedPoNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierComparisonMatrix {
  productSlug: string;
  matrix: Array<{
    supplierId: string;
    supplierName: string;
    tierUnitPrice: number;
    moq: number;
    creditDays: number;
    dispatchLeadDays: number;
    trustScore: number;
    isGstVerified: boolean;
  }>;
}

export const b2bService = {
  async getSuppliers(industry?: string, pincode?: string): Promise<B2bSupplier[]> {
    const res = await api.get('/b2b/suppliers', {
      params: { industry, pincode },
    });
    return res.data?.data || res.data || [];
  },

  async getWholesaleCatalog(supplierId?: string): Promise<WholesaleProduct[]> {
    const res = await api.get('/b2b/catalog', {
      params: { supplierId },
    });
    return res.data?.data || res.data || [];
  },

  async createRfq(payload: {
    supplierId: string;
    productId: string;
    quantity: number;
    targetUnitPrice: number;
    deliveryPincode: string;
    requiredDate: string;
    isSampleOrder?: boolean;
  }): Promise<B2bRfq> {
    const res = await api.post('/b2b/rfq', payload);
    return res.data?.data || res.data;
  },

  async acceptRfq(rfqId: string): Promise<B2bRfq> {
    const res = await api.post(`/b2b/rfq/${rfqId}/accept`);
    return res.data?.data || res.data;
  },

  async getCustomerRfqs(): Promise<B2bRfq[]> {
    const res = await api.get('/b2b/my-rfqs');
    return res.data?.data || res.data || [];
  },

  async compareSuppliers(productSlug: string): Promise<SupplierComparisonMatrix> {
    const res = await api.get(`/b2b/compare/${productSlug}`);
    return res.data?.data || res.data;
  },
};
