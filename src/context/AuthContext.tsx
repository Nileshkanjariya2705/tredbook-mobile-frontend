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
  authenticateBiometric: () => Promise<{ success: boolean; message?: string }>;
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
        setIsBiometricSupported(compatible);

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
        const rToken = await tokenStorage.get('refresh_token');
        const bToken = await tokenStorage.get('biometric_refresh_token');
        if (rToken && !bToken) {
          await tokenStorage.set('biometric_refresh_token', rToken);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const authenticateBiometric = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Check hardware support
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) {
        return {
          success: false,
          message: 'Biometrics hardware not available on this device.',
        };
      }
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!isEnrolled) {
        return {
          success: false,
          message: 'No biometrics (fingerprint/face) enrolled in device settings.',
        };
      }

      // 2. Retrieve hardware-secured biometric refresh token
      let bioRefreshToken = await tokenStorage.get('biometric_refresh_token');
      if (!bioRefreshToken) {
        bioRefreshToken = await tokenStorage.get('refresh_token');
      }

      if (!bioRefreshToken) {
        return {
          success: false,
          message: 'No biometric credentials saved. Please sign in with Password or OTP first.',
        };
      }

      // 3. Prompt user for native biometric scan
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock TredBook with Biometrics',
        fallbackLabel: 'Use Password or OTP',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!res.success) {
        let msg = 'Biometric verification cancelled.';
        if (res.error === 'lockout') {
          msg = 'Too many attempts. Biometrics temporarily locked.';
        } else if (res.error === 'not_enrolled') {
          msg = 'No biometrics enrolled in device security settings.';
        } else if (res.error === 'user_cancel') {
          msg = 'Biometric prompt cancelled.';
        } else if (res.error) {
          msg = `Biometric scan failed: ${res.error}`;
        }
        return {
          success: false,
          message: msg,
        };
      }

      // 4. Exchange biometric refresh token with backend for fresh JWT access token
      try {
        const refreshRes = await api.post('/auth/refresh', { refreshToken: bioRefreshToken });
        if (refreshRes.data?.accessToken) {
          await tokenStorage.set('access_token', refreshRes.data.accessToken);
          if (refreshRes.data.refreshToken) {
            await tokenStorage.set('refresh_token', refreshRes.data.refreshToken);
            await tokenStorage.set('biometric_refresh_token', refreshRes.data.refreshToken);
          }
          setIsBiometricEnabled(true);
          await tokenStorage.set('biometrics_enabled', 'true');
          await refreshProfile();
          return { success: true };
        }
      } catch (refreshErr: any) {
        if (refreshErr.response?.status === 401) {
          await tokenStorage.remove('biometric_refresh_token');
          return {
            success: false,
            message: 'Biometric session expired. Please sign in with Password or OTP once to renew.',
          };
        }
        throw refreshErr;
      }

      return {
        success: false,
        message: 'Could not refresh session. Please sign in with password.',
      };
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Biometric authentication failed.';
      return { success: false, message: errorMsg };
    }
  };

  const toggleBiometrics = async (enabled: boolean) => {
    setIsBiometricEnabled(enabled);
    await tokenStorage.set('biometrics_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      const currentRefresh = await tokenStorage.get('refresh_token');
      if (currentRefresh) {
        await tokenStorage.set('biometric_refresh_token', currentRefresh);
      }
    } else {
      await tokenStorage.remove('biometric_refresh_token');
    }
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

        const currentRefresh = await tokenStorage.get('refresh_token');
        if (currentRefresh) {
          await tokenStorage.set('biometric_refresh_token', currentRefresh);
        }
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
    // Do NOT auto-login. User must authenticate with their new credentials.
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
        await tokenStorage.set('biometric_refresh_token', res.data.refreshToken);
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
        await tokenStorage.set('biometric_refresh_token', res.data.refreshToken);
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
        await tokenStorage.set('biometric_refresh_token', res.data.refreshToken);
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
