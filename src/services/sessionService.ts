import { api } from './api';

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browserOrApp: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export const sessionService = {
  async getSessions(): Promise<DeviceSession[]> {
    const res = await api.get('/auth/sessions');
    return res.data?.data || res.data || [];
  },

  async deleteSession(sessionId: string) {
    const res = await api.delete(`/auth/sessions/${sessionId}`);
    return res.data?.data || res.data;
  },

  async deleteOtherSessions() {
    const res = await api.delete('/auth/sessions/other');
    return res.data?.data || res.data;
  },
};
