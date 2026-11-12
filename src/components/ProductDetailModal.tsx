import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, MessageSquare, ShoppingCart, Plus, Minus, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { Palette, SoftShadow } from '../theme/colors';
import { ProductItem } from '../services/marketplace';

interface ProductDetailModalProps {
  product: ProductItem | null;
  visible: boolean;
  onClose: () => void;
  onAddToCart: (product: ProductItem, quantity: number) => void;
  onInquire: (product: ProductItem) => void;
  isInquiring?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  visible,
  onClose,
  onAddToCart,
  onInquire,
  isInquiring = false,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>{product.category}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={Palette.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Product Image */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="cover" />
              {discountPercent && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                </View>
              )}
            </View>

            {/* Title & Pricing */}
            <Text style={styles.productName}>{product.name}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</Text>
              )}
              <Text style={styles.unitText}>/ {product.unit}</Text>
            </View>

            {/* In-Stock & Trust Pill */}
            <View style={styles.trustRow}>
              <View style={styles.stockBadge}>
                <CheckCircle2 size={13} color={Palette.mintDark} />
                <Text style={styles.stockBadgeText}>In Stock ({product.stockCount || 10} left)</Text>
              </View>
              <View style={styles.gstBadge}>
                <ShieldCheck size={13} color={Palette.lilacDark} />
                <Text style={styles.gstBadgeText}>GST {product.gstRate || 5}% Included</Text>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            {/* Quantity Stepper */}
            <View style={styles.stepperContainer}>
              <Text style={styles.stepperLabel}>Quantity</Text>
              <View style={styles.stepperBox}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={16} color={quantity <= 1 ? Palette.textSecondary : Palette.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.stepperCount}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity(quantity + 1)}
                >
                  <Plus size={16} color={Palette.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.inquireBtn}
              onPress={() => onInquire(product)}
              disabled={isInquiring}
            >
              {isInquiring ? (
                <ActivityIndicator size="small" color={Palette.primaryText} />
              ) : (
                <>
                  <MessageSquare size={17} color={Palette.primaryText} />
                  <Text style={styles.inquireBtnText}>Inquire</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
            >
              <ShoppingCart size={17} color="#FFFFFF" />
              <Text style={styles.addToCartBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '90%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    ...SoftShadow,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  categoryPill: {
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 16,
  },
  imageWrapper: {
    width: '100%',
    height: 230,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: Palette.background,
    marginBottom: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Palette.mintDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  productName: {
    fontSize: 19,
    fontWeight: '800',
    color: Palette.textPrimary,
    lineHeight: 25,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textPrimary,
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 15,
    color: Palette.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  unitText: {
    fontSize: 13,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    flexWrap: 'wrap',
    gap: 8,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
    marginLeft: 5,
  },
  gstBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gstBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
    marginLeft: 5,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCount: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textPrimary,
    paddingHorizontal: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  inquireBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.lilacDark,
    backgroundColor: Palette.lilacLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  inquireBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.lilacDark,
  },
  addToCartBtn: {
    flex: 1.4,
    height: 50,
    borderRadius: 14,
    backgroundColor: Palette.primaryText,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...SoftShadow,
  },
  addToCartBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
