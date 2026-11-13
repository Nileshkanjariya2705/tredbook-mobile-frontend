import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import {
  homeApi,
  HomeDashboardData,
  PurchaseBookRecord,
  LoyaltyData,
} from '../services/home';
import { PurchaseBookModal } from '../components/PurchaseBookModal';
import { LoyaltyModal } from '../components/LoyaltyModal';
import { TrustProfileScreen } from './TrustProfileScreen';
import { Modal } from 'react-native';

interface HomeScreenProps {
  onNavigateTab: (tab: 'social' | 'marketplace' | 'business' | 'profile') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab }) => {
  const [dashboard, setDashboard] = useState<HomeDashboardData | null>(null);
  const [purchaseBook, setPurchaseBook] = useState<PurchaseBookRecord[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showPurchaseBookModal, setShowPurchaseBookModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showTrustModal, setShowTrustModal] = useState(false);

  const loadHomeData = async () => {
    try {
      const [dashData, pbData, loyaltyData] = await Promise.all([
        homeApi.getDashboard().catch(() => null),
        homeApi.getPurchaseBook().catch(() => []),
        homeApi.getLoyalty().catch(() => null),
      ]);

      if (dashData) setDashboard(dashData);
      setPurchaseBook(pbData);
      if (loyaltyData) setLoyalty(loyaltyData);
    } catch (e: any) {
      console.warn('Error loading home data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading TredBook Home...</Text>
      </View>
    );
  }

  const cust = dashboard?.customer || {
    name: 'Valued Customer',
    customerId: 'TB-C000001',
    reliabilityScore: 750,
    scoreTier: 'Strong Conduct',
  };

  const activeOrder = dashboard?.activeOrder;
  const isPlaced = activeOrder?.status === 'PLACED' || activeOrder?.status === 'CONFIRMED';
  const isPreparing = activeOrder?.status === 'PREPARING';
  const isDispatched = activeOrder?.status === 'DISPATCHED';
  const isDelivered = activeOrder?.status === 'DELIVERED';

  const categories = [
    { id: 'jewellery', name: 'Jewellery', icon: '💎', count: 4 },
    { id: 'electronics', name: 'Electronics', icon: '📱', count: 5 },
    { id: 'groceries', name: 'Groceries', icon: '🛒', count: 4 },
    { id: 'apparel', name: 'Apparel', icon: '👗', count: 3 },
    { id: 'hardware', name: 'Hardware', icon: '🔧', count: 2 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* 1. Customer Hero & Reliability Passport Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingText}>Namaste, {cust.name.split(' ')[0]} 👋</Text>
              <View style={styles.customerPill}>
                <Text style={styles.customerPillText}>Customer ID: {cust.customerId}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.crsBadge}
              onPress={() => setShowTrustModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.crsLabel}>ReliabilityScore</Text>
              <Text style={styles.crsScore}>CRS {cust.reliabilityScore}</Text>
              <Text style={styles.crsTier}>{cust.scoreTier} ➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Quick Action Hub */}
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowPurchaseBookModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Palette.lilacLight }]}>
              <Text style={styles.actionIconText}>📖</Text>
            </View>
            <Text style={styles.actionLabel}>Purchase Book</Text>
            <Text style={styles.actionSub}>{purchaseBook.length} Bills</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => setShowLoyaltyModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Palette.mintLight }]}>
              <Text style={styles.actionIconText}>🎁</Text>
            </View>
            <Text style={styles.actionLabel}>TredCoins</Text>
            <Text style={styles.actionSub}>{dashboard?.loyalty?.tredCoins || 540} Coins</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => onNavigateTab('marketplace')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: Palette.holoPink }]}>
              <Text style={styles.actionIconText}>🏪</Text>
            </View>
            <Text style={styles.actionLabel}>Nearby Shops</Text>
            <Text style={styles.actionSub}>Within 5 km</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => onNavigateTab('social')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.actionIconText}>💬</Text>
            </View>
            <Text style={styles.actionLabel}>Direct Chat</Text>
            <Text style={styles.actionSub}>Live Stores</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Live Active Order Tracking Card */}
        {activeOrder && (
          <View style={styles.orderCard}>
            <View style={styles.orderCardHeader}>
              <View>
                <Text style={styles.orderCardTitle}>Live Order Tracking 🚚</Text>
                <Text style={styles.orderCardSub}>
                  {activeOrder.orderCode} • {activeOrder.shopName}
                </Text>
              </View>
              <View style={styles.orderStatusPill}>
                <Text style={styles.orderStatusText}>{activeOrder.status}</Text>
              </View>
            </View>

            {/* Stepper Progress Bar */}
            <View style={styles.stepperContainer}>
              <View style={styles.stepperLine}>
                <View
                  style={[
                    styles.stepperProgress,
                    {
                      width: isDelivered
                        ? '100%'
                        : isDispatched
                        ? '75%'
                        : isPreparing
                        ? '50%'
                        : '25%',
                    },
                  ]}
                />
              </View>

              <View style={styles.stepsRow}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      (isPlaced || isPreparing || isDispatched || isDelivered) &&
                        styles.stepDotActive,
                    ]}
                  />
                  <Text style={styles.stepLabel}>Placed</Text>
                </View>

                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      (isPreparing || isDispatched || isDelivered) &&
                        styles.stepDotActive,
                    ]}
                  />
                  <Text style={styles.stepLabel}>Preparing</Text>
                </View>

                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepDot,
                      (isDispatched || isDelivered) && styles.stepDotActive,
                    ]}
                  />
                  <Text style={styles.stepLabel}>Dispatched</Text>
                </View>

                <View style={styles.stepItem}>
                  <View style={[styles.stepDot, isDelivered && styles.stepDotActive]} />
                  <Text style={styles.stepLabel}>Delivered</Text>
                </View>
              </View>
            </View>

            {/* Order Items & Amount */}
            <View style={styles.orderDetailsRow}>
              <Text style={styles.orderItemsText} numberOfLines={1}>
                {activeOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
              </Text>
              <Text style={styles.orderAmountText}>
                ₹{activeOrder.grandTotal.toLocaleString('en-IN')}
              </Text>
            </View>

            {/* Shortcut to Chat with Store */}
            <TouchableOpacity
              style={styles.chatStoreBtn}
              onPress={() => onNavigateTab('social')}
              activeOpacity={0.7}
            >
              <Text style={styles.chatStoreBtnText}>💬 Message Store Manager</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 4. Trending Categories */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Local Categories</Text>
            <TouchableOpacity onPress={() => onNavigateTab('marketplace')}>
              <Text style={styles.seeAllText}>View All ➔</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                onPress={() => onNavigateTab('marketplace')}
                activeOpacity={0.7}
              >
                <Text style={styles.catEmoji}>{cat.icon}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catCount}>{cat.count} Verified</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 5. Recommended Verified Nearby Shops */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Verified Merchants</Text>
            <TouchableOpacity onPress={() => onNavigateTab('marketplace')}>
              <Text style={styles.seeAllText}>Browse ➔</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.shopCard}
            onPress={() => onNavigateTab('marketplace')}
            activeOpacity={0.8}
          >
            <View style={styles.shopCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>Shree Ambica Jewels & Bullion</Text>
                <Text style={styles.shopCategory}>Jewellery & BIS Hallmarked Bullion</Text>
                <Text style={styles.shopAddress}>📍 CG Road, Navrangpura • 0.8 km</Text>
              </View>
              <View style={styles.shopTrustBadge}>
                <Text style={styles.shopTrustText}>BTS 885</Text>
              </View>
            </View>
            <View style={styles.shopFooter}>
              <Text style={styles.shopVerifiedPill}>✓ GST & BIS Hallmarked</Text>
              <Text style={styles.shopOpenText}>🟢 Open Now till 8:30 PM</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shopCard}
            onPress={() => onNavigateTab('marketplace')}
            activeOpacity={0.8}
          >
            <View style={styles.shopCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>TechWorld Electronics & Appliances</Text>
                <Text style={styles.shopCategory}>Smartphones, Audio & Laptops</Text>
                <Text style={styles.shopAddress}>📍 Titanium City Centre, Prahlad Nagar • 1.2 km</Text>
              </View>
              <View style={styles.shopTrustBadge}>
                <Text style={styles.shopTrustText}>BTS 890</Text>
              </View>
            </View>
            <View style={styles.shopFooter}>
              <Text style={styles.shopVerifiedPill}>✓ Authorised Brand Partner</Text>
              <Text style={styles.shopOpenText}>🟢 Open Now till 9:00 PM</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 6. Recent Digital Purchase Book Snippet */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Invoices & Warranties</Text>
            <TouchableOpacity onPress={() => setShowPurchaseBookModal(true)}>
              <Text style={styles.seeAllText}>View Vault ➔</Text>
            </TouchableOpacity>
          </View>

          {purchaseBook.slice(0, 2).map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.pbSnippetCard}
              onPress={() => setShowPurchaseBookModal(true)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.pbMerchant}>{record.merchantName}</Text>
                <Text style={styles.pbDetails}>
                  Inv: {record.invoiceNumber} • ₹{record.grandTotal.toLocaleString('en-IN')}
                </Text>
              </View>
              <View style={styles.pbWarrantyBadge}>
                <Text style={styles.pbWarrantyText}>
                  {record.warrantyStatus === 'LIFETIME' ? '🛡️ Lifetime' : '🛡️ Active'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modals */}
      <PurchaseBookModal
        visible={showPurchaseBookModal}
        records={purchaseBook}
        onClose={() => setShowPurchaseBookModal(false)}
      />

      <LoyaltyModal
        visible={showLoyaltyModal}
        loyalty={loyalty}
        onClose={() => setShowLoyaltyModal(false)}
        onRedeem={() => onNavigateTab('marketplace')}
      />

      <Modal visible={showTrustModal} animationType="slide">
        <TrustProfileScreen
          initialMode="CRS"
          onClose={() => setShowTrustModal(false)}
        />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    fontSize: 14,
    color: Palette.textSecondary,
    marginTop: 10,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 19,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  customerPill: {
    backgroundColor: Palette.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  customerPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  crsBadge: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
  },
  crsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.mintDark,
    textTransform: 'uppercase',
  },
  crsScore: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.mintDark,
    marginVertical: 1,
  },
  crsTier: {
    fontSize: 9,
    fontWeight: '600',
    color: Palette.mintDark,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickActionItem: {
    width: '23%',
    backgroundColor: Palette.surface,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 9,
    color: Palette.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: Palette.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  orderCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  orderCardSub: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  orderStatusPill: {
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  stepperContainer: {
    marginBottom: 14,
  },
  stepperLine: {
    height: 4,
    backgroundColor: Palette.border,
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  stepperProgress: {
    height: '100%',
    backgroundColor: Palette.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.border,
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: Palette.primary,
  },
  stepLabel: {
    fontSize: 9,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  orderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    marginBottom: 10,
  },
  orderItemsText: {
    fontSize: 11,
    color: Palette.textSecondary,
    flex: 1,
  },
  orderAmountText: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  chatStoreBtn: {
    backgroundColor: Palette.background,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  chatStoreBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  catsScroll: {
    flexDirection: 'row',
  },
  catCard: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    minWidth: 90,
  },
  catEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  catCount: {
    fontSize: 9,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  shopCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  shopCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  shopCategory: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  shopAddress: {
    fontSize: 10,
    color: Palette.textMuted,
    marginTop: 2,
  },
  shopTrustBadge: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shopTrustText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  shopVerifiedPill: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.mintDark,
  },
  shopOpenText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '500',
  },
  pbSnippetCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  pbMerchant: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  pbDetails: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  pbWarrantyBadge: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pbWarrantyText: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.mintDark,
  },
});
