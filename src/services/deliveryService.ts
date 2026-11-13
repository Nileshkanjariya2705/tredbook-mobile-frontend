import { api } from './api';

export interface DeliveryDriver {
  id: number;
  name: string;
  phone: string;
  vehicleType: 'MOTORCYCLE' | 'EV_SCOOTER' | 'TEMPO';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
  status: 'AVAILABLE' | 'ON_DELIVERY' | 'OFFLINE';
  currentLocation: {
    lat: number;
    lng: number;
    area: string;
  };
}

export interface OrderDeliveryTracking {
  orderId: string;
  status: 'CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'FULFILLED' | 'CANCELLED';
  deliveryOtp: string;
  etaMinutes: number;
  distanceKm: number;
  dispatchedAt: string;
  deliveredAt: string | null;
  driver: {
    id: number;
    name: string;
    phone: string;
    vehicleType: string;
    vehicleNumber: string;
    rating: number;
    currentLocation: {
      lat: number;
      lng: number;
      area: string;
    };
  };
}

class DeliveryService {
  async getAvailableDrivers(): Promise<{ totalDrivers: number; availableDrivers: DeliveryDriver[] }> {
    const res = await api.get('/delivery/drivers');
    return res.data?.data || res.data;
  }

  async assignDriver(orderId: string, driverId: number): Promise<{ success: boolean; message: string; delivery: any }> {
    const res = await api.post('/delivery/assign', { orderId, driverId });
    return res.data?.data || res.data;
  }

  async getOrderTracking(orderId: string): Promise<OrderDeliveryTracking> {
    const res = await api.get(`/delivery/track/${orderId}`);
    return res.data?.data || res.data;
  }

  async completeDelivery(orderId: string, otp: string): Promise<{ success: boolean; status: string; message: string; deliveredAt: string }> {
    const res = await api.post('/delivery/complete', { orderId, otp });
    return res.data?.data || res.data;
  }

  async updateDriverLocation(driverId: number, lat: number, lng: number, area?: string) {
    const res = await api.post('/delivery/location', { driverId, lat, lng, area });
    return res.data?.data || res.data;
  }
}

export const deliveryService = new DeliveryService();
