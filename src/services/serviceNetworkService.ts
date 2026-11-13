import { api } from './api';

export interface ServiceCategory {
  id: string;
  name: string;
  nameHindi: string;
  icon: string;
  description: string;
  providerCount: number;
  averageInspectionFee: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
  trade: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  isGstVerified: boolean;
  trustScore: number;
  inspectionFee: number;
  experienceYears: number;
  phone: string;
  operatingPincodes: string[];
  distanceKm: number;
}

export interface ServiceBooking {
  id: string;
  userId: number;
  providerId: string;
  categoryId: string;
  symptomChecklist: string[];
  description: string;
  preferredTimeSlot: string;
  address: string;
  status:
    | 'ENQUIRY_SUBMITTED'
    | 'QUOTATION_OFFERED'
    | 'BOOKING_CONFIRMED'
    | 'TECHNICIAN_DISPATCHED'
    | 'UNDER_REPAIR'
    | 'COMPLETED'
    | 'CANCELLED';
  quotation?: {
    inspectionFee: number;
    laborCharge: number;
    estimatedPartsCost: number;
    totalEstimatedAmount: number;
    proposedArrivalDate: string;
    proposedTimeSlot: 'MORNING' | 'AFTERNOON' | 'EVENING';
    notes: string;
    quotedAt: string;
  };
  completionOtp?: string;
  warrantyPeriodDays?: number;
  warrantyPassportCode?: string;
  createdAt: string;
  updatedAt: string;
}

export const serviceNetworkService = {
  async getCategories(): Promise<ServiceCategory[]> {
    const res = await api.get('/services/categories');
    return res.data?.data || res.data || [];
  },

  async getProviders(categoryId?: string, pincode?: string): Promise<ServiceProvider[]> {
    const res = await api.get('/services/providers', {
      params: { categoryId, pincode },
    });
    return res.data?.data || res.data || [];
  },

  async createEnquiry(payload: {
    providerId: string;
    categoryId: string;
    symptomChecklist: string[];
    description: string;
    preferredTimeSlot: string;
    address: string;
  }): Promise<ServiceBooking> {
    const res = await api.post('/services/enquiries', payload);
    return res.data?.data || res.data;
  },

  async confirmBooking(enquiryId: string): Promise<ServiceBooking> {
    const res = await api.post(`/services/bookings/confirm/${enquiryId}`);
    return res.data?.data || res.data;
  },

  async updateBookingStatus(
    bookingId: string,
    status: 'TECHNICIAN_DISPATCHED' | 'UNDER_REPAIR' | 'COMPLETED' | 'CANCELLED',
    enteredOtp?: string
  ): Promise<ServiceBooking> {
    const res = await api.patch(`/services/bookings/${bookingId}/status`, {
      status,
      enteredOtp,
    });
    return res.data?.data || res.data;
  },

  async getCustomerBookings(): Promise<ServiceBooking[]> {
    const res = await api.get('/services/customer/bookings');
    return res.data?.data || res.data || [];
  },
};
