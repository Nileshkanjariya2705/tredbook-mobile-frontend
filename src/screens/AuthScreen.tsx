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
  StatusBar as StatusBarNative,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { Palette, SoftShadow } from '../theme/colors';

export const AuthScreen: React.FC = () => {
  const {
    sendOtp,
    verifyOtp,
    loginPassword,
    register,
    isBiometricSupported,
    authenticateBiometric,
  } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'otp' | 'password' | 'register'>('otp');
  const [isForgotModalVisible, setIsForgotModalVisible] = useState(false);

  // OTP State
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Password Login State
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid 10-digit mobile number.',
      });
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
      if (res?.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'A 6-digit verification code has been dispatched.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setErrorMsg(msg);
      Toast.show({
        type: 'error',
        text1: 'OTP Delivery Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter the complete 6-digit OTP.',
      });
      setErrorMsg('Please enter the complete 6-digit OTP.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '').slice(-10)}`;
      await verifyOtp(formattedPhone, otpCode, 'phone', 'signup');
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: 'Welcome to TredBook Super-App.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setErrorMsg(msg);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!loginInput || !password) {
      Toast.show({
        type: 'error',
        text1: 'Missing Credentials',
        text2: 'Please provide your email/phone and password.',
      });
      setErrorMsg('Please provide your email/phone and password.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await loginPassword(loginInput, password);
      Toast.show({
        type: 'success',
        text1: 'Welcome Back',
        text2: 'Signed in successfully.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid login credentials.';
      setErrorMsg(msg);
      Toast.show({
        type: 'error',
        text1: 'Sign In Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!regName || regName.length < 3) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Name must be at least 3 characters.' });
      setErrorMsg('Name must be at least 3 characters.');
      return;
    }
    if (!regEmail || !regEmail.includes('@')) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please enter a valid email address.' });
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Password must be at least 6 characters.' });
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!termsAccepted) {
      Toast.show({ type: 'error', text1: 'Terms Required', text2: 'Please accept Terms & Privacy Policy.' });
      setErrorMsg('Please accept the Terms & Conditions and Privacy Policy.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone ? (regPhone.startsWith('+') ? regPhone : `+91${regPhone.slice(-10)}`) : undefined,
        terms: true,
      });
      Toast.show({
        type: 'success',
        text1: 'Account Created',
        text2: 'Your Customer ID has been generated.',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    setIsSubmitting(true);
    try {
      const res = await authenticateBiometric();
      if (res.success) {
        Toast.show({
          type: 'success',
          text1: 'Biometrics Verified',
          text2: 'Signed in successfully.',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Biometric Login',
          text2: res.message || 'Verification cancelled or failed.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Biometric Error',
        text2: err?.message || 'Biometric authentication encountered an error.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    Toast.show({
      type: 'info',
      text1: 'Google Sign-In',
      text2: 'Use Mobile OTP, Registration, or Password for local dev testing.',
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop:
              Math.max(
                insets.top,
                Platform.OS === 'android' ? StatusBarNative.currentHeight || 0 : 0,
              ) + 20,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Text style={styles.brandLogo}>TredBook</Text>
          <Text style={styles.brandTagline}>MSME Commerce, Communication & Accounting</Text>
        </View>

        {/* 3-Way Tab Switcher */}
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
              Sign In
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'register' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
              Register
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

        {/* TAB 1: Quick OTP Flow */}
        {activeTab === 'otp' && (
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

                {isBiometricSupported && (
                  <TouchableOpacity
                    style={styles.biometricButton}
                    onPress={handleBiometricAuth}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.biometricButtonText}>🔐 Sign In with Fingerprint / FaceID</Text>
                  </TouchableOpacity>
                )}
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
        )}

        {/* TAB 2: Sign In with Password & Biometrics */}
        {activeTab === 'password' && (
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
              style={styles.forgotBtn}
              onPress={() => setIsForgotModalVisible(true)}
            >
              <Text style={styles.forgotBtnText}>Forgot Password?</Text>
            </TouchableOpacity>

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

            {/* Biometric FaceID / Fingerprint Button */}
            {isBiometricSupported && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricAuth}
                disabled={isSubmitting}
              >
                <Text style={styles.biometricButtonText}>🔐 Sign In with Fingerprint / FaceID</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* TAB 3: Full Registration Flow (Same as Accounting Software) */}
        {activeTab === 'register' && (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nilesh Kanjariya"
              value={regName}
              onChangeText={setRegName}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="nilesh@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={regEmail}
              onChangeText={setRegEmail}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Mobile Number (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="10-digit phone number"
              keyboardType="phone-pad"
              maxLength={10}
              value={regPhone}
              onChangeText={setRegPhone}
            />

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>Create Password (Min 6 chars)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="••••••••"
              secureTextEntry
              value={regPassword}
              onChangeText={setRegPassword}
            />

            {/* Terms & Conditions Checkbox */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setTermsAccepted(!termsAccepted)}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
                {termsAccepted && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I accept the Terms & Conditions and Privacy Policy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, { marginTop: 18 }]}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
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
          Unified TredBook Account: One login for Shopper, Merchant & Accounting.
        </Text>
      </ScrollView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={isForgotModalVisible}
        onClose={() => setIsForgotModalVisible(false)}
        onSuccess={(dest) => {
          setIsForgotModalVisible(false);
          setActiveTab('password');
          if (dest) {
            setLoginInput(dest);
          }
          setPassword('');
          Toast.show({
            type: 'info',
            text1: 'Sign In Required',
            text2: 'Please enter your newly set password to sign in.',
          });
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 50,
    justifyContent: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  brandLogo: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.8,
  },
  brandTagline: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EAEBEF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: Palette.surface,
    ...SoftShadow.card,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  tabTextActive: {
    color: Palette.textPrimary,
    fontWeight: '800',
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  countryCodeBadge: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRightWidth: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Palette.textPrimary,
  },
  textInput: {
    height: 48,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  otpInput: {
    height: 54,
    backgroundColor: Palette.lilacLight,
    borderWidth: 1.5,
    borderColor: Palette.lilac,
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 8,
    color: Palette.textPrimary,
    marginBottom: 18,
  },
  primaryButton: {
    backgroundColor: Palette.primary,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: Palette.primaryText,
    fontSize: 14,
    fontWeight: '700',
  },
  biometricButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: Palette.mint,
    backgroundColor: Palette.mintLight,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  biometricButtonText: {
    color: Palette.mintDark,
    fontSize: 13,
    fontWeight: '700',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
  },
  forgotBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: Palette.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  checkboxTick: {
    color: Palette.primaryText,
    fontSize: 12,
    fontWeight: '900',
  },
  checkboxLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    flex: 1,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  changePhoneLink: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Palette.border,
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  googleButton: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  termsNotice: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 20,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  debugBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  debugText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
});
