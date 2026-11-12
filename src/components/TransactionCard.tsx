import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Receipt, FileText, ShieldCheck, Zap, ExternalLink, Check } from 'lucide-react-native';
import { Palette, SoftShadow } from '../theme/colors';

export interface TransactionCardProps {
  type: string;
  metadata?: Record<string, any>;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({ type, metadata }) => {
  if (!metadata) return null;

  const handlePayUpi = () => {
    if (metadata.upiPayUrl) {
      Linking.canOpenURL(metadata.upiPayUrl).then((supported) => {
        if (supported) {
          Linking.openURL(metadata.upiPayUrl);
        } else {
          Alert.alert(
            'UPI Payment',
            `Pay ₹${metadata.balanceDue || metadata.grandTotal} to merchant VPA via your preferred UPI app (GPay / PhonePe / Paytm).`,
          );
        }
      });
    } else {
      Alert.alert(
        'UPI Payment',
        `Pay ₹${metadata.balanceDue || metadata.grandTotal} to merchant via UPI.`,
      );
    }
  };

  const handleViewDetails = () => {
    Alert.alert(
      'Document View',
      `Opening digital document: ${metadata.invoiceNumber || metadata.quotationNumber || metadata.orderNumber || 'Document'}`,
    );
  };

  if (type === 'invoice_card') {
    const isPaid = metadata.status?.toLowerCase() === 'paid';
    return (
      <View style={styles.cardContainer}>
        {/* Card Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <Receipt size={16} color="#0284C7" strokeWidth={2.2} />
            <Text style={styles.cardTypeTitle}>GST Tax Invoice</Text>
          </View>
          <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusUnpaid]}>
            <Text style={[styles.statusText, isPaid ? styles.statusTextPaid : styles.statusTextUnpaid]}>
              {metadata.status || 'UNPAID'}
            </Text>
          </View>
        </View>

        {/* Invoice Info */}
        <Text style={styles.docNumber}>{metadata.invoiceNumber || 'INV-2026-0001'}</Text>

        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>₹{metadata.balanceDue || metadata.grandTotal || '0.00'}</Text>
          {metadata.dueDate && (
            <Text style={styles.dueDateText}>Due Date: {metadata.dueDate}</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {!isPaid && (
            <TouchableOpacity style={styles.payButton} onPress={handlePayUpi}>
              <Zap size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
              <Text style={styles.payButtonText}>Pay via UPI</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.viewButton} onPress={handleViewDetails}>
            <ExternalLink size={13} color="#0284C7" style={{ marginRight: 4 }} />
            <Text style={styles.viewButtonText}>View Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (type === 'quotation_card') {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <FileText size={16} color="#B45309" strokeWidth={2.2} />
            <Text style={styles.cardTypeTitle}>Price Quotation</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusText, { color: '#92400E' }]}>VALID 7 DAYS</Text>
          </View>
        </View>
        <Text style={styles.docNumber}>{metadata.quotationNumber || 'QUOT-001'}</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Quotation Value</Text>
          <Text style={styles.amountValue}>₹{metadata.grandTotal || '0.00'}</Text>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: '#15803D' }]}
            onPress={() => Alert.alert('Quotation Accepted', 'Order has been placed with merchant.')}
          >
            <Check size={14} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={styles.payButtonText}>Accept Quotation</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (type === 'warranty_card') {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <ShieldCheck size={16} color="#15803D" strokeWidth={2.2} />
            <Text style={styles.cardTypeTitle}>Digital Warranty</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusText, { color: '#15803D' }]}>ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.docNumber}>{metadata.productName || 'Verified Product'}</Text>
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>Serial No: {metadata.serialNumber || 'TB-SER-9948'}</Text>
          <Text style={[styles.dueDateText, { marginTop: 4 }]}>
            Valid until: {metadata.expiryDate || 'Nov 2027'}
          </Text>
        </View>
        <TouchableOpacity style={styles.viewButton} onPress={handleViewDetails}>
          <Text style={styles.viewButtonText}>Download Certificate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
    minWidth: 240,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTypeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: Palette.mint,
  },
  statusUnpaid: {
    backgroundColor: Palette.dangerLight,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPaid: {
    color: Palette.mintDark,
  },
  statusTextUnpaid: {
    color: Palette.danger,
  },
  docNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 8,
  },
  amountBox: {
    backgroundColor: Palette.holoPink,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 11,
    color: Palette.holoPinkDark,
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginTop: 2,
    letterSpacing: -0.5,
  },
  dueDateText: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    flex: 1,
    backgroundColor: Palette.primary,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  payButtonText: {
    color: Palette.primaryText,
    fontSize: 12,
    fontWeight: '700',
  },
  viewButton: {
    flex: 1,
    backgroundColor: Palette.lilacLight,
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.lilac,
  },
  viewButtonText: {
    color: Palette.lilacDark,
    fontSize: 12,
    fontWeight: '700',
  },
});
