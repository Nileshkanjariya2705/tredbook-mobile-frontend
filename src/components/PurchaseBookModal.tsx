import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import { PurchaseBookRecord } from '../services/home';

interface PurchaseBookModalProps {
  visible: boolean;
  records: PurchaseBookRecord[];
  onClose: () => void;
}

export const PurchaseBookModal: React.FC<PurchaseBookModalProps> = ({
  visible,
  records,
  onClose,
}) => {
  const handleDownloadInvoice = (invoiceNo: string) => {
    Alert.alert(
      'Tax Invoice Vault 📄',
      `Verified digital GST tax invoice for ${invoiceNo} exported to your device storage.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Digital Purchase Book 📖</Text>
              <Text style={styles.headerSubtitle}>
                Verified GST Invoices & Warranty Passport Vault
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Records List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {records.map((record) => {
              const formattedDate = new Date(record.purchaseDate).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              });

              const isLifetime = record.warrantyStatus === 'LIFETIME';
              const isActive = record.warrantyStatus === 'ACTIVE';

              return (
                <View key={record.id} style={styles.card}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.merchantName}>{record.merchantName}</Text>
                      <Text style={styles.invoiceNo}>
                        Inv: {record.invoiceNumber} • {formattedDate}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.warrantyBadge,
                        isLifetime && { backgroundColor: Palette.mintLight },
                        isActive && { backgroundColor: Palette.lilacLight },
                        !isLifetime && !isActive && { backgroundColor: '#F3F4F6' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.warrantyText,
                          isLifetime && { color: Palette.mintDark },
                          isActive && { color: Palette.lilacDark },
                          !isLifetime && !isActive && { color: Palette.textSecondary },
                        ]}
                      >
                        {isLifetime
                          ? '🛡️ Lifetime Warranty'
                          : isActive
                          ? `🛡️ Warranty till ${record.warrantyValidTill}`
                          : 'Warranty Expired'}
                      </Text>
                    </View>
                  </View>

                  {/* Merchant Address & GST */}
                  <View style={styles.addressBox}>
                    <Text style={styles.addressText}>📍 {record.merchantAddress}</Text>
                    <Text style={styles.gstText}>GSTIN: {record.merchantGstin}</Text>
                  </View>

                  {/* Items List */}
                  <View style={styles.itemsBox}>
                    {record.items.map((item, idx) => (
                      <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                          {item.quantity}x {item.name}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Pricing Breakdown */}
                  <View style={styles.priceSummary}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>
                        ₹{record.totalAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>GST Tax</Text>
                      <Text style={styles.summaryValue}>
                        ₹{record.gstAmount.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total Paid:</Text>
                      <Text style={styles.totalValue}>
                        ₹{record.grandTotal.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleDownloadInvoice(record.invoiceNumber)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.actionBtnText}>📄 Download Tax Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
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
    padding: 16,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  invoiceNo: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  warrantyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  warrantyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addressBox: {
    backgroundColor: Palette.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 11,
    color: Palette.textSecondary,
  },
  gstText: {
    fontSize: 10,
    color: Palette.textMuted,
    marginTop: 2,
  },
  itemsBox: {
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  itemName: {
    fontSize: 12,
    color: Palette.textPrimary,
    flex: 1,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  priceSummary: {
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    paddingTop: 8,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: Palette.textSecondary,
  },
  summaryValue: {
    fontSize: 11,
    color: Palette.textPrimary,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  actionsRow: {
    marginTop: 10,
  },
  actionBtn: {
    backgroundColor: Palette.lilacLight,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.lilac,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
});
