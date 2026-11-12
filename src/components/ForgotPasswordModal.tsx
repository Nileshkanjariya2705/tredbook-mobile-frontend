import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (destination?: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [destination, setDestination] = useState('');
  const [channel, setChannel] = useState<'email' | 'phone'>('email');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const resetForm = () => {
    setStep(1);
    setDestination('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setDebugOtp(null);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRequestOtp = async () => {
    const cleanDest = destination.trim();
    if (!cleanDest) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: channel === 'email' ? 'Please enter your registered email' : 'Please enter your 10-digit mobile number',
      });
      return;
    }

    if (channel === 'phone' && cleanDest.replace(/[^0-9]/g, '').length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid 10-digit mobile number.',
      });
      return;
    }

    const targetDestination = channel === 'phone'
      ? cleanDest.replace(/[^0-9]/g, '').slice(-10)
      : cleanDest.toLowerCase();

    setLoading(true);
    try {
      const res = await forgotPassword(targetDestination, channel);
      if (res?.debugOtp) {
        setDebugOtp(res.debugOtp);
      }
      Toast.show({
        type: 'success',
        text1: 'Verification Code Sent',
        text2: `A 6-digit code has been dispatched.`,
      });
      setStep(2);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: err.response?.data?.message || 'Could not find an account with these details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeStep = () => {
    if (!code || code.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Please enter the 6-digit verification code.',
      });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Weak Password',
        text2: 'Password must be at least 6 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Password Mismatch',
        text2: 'Passwords do not match. Please check and re-type.',
      });
      return;
    }

    const targetDestination = channel === 'phone'
      ? destination.trim().replace(/[^0-9]/g, '').slice(-10)
      : destination.trim().toLowerCase();

    setLoading(true);
    try {
      await resetPassword(targetDestination, code.trim(), channel, newPassword);
      Toast.show({
        type: 'success',
        text1: 'Password Updated',
        text2: 'Please sign in with your new password.',
      });
      handleClose();
      onSuccess(targetDestination);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: err.response?.data?.message || 'Invalid code or expired session. Please retry.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.stepIndicator}>Step {step} of 3</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Step 1: Identifier Entry */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <Text style={styles.instruction}>
                  Enter the email or phone number associated with your TredBook account to receive a
                  one-time security code.
                </Text>

                <View style={styles.channelRow}>
                  <TouchableOpacity
                    style={[styles.channelBtn, channel === 'email' && styles.channelBtnActive]}
                    onPress={() => setChannel('email')}
                  >
                    <Text style={[styles.channelText, channel === 'email' && styles.channelTextActive]}>
                      ✉️ Email
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.channelBtn, channel === 'phone' && styles.channelBtnActive]}
                    onPress={() => setChannel('phone')}
                  >
                    <Text style={[styles.channelText, channel === 'phone' && styles.channelTextActive]}>
                      📱 Mobile
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>{channel === 'email' ? 'Email Address' : 'Phone Number'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={channel === 'email' ? 'e.g. name@example.com' : 'e.g. 9876543210'}
                  placeholderTextColor="#94A3B8"
                  keyboardType={channel === 'email' ? 'email-address' : 'phone-pad'}
                  autoCapitalize="none"
                  value={destination}
                  onChangeText={setDestination}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleRequestOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Send Verification Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <Text style={styles.instruction}>
                  We sent a 6-digit security code to <Text style={styles.bold}>{destination}</Text>.
                  Enter the code below.
                </Text>

                {debugOtp && (
                  <View style={styles.debugBox}>
                    <Text style={styles.debugTitle}>Development Code</Text>
                    <Text style={styles.debugCode}>{debugOtp}</Text>
                  </View>
                )}

                <Text style={styles.label}>6-Digit Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="000000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={code}
                  onChangeText={setCode}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleVerifyCodeStep}
                >
                  <Text style={styles.submitBtnText}>Verify Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.linkBtnText}>Change Email / Phone</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <Text style={styles.instruction}>
                  Create a new secure password for your account. Must be at least 6 characters.
                </Text>

                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter new password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitBtnText}>Update Password & Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  stepContainer: {
    paddingVertical: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 18,
  },
  bold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  channelRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  channelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  channelBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  channelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  channelTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    marginBottom: 18,
  },
  otpInput: {
    letterSpacing: 10,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  debugBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  debugTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  debugCode: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 4,
    color: '#78350F',
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  linkBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  linkBtnText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },
});
