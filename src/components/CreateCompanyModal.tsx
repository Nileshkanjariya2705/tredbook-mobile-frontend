import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import { businessApi, BusinessCompany } from '../services/business';

interface CreateCompanyModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (newCompany: BusinessCompany) => void;
}

export const CreateCompanyModal: React.FC<CreateCompanyModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGstChange = (text: string) => {
    const formatted = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    setGstNumber(formatted);
    // Auto-extract PAN from 15-character GSTIN (Characters 3 to 12)
    if (formatted.length >= 12 && !panNumber) {
      setPanNumber(formatted.slice(2, 12));
    }
  };

  const handlePanChange = (text: string) => {
    setPanNumber(text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
  };

  const handleSubmit = async () => {
    if (!businessName.trim()) {
      Alert.alert('Required Field', 'Please enter your Business or Firm Name.');
      return;
    }

    setLoading(true);
    try {
      const res = await businessApi.createCompany({
        businessName: businessName.trim(),
        gstNumber: gstNumber.trim() || undefined,
        panNumber: panNumber.trim() || undefined,
        businessAddress: businessAddress.trim() || undefined,
        pincode: pincode.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });

      Alert.alert('Success', 'Business registered successfully!');
      // Reset form
      setBusinessName('');
      setGstNumber('');
      setPanNumber('');
      setBusinessAddress('');
      setPincode('');
      setPhone('');
      setEmail('');
      onSuccess(res.company);
      onClose();
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.response?.data?.message || e.message || 'Error creating company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Register New Business</Text>
              <Text style={styles.headerSubtitle}>
                Add MSME firm to your merchant workspace
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Business Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Business / Enterprise Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Royal Diamond Jewellers"
                placeholderTextColor={Palette.textMuted}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            {/* GSTIN & PAN row */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>GSTIN (15 Digits)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="24AAACS1234A1Z5"
                  placeholderTextColor={Palette.textMuted}
                  value={gstNumber}
                  onChangeText={handleGstChange}
                  autoCapitalize="characters"
                  maxLength={15}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>PAN Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="AAACS1234A"
                  placeholderTextColor={Palette.textMuted}
                  value={panNumber}
                  onChangeText={handlePanChange}
                  autoCapitalize="characters"
                  maxLength={10}
                />
              </View>
            </View>

            {/* Phone & Pincode */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1.2, marginRight: 8 }]}>
                <Text style={styles.label}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={Palette.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 0.8, marginLeft: 8 }]}>
                <Text style={styles.label}>PIN Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="380009"
                  placeholderTextColor={Palette.textMuted}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            {/* Business Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Business / Store Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Shop/Office number, Complex, Landmark, City"
                placeholderTextColor={Palette.textMuted}
                value={businessAddress}
                onChangeText={setBusinessAddress}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Email Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Billing Email</Text>
              <TextInput
                style={styles.input}
                placeholder="billing@yourfirm.in"
                placeholderTextColor={Palette.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Palette.surface} />
              ) : (
                <Text style={styles.submitBtnText}>Create Business Profile</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.lilacLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: '#E53E3E',
  },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
