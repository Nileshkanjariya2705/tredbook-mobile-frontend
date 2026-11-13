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
import { trustApi, CommercialDispute } from '../services/trust';

interface RaiseDisputeModalProps {
  visible: boolean;
  companyId: string;
  defaultInvoiceCode?: string;
  onClose: () => void;
  onSuccess: (newDispute: CommercialDispute) => void;
}

export const RaiseDisputeModal: React.FC<RaiseDisputeModalProps> = ({
  visible,
  companyId,
  defaultInvoiceCode = 'INV-2026-8812',
  onClose,
  onSuccess,
}) => {
  const [invoiceCode, setInvoiceCode] = useState(defaultInvoiceCode);
  const [reason, setReason] = useState('Defective / Mismatched Product');
  const [description, setDescription] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Defective / Mismatched Product',
    'Delayed Delivery',
    'Warranty / Service Issue',
    'Billing Discrepancy',
    'Refund Processing Delay',
  ];

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide specific details regarding this commercial dispute.');
      return;
    }

    setLoading(true);
    try {
      const res = await trustApi.createDispute({
        companyId,
        invoiceCode: invoiceCode.trim(),
        reason,
        description: description.trim(),
        claimAmount: claimAmount ? parseFloat(claimAmount) : undefined,
      });

      Alert.alert(
        'Dispute Registered ⚖️',
        'Your dispute has been logged with a 48-Hour Merchant Resolution SLA. The merchant has been notified.',
      );
      setDescription('');
      setClaimAmount('');
      onSuccess(res.dispute);
      onClose();
    } catch (e: any) {
      Alert.alert('Failed to File Dispute', e.message || 'Error creating dispute');
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
              <Text style={styles.headerTitle}>Commercial Dispute Resolution ⚖️</Text>
              <Text style={styles.headerSubtitle}>
                Formal dispute channel with 48-Hour Merchant SLA
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Protection Notice */}
            <View style={styles.noticeBox}>
              <Text style={styles.noticeText}>
                🛡️ <Text style={{ fontWeight: '700' }}>Fair Conduct Guarantee:</Text> Filing a legitimate dispute or warranty claim does not negatively affect your Customer ReliabilityScore (CRS).
              </Text>
            </View>

            {/* Invoice Code */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Associated Purchase Invoice</Text>
              <TextInput
                style={styles.input}
                value={invoiceCode}
                onChangeText={setInvoiceCode}
                placeholder="e.g. INV-2026-8812"
                placeholderTextColor={Palette.textMuted}
              />
            </View>

            {/* Reason Chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Dispute Reason</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reasonScroll}>
                {reasons.map((r) => {
                  const isSelected = reason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[styles.reasonChip, isSelected && styles.reasonChipSelected]}
                      onPress={() => setReason(r)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                        {r}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Claim Amount */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Claim / Refund Amount (₹, Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter disputed amount if applicable"
                placeholderTextColor={Palette.textMuted}
                value={claimAmount}
                onChangeText={setClaimAmount}
                keyboardType="decimal-pad"
              />
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description of Issue</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Provide clear details on what occurred and your expected resolution..."
                placeholderTextColor={Palette.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
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
                <Text style={styles.submitBtnText}>Submit Formal Dispute</Text>
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
  noticeBox: {
    backgroundColor: Palette.mintLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.mint,
  },
  noticeText: {
    fontSize: 11,
    color: Palette.mintDark,
    lineHeight: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginBottom: 8,
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
  reasonScroll: {
    flexDirection: 'row',
  },
  reasonChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
  },
  reasonChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  reasonText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  reasonTextSelected: {
    color: '#92400E',
    fontWeight: '700',
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
