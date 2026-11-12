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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
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
    fontWeight: '700',
    color: '#1E3A8A',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPaid: {
    backgroundColor: '#DCFCE7',
  },
  statusUnpaid: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusTextPaid: {
    color: '#15803D',
  },
  statusTextUnpaid: {
    color: '#B91C1C',
  },
  docNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  amountLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  dueDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  payButton: {
    flex: 1,
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  viewButtonText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
});
