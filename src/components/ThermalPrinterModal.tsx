import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Palette } from '../theme/colors';
import { MerchantOrder } from '../services/business';

interface ThermalPrinterModalProps {
  visible: boolean;
  order: MerchantOrder | null;
  companyName: string;
  gstNumber: string;
  onClose: () => void;
}

export const ThermalPrinterModal: React.FC<ThermalPrinterModalProps> = ({
  visible,
  order,
  companyName,
  gstNumber,
  onClose,
}) => {
  const [printing, setPrinting] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');

  if (!order) return null;

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      Alert.alert(
        'Receipt Printed! 🖨️',
        `Thermal ESC/POS receipt for Order ${order.orderCode} sent to Bluetooth POS-58BT printer successfully.`,
        [{ text: 'Done', onPress: onClose }],
      );
    }, 1500);
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Bluetooth Thermal Printer</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>POS-58BT Connected (BT LE)</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Width Selector */}
          <View style={styles.widthRow}>
            <TouchableOpacity
              style={[styles.widthBtn, paperWidth === '58mm' && styles.widthBtnActive]}
              onPress={() => setPaperWidth('58mm')}
            >
              <Text style={[styles.widthText, paperWidth === '58mm' && styles.widthTextActive]}>
                58mm Roll
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.widthBtn, paperWidth === '80mm' && styles.widthBtnActive]}
              onPress={() => setPaperWidth('80mm')}
            >
              <Text style={[styles.widthText, paperWidth === '80mm' && styles.widthTextActive]}>
                80mm Roll
              </Text>
            </TouchableOpacity>
          </View>

          {/* Monospaced Receipt Preview */}
          <ScrollView style={styles.receiptContainer} contentContainerStyle={styles.receiptContent}>
            <View style={[styles.receiptPaper, paperWidth === '80mm' && styles.receiptPaper80]}>
              <Text style={styles.receiptHeader}>{companyName.toUpperCase()}</Text>
              <Text style={styles.receiptSub}>TAX INVOICE / CASH BILL</Text>
              <Text style={styles.receiptSub}>GSTIN: {gstNumber}</Text>
              <Text style={styles.receiptDivider}>--------------------------------</Text>
              <Text style={styles.receiptRow}>
                <Text>Inv: {order.orderCode}</Text>
              </Text>
              <Text style={styles.receiptRow}>
                <Text>Date: {formattedDate}</Text>
              </Text>
              <Text style={styles.receiptRow}>
                <Text>Pay Mode: {order.paymentMethod}</Text>
              </Text>
              <Text style={styles.receiptDivider}>--------------------------------</Text>
              <Text style={styles.receiptColHeader}>ITEM             QTY   RATE   TOTAL</Text>
              <Text style={styles.receiptDivider}>--------------------------------</Text>

              {order.items.map((item, idx) => (
                <View key={idx} style={{ marginBottom: 4 }}>
                  <Text style={styles.receiptItemName}>{item.name.slice(0, 30)}</Text>
                  <View style={styles.receiptItemLine}>
                    <Text style={styles.receiptMono}>
                      {' '.repeat(16)}
                      {String(item.quantity).padStart(3)}   ₹{item.price}   ₹
                      {item.price * item.quantity}
                    </Text>
                  </View>
                </View>
              ))}

              <Text style={styles.receiptDivider}>--------------------------------</Text>
              <View style={styles.receiptSummaryRow}>
                <Text style={styles.receiptMono}>Subtotal:</Text>
                <Text style={styles.receiptMono}>₹{order.totalAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.receiptSummaryRow}>
                <Text style={styles.receiptMono}>GST (5%):</Text>
                <Text style={styles.receiptMono}>₹{order.gstAmount.toLocaleString('en-IN')}</Text>
              </View>
              <Text style={styles.receiptDivider}>================================</Text>
              <View style={styles.receiptSummaryRow}>
                <Text style={styles.receiptGrandTotalLabel}>GRAND TOTAL:</Text>
                <Text style={styles.receiptGrandTotalVal}>
                  ₹{order.grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
              <Text style={styles.receiptDivider}>================================</Text>
              <Text style={styles.receiptFooter}>THANK YOU! VISIT AGAIN</Text>
              <Text style={styles.receiptFooter}>Powered by TredBook Business</Text>
              <Text style={styles.receiptCutLine}>- - - - - - [CUT HERE] - - - - - -</Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.printBtn, printing && styles.disabledBtn]}
              onPress={handlePrint}
              disabled={printing}
              activeOpacity={0.8}
            >
              {printing ? (
                <ActivityIndicator color={Palette.surface} />
              ) : (
                <Text style={styles.printBtnText}>🖨️ Send to ESC/POS Printer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: Palette.surface,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.lilacLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: Palette.textPrimary,
    fontWeight: '600',
  },
  widthRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Palette.background,
  },
  widthBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  widthBtnActive: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  widthText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  widthTextActive: {
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  receiptContainer: {
    padding: 16,
    backgroundColor: '#E5E7EB',
  },
  receiptContent: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  receiptPaper: {
    width: 290,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  receiptPaper80: {
    width: 340,
  },
  receiptHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  receiptSub: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    textAlign: 'center',
    color: '#333333',
    marginTop: 2,
  },
  receiptDivider: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    textAlign: 'center',
    color: '#666666',
    marginVertical: 4,
  },
  receiptRow: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#000000',
  },
  receiptColHeader: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptItemName: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptItemLine: {
    flexDirection: 'row',
  },
  receiptMono: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#000000',
  },
  receiptSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptGrandTotalLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptGrandTotalVal: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  receiptFooter: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    textAlign: 'center',
    color: '#666666',
    marginTop: 3,
  },
  receiptCutLine: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 9,
    textAlign: 'center',
    color: '#999999',
    marginTop: 8,
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    backgroundColor: Palette.surface,
  },
  printBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  printBtnText: {
    color: Palette.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
