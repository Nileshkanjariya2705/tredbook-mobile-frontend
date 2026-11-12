import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Search,
  Star,
  ShieldCheck,
  Clock,
  Phone,
  Plus,
  ShoppingCart,
  CheckCircle2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Palette, SoftShadow } from '../theme/colors';
import {
  marketplaceApi,
  StorefrontShop,
  ProductItem,
  CartItem,
  CreateOrderPayload,
} from '../services/marketplace';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CartModal } from '../components/CartModal';
import { OrderSuccessModal } from '../components/OrderSuccessModal';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

interface StorefrontScreenProps {
  shop: StorefrontShop;
  onBack: () => void;
  onNavigateToChat?: (threadId: string) => void;
}

export const StorefrontScreen: React.FC<StorefrontScreenProps> = ({
  shop,
  onBack,
  onNavigateToChat,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [isInquiring, setIsInquiring] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [shop.id]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const items = await marketplaceApi.getShopProducts(shop.id);
      setProducts(items);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Could Not Load Products',
        text2: 'Please check connection and retry.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: ProductItem, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }
      return [...prev, { product, quantity: qty }];
    });

    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name} (${qty}x)`,
      visibilityTime: 1800,
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleInquireProduct = async (product: ProductItem) => {
    setIsInquiring(true);
    try {
      const res = await marketplaceApi.inquireProduct({
        productId: product.id,
        shopId: shop.id,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image,
      });

      setSelectedProduct(null);
      Toast.show({
        type: 'success',
        text1: 'Inquiry Sent to Merchant',
        text2: 'Opening chat thread...',
      });

      if (onNavigateToChat && res?.threadId) {
        onNavigateToChat(res.threadId);
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Inquiry Failed',
        text2: err.message || 'Could not send inquiry.',
      });
    } finally {
      setIsInquiring(false);
    }
  };

  const handleCheckout = async (payload: CreateOrderPayload) => {
    setIsCheckingOut(true);
    try {
      const res = await marketplaceApi.createOrder(payload);
      setLatestOrder(res?.order || { orderCode: 'TB-ORD-88214', grandTotal: payload.items.reduce((s, i) => s + i.price * i.quantity, 0) });
      setCart([]);
      setIsCartVisible(false);
      setIsSuccessModalVisible(true);
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Checkout Failed',
        text2: err.message || 'Could not place order.',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Top Floating Back Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <ArrowLeft size={20} color={Palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {shop.name}
        </Text>
        <TouchableOpacity
          style={styles.cartIconBtn}
          onPress={() => setIsCartVisible(true)}
        >
          <ShoppingCart size={20} color={Palette.textPrimary} />
          {cartItemCount > 0 && (
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner & Logo Header */}
        <View style={styles.bannerWrapper}>
          <Image source={{ uri: shop.banner }} style={styles.bannerImage} resizeMode="cover" />
          <View style={styles.logoWrapper}>
            <Image source={{ uri: shop.logo }} style={styles.shopLogo} />
          </View>
        </View>

        {/* Storefront Info */}
        <View style={styles.storeInfoCard}>
          <View style={styles.storeTitleRow}>
            <Text style={styles.storeName}>{shop.name}</Text>
            {shop.isVerified && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={14} color="#FFFFFF" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          <Text style={styles.storeAddress}>
            {shop.address}, {shop.city} • {shop.distanceKm} km away
          </Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Star size={15} color="#EAB308" fill="#EAB308" />
              <Text style={styles.statBold}>{shop.rating}</Text>
              <Text style={styles.statSub}>({shop.reviewsCount})</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <ShieldCheck size={16} color={Palette.mintDark} />
              <Text style={styles.statBold}>BTS {shop.trustScore}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Clock size={15} color={Palette.textSecondary} />
              <Text style={styles.statSub}>{shop.timings}</Text>
            </View>
          </View>
        </View>

        {/* Product Catalog Search Bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search size={18} color={Palette.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${shop.name}...`}
              placeholderTextColor={Palette.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Products Grid */}
        <View style={styles.catalogSection}>
          <Text style={styles.sectionTitle}>
            Published Catalog ({filteredProducts.length})
          </Text>

          {isLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <Text style={styles.loaderText}>Loading items...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No matching products</Text>
              <Text style={styles.emptySub}>Try searching for a different item name.</Text>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => {
                const discount =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )
                    : null;

                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    activeOpacity={0.88}
                    onPress={() => setSelectedProduct(product)}
                  >
                    <View style={styles.productImageWrapper}>
                      <Image source={{ uri: product.image }} style={styles.productImg} />
                      {discount && (
                        <View style={styles.productDiscountBadge}>
                          <Text style={styles.productDiscountText}>{discount}%</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.productCardBody}>
                      <Text style={styles.productCardTitle} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>
                          ₹{product.price.toLocaleString('en-IN')}
                        </Text>
                        <TouchableOpacity
                          style={styles.addIconBtn}
                          onPress={() => handleAddToCart(product, 1)}
                        >
                          <Plus size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      {cartItemCount > 0 && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartBar}
            onPress={() => setIsCartVisible(true)}
            activeOpacity={0.9}
          >
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartBadge}>
                <Text style={styles.floatingCartBadgeText}>{cartItemCount}</Text>
              </View>
              <Text style={styles.floatingCartLabel}>Items in Cart</Text>
            </View>
            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartAction}>View Cart →</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        visible={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onInquire={handleInquireProduct}
        isInquiring={isInquiring}
      />

      {/* Cart Modal */}
      <CartModal
        visible={isCartVisible}
        onClose={() => setIsCartVisible(false)}
        shopName={shop.name}
        shopId={shop.id}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
        isSubmitting={isCheckingOut}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        visible={isSuccessModalVisible}
        orderCode={latestOrder?.orderCode}
        shopName={shop.name}
        totalAmount={latestOrder?.grandTotal || latestOrder?.totalAmount}
        onClose={() => setIsSuccessModalVisible(false)}
        onOpenChat={() => {
          setIsSuccessModalVisible(false);
          if (onNavigateToChat) {
            onNavigateToChat(`shop-thread-${shop.id}`);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderColor: Palette.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
    flex: 1,
    marginHorizontal: 12,
  },
  cartIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Palette.primaryText,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bannerWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: Palette.border,
    position: 'relative',
    marginBottom: 40,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  logoWrapper: {
    position: 'absolute',
    bottom: -32,
    left: 20,
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    borderWidth: 3,
    borderColor: Palette.surface,
    overflow: 'hidden',
    ...SoftShadow,
  },
  shopLogo: {
    width: '100%',
    height: '100%',
  },
  storeInfoCard: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  storeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '900',
    color: Palette.textPrimary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.mintDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  storeAddress: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginBottom: 14,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statBold: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  statSub: {
    fontSize: 11,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: Palette.border,
    marginHorizontal: 12,
  },
  searchRow: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    ...SoftShadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  catalogSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 14,
  },
  loaderBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: Palette.textSecondary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: COLUMN_WIDTH,
    backgroundColor: Palette.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 16,
    ...SoftShadow,
  },
  productImageWrapper: {
    width: '100%',
    height: 140,
    backgroundColor: Palette.background,
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  productDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Palette.mintDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  productDiscountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  productCardBody: {
    padding: 10,
  },
  productCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: Palette.textPrimary,
  },
  addIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.primaryText,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  floatingCartBar: {
    backgroundColor: Palette.primaryText,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    ...SoftShadow,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floatingCartBadge: {
    backgroundColor: Palette.mintDark,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  floatingCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  floatingCartLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCartAction: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
