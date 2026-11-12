import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  Trash2,
  Plus,
  Minus,
  Store,
  MapPin,
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
} from 'lucide-react-native';
import { Palette, SoftShadow } from '../theme/colors';
import { CartItem, CreateOrderPayload } from '../services/marketplace';

interface CartModalProps {
  visible: boolean;
  onClose: () => void;
  shopName: string;
  shopId: string;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (payload: CreateOrderPayload) => Promise<void>;
  isSubmitting?: boolean;
}

export const CartModal: React.FC<CartModalProps> = ({
  visible,
  onClose,
  shopName,
  shopId,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isSubmitting = false,
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState('Shop 14, Ratanpole Bazaar, Ahmedabad, Gujarat - 380001');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'PAY_AT_STORE' | 'UPI'>('UPI');
  const [orderNotes, setOrderNotes] = useState('');

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const gstAmount = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gstAmount;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    await onCheckout({
      shopId,
      shopName,
      items: cartItems.map((ci) => ({
        productId: ci.product.id,
        name: ci.product.name,
        price: ci.product.price,
        quantity: ci.quantity,
        image: ci.product.image,
        unit: ci.product.unit,
      })),
      paymentMethod,
      deliveryAddress,
      notes: orderNotes,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Store size={18} color={Palette.primaryText} />
              <Text style={styles.headerTitle} numberOfLines={1}>
                {shopName || 'Your Cart'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={18} color={Palette.textPrimary} />
            </TouchableOpacity>
          </View>

          {cartItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
              <Text style={styles.emptyDesc}>
                Browse verified products from local shops and add them to your cart.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Single Merchant Notice */}
              <View style={styles.singleMerchantPill}>
                <CheckCircle2 size={13} color={Palette.mintDark} />
                <Text style={styles.singleMerchantText}>
                  Direct Dispatch from {shopName}
                </Text>
              </View>

              {/* Items List */}
              <Text style={styles.sectionTitle}>Order Items ({cartItems.length})</Text>
              {cartItems.map((item) => (
                <View key={item.product.id} style={styles.itemRow}>
                  <Image source={{ uri: item.product.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.itemPrice}>
                      ₹{item.product.price.toLocaleString('en-IN')}{' '}
                      <Text style={styles.itemUnit}>/ {item.product.unit}</Text>
                    </Text>
                  </View>

                  {/* Quantity Stepper */}
                  <View style={styles.stepperBox}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => {
                        if (item.quantity <= 1) {
                          onRemoveItem(item.product.id);
                        } else {
                          onUpdateQuantity(item.product.id, item.quantity - 1);
                        }
                      }}
                    >
                      {item.quantity <= 1 ? (
                        <Trash2 size={13} color="#EF4444" />
                      ) : (
                        <Minus size={13} color={Palette.textPrimary} />
                      )}
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus size={13} color={Palette.textPrimary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Delivery Address */}
              <Text style={styles.sectionTitle}>Delivery Destination</Text>
              <View style={styles.addressBox}>
                <MapPin size={16} color={Palette.textSecondary} style={{ marginTop: 2 }} />
                <TextInput
                  style={styles.addressInput}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                  placeholder="Enter full address with pincode"
                  placeholderTextColor={Palette.textSecondary}
                />
              </View>

              {/* Payment Method Selector */}
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentMethodsRow}>
                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'UPI' && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod('UPI')}
                >
                  <QrCode
                    size={18}
                    color={paymentMethod === 'UPI' ? Palette.primaryText : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentMethodLabel,
                      paymentMethod === 'UPI' && styles.paymentMethodLabelActive,
                    ]}
                  >
                    UPI Pay
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'COD' && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod('COD')}
                >
                  <Banknote
                    size={18}
                    color={paymentMethod === 'COD' ? Palette.primaryText : Palette.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentMethodLabel,
                      paymentMethod === 'COD' && styles.paymentMethodLabelActive,
                    ]}
                  >
                    Cash on Delivery
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.paymentMethodCard,
                    paymentMethod === 'PAY_AT_STORE' && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod('PAY_AT_STORE')}
                >
                  <CreditCard
                    size={18}
                    color={
                      paymentMethod === 'PAY_AT_STORE' ? Palette.primaryText : Palette.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.paymentMethodLabel,
                      paymentMethod === 'PAY_AT_STORE' && styles.paymentMethodLabelActive,
                    ]}
                  >
                    Pay at Store
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Bill Breakdown */}
              <View style={styles.billBox}>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Subtotal</Text>
                  <Text style={styles.billValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>GST (Standard 5%)</Text>
                  <Text style={styles.billValue}>₹{gstAmount.toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Platform & Storefront Fee</Text>
                  <Text style={[styles.billValue, { color: Palette.mintDark }]}>FREE</Text>
                </View>
                <View style={styles.billDivider} />
                <View style={styles.billRow}>
                  <Text style={styles.billTotalLabel}>Grand Total</Text>
                  <Text style={styles.billTotalValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </ScrollView>
          )}

          {/* Checkout Footer Button */}
          {cartItems.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <View>
                      <Text style={styles.checkoutBtnTotal}>₹{grandTotal.toLocaleString('en-IN')}</Text>
                      <Text style={styles.checkoutBtnSub}>
                        {paymentMethod === 'UPI'
                          ? 'Pay via UPI Intent'
                          : paymentMethod === 'COD'
                          ? 'Confirm Cash on Delivery'
                          : 'Pickup & Pay at Store'}
                      </Text>
                    </View>
                    <Text style={styles.checkoutBtnText}>Place Order →</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Palette.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    ...SoftShadow,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  singleMerchantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  singleMerchantText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.background,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: Palette.surface,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 3,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  itemUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
    paddingHorizontal: 8,
  },
  addressBox: {
    flexDirection: 'row',
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  addressInput: {
    flex: 1,
    fontSize: 13,
    color: Palette.textPrimary,
    lineHeight: 18,
  },
  paymentMethodsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentMethodCard: {
    flex: 1,
    backgroundColor: Palette.background,
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  paymentMethodActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.lilacLight,
  },
  paymentMethodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  paymentMethodLabelActive: {
    color: Palette.primaryText,
  },
  billBox: {
    backgroundColor: Palette.background,
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  billValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  billDivider: {
    height: 1,
    backgroundColor: Palette.border,
    marginVertical: 8,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  billTotalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: Palette.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingTop: 12,
  },
  checkoutBtn: {
    backgroundColor: Palette.primaryText,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    ...SoftShadow,
  },
  checkoutBtnTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  checkoutBtnSub: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  checkoutBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
