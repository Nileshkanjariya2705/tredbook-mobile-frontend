import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle2, MessageSquare, ShoppingBag } from 'lucide-react-native';
import { Palette, SoftShadow } from '../theme/colors';

interface OrderSuccessModalProps {
  visible: boolean;
  orderCode?: string;
  shopName?: string;
  totalAmount?: number;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  visible,
  orderCode = 'TB-ORD-88214',
  shopName = 'Shree Ambika Jewellers',
  totalAmount = 0,
  onClose,
  onOpenChat,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Success Icon */}
          <View style={styles.iconCircle}>
            <CheckCircle2 size={42} color={Palette.mintDark} />
          </View>

          <Text style={styles.title}>Order Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your order has been placed directly with {shopName}.
          </Text>

          {/* Details Card */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Reference</Text>
              <Text style={styles.detailValueBold}>{orderCode}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Merchant</Text>
              <Text style={styles.detailValue}>{shopName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount Payable</Text>
              <Text style={styles.detailPrice}>₹{totalAmount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Estimated Dispatch</Text>
              <Text style={[styles.detailValue, { color: Palette.mintDark }]}>Within 2 Hours</Text>
            </View>
          </View>

          {/* Actions */}
          {onOpenChat && (
            <TouchableOpacity style={styles.chatBtn} onPress={onOpenChat}>
              <MessageSquare size={16} color={Palette.primaryText} />
              <Text style={styles.chatBtnText}>Chat with Merchant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.doneBtn} onPress={onClose}>
            <ShoppingBag size={16} color="#FFFFFF" />
            <Text style={styles.doneBtnText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    ...SoftShadow,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Palette.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailsBox: {
    width: '100%',
    backgroundColor: Palette.background,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  detailValueBold: {
    fontSize: 13,
    fontWeight: '900',
    color: Palette.primaryText,
  },
  detailPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: Palette.textPrimary,
  },
  chatBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.mintDark,
    backgroundColor: Palette.mintLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  chatBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.mintDark,
  },
  doneBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: Palette.primaryText,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SoftShadow,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
