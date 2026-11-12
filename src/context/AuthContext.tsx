import React, { createContext, useContext, useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { api, tokenStorage } from '../services/api';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  customerId: string;
  phone_verified: boolean;
  email_verified: boolean;
  profile_image?: string | null;
}

export interface CompanySummary {
  id: string;
  name: string;
  gstNumber?: string | null;
  role?: string;
  logo?: string | null;
  isOwner: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  terms?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  companies: { owned: CompanySummary[]; shared: CompanySummary[] };
  activeCompanyId: string | null;
  setActiveCompanyId: (id: string) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isBiometricSupported: boolean;
  isBiometricEnabled: boolean;
  sendOtp: (destination: string, channel: 'email' | 'phone', purpose?: string) => Promise<any>;
  verifyOtp: (destination: string, code: string, channel: 'email' | 'phone', purpose?: string, fullName?: string) => Promise<any>;
  loginPassword: (login: string, password: string) => Promise<any>;
  register: (payload: RegisterPayload) => Promise<any>;
  authenticateBiometric: () => Promise<boolean>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  hasDismissedBiometricPrompt: boolean;
  dismissBiometricPrompt: () => Promise<void>;
  enableBiometricsPostLogin: () => Promise<boolean>;
  forgotPassword: (destination: string, channel: 'email' | 'phone') => Promise<any>;
  resetPassword: (destination: string, code: string, channel: 'email' | 'phone', newPassword: string) => Promise<any>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [companies, setCompanies] = useState<{ owned: CompanySummary[]; shared: CompanySummary[] }>({
    owned: [],
    shared: [],
  });
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [hasDismissedBiometricPrompt, setHasDismissedBiometricPrompt] = useState<boolean>(false);

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        const comp = res.data.companies || { owned: [], shared: [] };
        setCompanies(comp);

        // Auto-select first company if none active
        if (!activeCompanyId) {
          if (comp.owned.length > 0) setActiveCompanyId(comp.owned[0].id);
          else if (comp.shared.length > 0) setActiveCompanyId(comp.shared[0].id);
        }
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      // Check biometric hardware support
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);

        const bioSetting = await tokenStorage.get('biometrics_enabled');
        setIsBiometricEnabled(bioSetting === 'true');

        const dismissedSetting = await tokenStorage.get('biometric_prompt_dismissed');
        setHasDismissedBiometricPrompt(dismissedSetting === 'true');
      } catch {
        setIsBiometricSupported(false);
      }

      const token = await tokenStorage.get('access_token');
      if (token) {
        await refreshProfile();
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const authenticateBiometric = async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock TredBook with Biometrics',
        fallbackLabel: 'Use Password or OTP',
      });
      if (res.success) {
        const token = await tokenStorage.get('access_token');
        if (token) {
          await refreshProfile();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleBiometrics = async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    await tokenStorage.set('biometrics_enabled', enabled ? 'true' : 'false');
  };

  const dismissBiometricPrompt = async () => {
    setHasDismissedBiometricPrompt(true);
    await tokenStorage.set('biometric_prompt_dismissed', 'true');
  };

  const enableBiometricsPostLogin = async (): Promise<boolean> => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm Biometrics to Enable Quick Login',
        fallbackLabel: 'Cancel',
      });
      if (res.success) {
        setIsBiometricEnabled(true);
        await tokenStorage.set('biometrics_enabled', 'true');
        setHasDismissedBiometricPrompt(true);
        await tokenStorage.set('biometric_prompt_dismissed', 'true');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const forgotPassword = async (destination: string, channel: 'email' | 'phone') => {
    const res = await api.post('/auth/forgot-password', { destination, channel });
    return res.data;
  };

  const resetPassword = async (
    destination: string,
    code: string,
    channel: 'email' | 'phone',
    newPassword: string,
  ) => {
    const res = await api.post('/auth/reset-password', {
      destination,
      code,
      channel,
      newPassword,
    });
    if (res.data?.accessToken) {
      await tokenStorage.set('access_token', res.data.accessToken);
      if (res.data.refreshToken) {
        await tokenStorage.set('refresh_token', res.data.refreshToken);
      }
      await refreshProfile();
    }
    return res.data;
  };

  const sendOtp = async (destination: string, channel: 'email' | 'phone', purpose: string = 'login') => {
    const res = await api.post('/auth/send-otp', { destination, channel, purpose });
    return res.data;
  };

  const verifyOtp = async (destination: string, code: string, channel: 'email' | 'phone', purpose: string = 'login', fullName?: string) => {
    const res = await api.post('/auth/verify-otp', { destination, code, channel, purpose, fullName });
    if (res.data?.accessToken) {
      await tokenStorage.set('access_token', res.data.accessToken);
      if (res.data.refreshToken) {
        await tokenStorage.set('refresh_token', res.data.refreshToken);
      }
      await refreshProfile();
    }
    return res.data;
  };

  const loginPassword = async (login: string, password: string) => {
    const res = await api.post('/auth/login', { login, password });
    if (res.data?.accessToken) {
      await tokenStorage.set('access_token', res.data.accessToken);
      if (res.data.refreshToken) {
        await tokenStorage.set('refresh_token', res.data.refreshToken);
      }
      await refreshProfile();
    }
    return res.data;
  };

  const register = async (payload: RegisterPayload) => {
    const res = await api.post('/auth/register', payload);
    if (res.data?.accessToken) {
      await tokenStorage.set('access_token', res.data.accessToken);
      if (res.data.refreshToken) {
        await tokenStorage.set('refresh_token', res.data.refreshToken);
      }
      await refreshProfile();
    }
    return res.data;
  };

  const logout = async () => {
    await tokenStorage.remove('access_token');
    await tokenStorage.remove('refresh_token');
    setUser(null);
    setCompanies({ owned: [], shared: [] });
    setActiveCompanyId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        companies,
        activeCompanyId,
        setActiveCompanyId,
        isLoading,
        isAuthenticated: !!user,
        isBiometricSupported,
        isBiometricEnabled,
        hasDismissedBiometricPrompt,
        dismissBiometricPrompt,
        enableBiometricsPostLogin,
        sendOtp,
        verifyOtp,
        loginPassword,
        register,
        authenticateBiometric,
        toggleBiometrics,
        forgotPassword,
        resetPassword,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
