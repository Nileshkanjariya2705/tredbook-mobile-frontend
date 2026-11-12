import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { sendOtp, verifyOtp, loginPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'otp' | 'password'>('otp');
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`;
      const res = await sendOtp(formattedPhone, 'phone', 'signup');
      setIsOtpSent(true);
      setCountdown(60);
      if (res.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`;
      await verifyOtp(formattedPhone, otpCode, 'phone', 'signup');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!loginInput || !password) {
      setErrorMsg('Please provide your email/phone and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginPassword(loginInput, password);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Invalid login credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Sign-In',
      'Native Google OAuth uses @react-native-google-signin/google-signin in production EAS builds. To test right now, use Mobile OTP or Password.',
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandLogo}>TredBook</Text>
          <Text style={styles.brandTagline}>MSME Commerce, Communication & Accounting</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'otp' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('otp');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'otp' && styles.tabTextActive]}>
              Mobile OTP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'password' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('password');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'password' && styles.tabTextActive]}>
              Email / Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert */}
        {!!errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {/* Debug OTP Banner for Fast Testing */}
        {debugOtp && isOtpSent && (
          <View style={styles.debugBox}>
            <Text style={styles.debugText}>Dev Mode Test OTP: {debugOtp}</Text>
          </View>
        )}

        {/* OTP Flow */}
        {activeTab === 'otp' ? (
          <View style={styles.card}>
            {!isOtpSent ? (
              <>
                <Text style={styles.inputLabel}>Enter Mobile Number</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="98765 43210"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSendOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Get 6-Digit OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.inputLabel}>Enter 6-Digit OTP sent to +91 {phone.slice(-10)}</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  textAlign="center"
                />
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleVerifyOtp}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  {countdown > 0 ? (
                    <Text style={styles.countdownText}>Resend code in {countdown}s</Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                    <Text style={styles.changePhoneLink}>Change Number</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ) : (
          /* Password Flow */
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Email or Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="name@business.com or 9876543210"
              autoCapitalize="none"
              value={loginInput}
              onChangeText={setLoginInput}
            />

            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 20 }]}
              onPress={handlePasswordLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Social Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google 1-Click Button */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Terms notice */}
        <Text style={styles.termsNotice}>
          By continuing, you agree to TredBook&apos;s Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 6,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E3A8A',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  countryCodeBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRightWidth: 0,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  textInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  otpInput: {
    height: 54,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 10,
    color: '#1E3A8A',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1E3A8A',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  changePhoneLink: {
    fontSize: 13,
    color: '#64748B',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CBD5E1',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  termsNotice: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 24,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '600',
  },
  debugBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  debugText: {
    color: '#92400E',
    fontSize: 13,
    fontWeight: '700',
  },
});
