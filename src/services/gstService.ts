import { api } from './api';

export interface GstLineItem {
  name: string;
  hsnCode: string;
  quantity: number;
  unitPrice: number;
  gstRate: number;
  cessRate?: number;
}

export interface TaxCalculationResult {
  isInterState: boolean;
  supplyType: 'INTRA_STATE' | 'INTER_STATE';
  sellerStateCode: string;
  buyerStateCode: string;
  totalTaxableAmount: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalCess: number;
  grandTotal: number;
  items: Array<{
    name: string;
    hsnCode: string;
    quantity: number;
    unitPrice: number;
    taxableAmount: number;
    cgstRate: number;
    cgstAmount: number;
    sgstRate: number;
    sgstAmount: number;
    igstRate: number;
    igstAmount: number;
    cessAmount: number;
    totalAmount: number;
  }>;
}

export interface EInvoiceRecord {
  irn: string;
  ackNo: string;
  ackDate: string;
  invoiceNumber: string;
  invoiceDate: string;
  sellerGstin: string;
  buyerGstin: string;
  totalTaxableAmount: number;
  totalTaxAmount: number;
  grandTotal: number;
  signedQrCodeData: string;
  status: 'GENERATED' | 'CANCELLED';
}

export interface EWayBillRecord {
  ewayBillNo: string;
  ewayBillDate: string;
  validUpto: string;
  invoiceNumber: string;
  consignorGstin: string;
  consigneeGstin: string;
  fromPincode: string;
  toPincode: string;
  distanceKm: number;
  mainHsnCode: string;
  consignmentValue: number;
  partB: {
    vehicleNumber: string;
    transporterId?: string;
    transporterName?: string;
    transportDocNo?: string;
  };
  status: 'ACTIVE' | 'CANCELLED';
}

export interface GstrFilingSummary {
  returnPeriod: string;
  companyId: number;
  totalInvoicesCount: number;
  b2bInvoicesCount: number;
  b2cInvoicesCount: number;
  totalTaxableTurnover: number;
  taxLiability: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  gstr1Status: string;
  gstr3bStatus: string;
}

class GstService {
  async calculateTaxes(
    sellerGstin: string,
    buyerGstin: string,
    items: GstLineItem[]
  ): Promise<TaxCalculationResult> {
    const res = await api.post('/gst/calculate', { sellerGstin, buyerGstin, items });
    return res.data?.data || res.data;
  }

  async generateEInvoice(payload: {
    invoiceNumber: string;
    invoiceDate: string;
    sellerGstin: string;
    buyerGstin: string;
    items: GstLineItem[];
  }): Promise<EInvoiceRecord> {
    const res = await api.post('/gst/e-invoice', payload);
    return res.data?.data || res.data;
  }

  async generateEWayBill(payload: {
    invoiceNumber: string;
    consignorGstin: string;
    consigneeGstin: string;
    fromPincode: string;
    toPincode: string;
    distanceKm: number;
    mainHsnCode: string;
    consignmentValue: number;
    vehicleNumber: string;
    transporterName?: string;
    transportDocNo?: string;
  }): Promise<EWayBillRecord> {
    const res = await api.post('/gst/e-way-bill', payload);
    return res.data?.data || res.data;
  }

  async getEWayBills(): Promise<EWayBillRecord[]> {
    const res = await api.get('/gst/e-way-bills');
    return res.data?.data || res.data || [];
  }

  async getGstrSummary(month?: number, year?: number): Promise<GstrFilingSummary> {
    const res = await api.get('/gst/summary', { params: { month, year } });
    return res.data?.data || res.data;
  }
}

export const gstService = new GstService();
