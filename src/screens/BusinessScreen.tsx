import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { Palette } from '../theme/colors';
import {
  businessApi,
  BusinessCompany,
  BusinessItem,
  MerchantOrder,
} from '../services/business';
import { CreateCompanyModal } from '../components/CreateCompanyModal';
import { CreateItemModal } from '../components/CreateItemModal';
import { ThermalPrinterModal } from '../components/ThermalPrinterModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { UniversalScannerModal } from '../components/UniversalScannerModal';
import { MerchantLoyaltyConfigModal } from '../components/MerchantLoyaltyConfigModal';
import { B2bSupplierModal } from '../components/B2bSupplierModal';
import { OfflineSyncModal } from '../components/OfflineSyncModal';
import { Barcode, Scan } from 'lucide-react-native';

interface BusinessScreenProps {
  onNavigateToChat?: (threadId: string, recipientName: string) => void;
}

export const BusinessScreen: React.FC<BusinessScreenProps> = ({ onNavigateToChat }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory'>('overview');
  const [companies, setCompanies] = useState<BusinessCompany[]>([]);
  const [activeCompany, setActiveCompany] = useState<BusinessCompany | null>(null);
  const [items, setItems] = useState<BusinessItem[]>([]);
  const [orders, setOrders] = useState<MerchantOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [searchItemQuery, setSearchItemQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [showB2bModal, setShowB2bModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<MerchantOrder | null>(null);

  const loadData = async () => {
    try {
      const [fetchedCompanies, fetchedItems, fetchedOrders] = await Promise.all([
        businessApi.getCompanies().catch(() => []),
        businessApi.getItems().catch(() => []),
        businessApi.getOrders().catch(() => []),
      ]);

      setCompanies(fetchedCompanies);
      if (fetchedCompanies.length > 0 && !activeCompany) {
        setActiveCompany(fetchedCompanies[0]);
      }
      setItems(fetchedItems);
      setOrders(fetchedOrders);
    } catch (e: any) {
      console.warn('Error loading business workspace data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Switch company context
  const handleSelectCompany = (comp: BusinessCompany) => {
    setActiveCompany(comp);
  };

  // Web Accounting Bridge (SSO Ticket Handshake)
  const handleLaunchWebAccounting = async () => {
    try {
      const ticketRes = await businessApi.generateSsoTicket(activeCompany?.id || '1');
      Alert.alert(
        'Laravel Accounting Bridge 🌐',
        `Single-use SSO Ticket generated: ${ticketRes.ticket}\n\nRedirecting to TredBook Web ERP at ${ticketRes.redirectUrl}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Web ERP',
            onPress: () => {
              Linking.openURL(ticketRes.redirectUrl).catch(() => {
                Alert.alert('Notice', 'Web portal demo link opened.');
              });
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('SSO Error', e.message || 'Could not generate SSO token');
    }
  };

  // Toggle item publication
  const handleTogglePublish = async (item: BusinessItem) => {
    const updatedState = !item.isPublished;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isPublished: updatedState } : i)),
    );

    try {
      await businessApi.togglePublishItem(item.id, updatedState);
    } catch {
      // Revert if error
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, isPublished: !updatedState } : i)),
      );
      Alert.alert('Update Failed', 'Could not update publication state.');
    }
  };

  // Update order fulfillment status
  const handleAdvanceOrderStatus = async (
    order: MerchantOrder,
    nextStatus: 'PREPARING' | 'DISPATCHED' | 'DELIVERED',
  ) => {
    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)),
    );

    try {
      await businessApi.updateOrderStatus(order.id, nextStatus);
    } catch {
      // Revert if error
      loadData();
    }
  };

  // Open Thermal Printer
  const handleOpenPrinter = (order: MerchantOrder) => {
    setSelectedOrderForPrint(order);
    setShowPrinterModal(true);
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'PENDING') {
      return o.status === 'PLACED' || o.status === 'CONFIRMED' || o.status === 'PREPARING';
    }
    if (orderFilter === 'COMPLETED') {
      return o.status === 'DISPATCHED' || o.status === 'DELIVERED';
    }
    return true;
  });

  // Filtered items
  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(searchItemQuery.toLowerCase()) ||
    i.itemCode.toLowerCase().includes(searchItemQuery.toLowerCase()),
  );

  // Compute live stats
  const totalRevenue = orders.reduce((sum, o) => sum + o.grandTotal, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'DELIVERED',
  ).length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Loading Merchant Workspace...</Text>
      </View>
    );
  }

  const currentComp = activeCompany || {
    id: '1',
    businessName: 'Shree Ambica Jewels & Gems',
    gstNumber: '24AAACS1234A1Z5',
    panNumber: 'AAACS1234A',
    businessAddress: 'Shop 14, CG Road, Navrangpura, Ahmedabad',
    pincode: '380009',
    phone: '+91 98765 43210',
    email: 'contact@ambicajewels.in',
    trustScore: 885,
    businessCode: 'TB-B00142',
    isVerified: true,
  };

  return (
    <View style={styles.container}>
      {/* Top Header & Business Context Switcher */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={styles.headerEyebrow}>MERCHANT OPERATING SYSTEM</Text>
            <View style={styles.businessSelector}>
              <Text style={styles.businessTitle} numberOfLines={1}>
                {currentComp.businessName}
              </Text>
            </View>
            <View style={styles.badgesRow}>
              <View style={styles.trustBadge}>
                <Text style={styles.trustScoreText}>BTS {currentComp.trustScore}</Text>
              </View>
              {currentComp.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ GST Verified</Text>
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.addCompanyBtn}
            onPress={() => setShowCreateCompany(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addCompanyBtnText}>+ Firm</Text>
          </TouchableOpacity>
        </View>

        {/* Quick ERP & Hardware Bridges */}
        <View style={styles.bridgesBar}>
          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={handleLaunchWebAccounting}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>🌐 Accounting SSO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={() => {
              if (orders.length > 0) {
                handleOpenPrinter(orders[0]);
              } else {
                Alert.alert('No Orders', 'Place or select an order to print receipt.');
              }
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>🖨️ POS Thermal</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={() => setShowCreateItem(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>➕ Add Item</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={() => setShowLoyaltyModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>🎁 Loyalty</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={() => setShowB2bModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>🏭 B2B Wholesale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bridgeBtn}
            onPress={() => setShowSyncModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.bridgeBtnText}>⚡ Offline Sync</Text>
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              📊 Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
            onPress={() => setActiveTab('orders')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              📦 Orders ({activeOrdersCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'inventory' && styles.tabBtnActive]}
            onPress={() => setActiveTab('inventory')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
              📋 Inventory ({items.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Tab Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ==================================================== */}
        {/* TAB 1: OVERVIEW & STATS                              */}
        {/* ==================================================== */}
        {activeTab === 'overview' && (
          <View>
            {/* Multi-Tier Subscription Banner (FN-SUBS-05) */}
            <TouchableOpacity
              style={styles.subBanner}
              onPress={() => setShowSubModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.subBannerLeft}>
                <View style={styles.subBannerPill}>
                  <View style={styles.subGreenDot} />
                  <Text style={styles.subBannerPillText}>Standard MSME Plan Active</Text>
                </View>
                <Text style={styles.subBannerTitle}>Unlimited Catalog & ESC/POS Printing</Text>
                <Text style={styles.subBannerSub}>2x Radius Search Boost • Next renewal in 30 days</Text>
              </View>
              <View style={styles.subUpgradeBtn}>
                <Text style={styles.subUpgradeBtnText}>Manage ➔</Text>
              </View>
            </TouchableOpacity>

            {/* KPI Cards Row */}
            <View style={styles.kpiRow}>
              {/* Revenue */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.mintLight }]}>
                <Text style={styles.kpiLabel}>Today's Revenue</Text>
                <Text style={styles.kpiValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
                <Text style={styles.kpiGrowth}>↑ 14.8% vs last week</Text>
              </View>

              {/* Active Orders */}
              <View style={[styles.kpiCard, { backgroundColor: Palette.lilacLight }]}>
                <Text style={styles.kpiLabel}>Active Orders</Text>
                <Text style={styles.kpiValue}>{activeOrdersCount}</Text>
                <Text style={styles.kpiGrowth}>Fulfillment pending</Text>
              </View>
            </View>

            {/* Total Items Card */}
            <View style={[styles.kpiFullCard, { backgroundColor: Palette.holoPink }]}>
              <View>
                <Text style={styles.kpiLabel}>Live Catalog</Text>
                <Text style={styles.kpiValue}>{items.length} Products</Text>
                <Text style={styles.kpiSub}>
                  {items.filter((i) => i.isPublished).length} visible on Marketplace
                </Text>
              </View>
              <TouchableOpacity
                style={styles.kpiActionBtn}
                onPress={() => setShowCreateItem(true)}
              >
                <Text style={styles.kpiActionBtnText}>+ Add New</Text>
              </TouchableOpacity>
            </View>

            {/* Business Passport & Details Card */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Business Passport</Text>
                <Text style={styles.sectionCode}>{currentComp.businessCode}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>GSTIN</Text>
                <Text style={styles.detailValue}>{currentComp.gstNumber}</Text>
              </View>

              {currentComp.panNumber ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>PAN</Text>
                  <Text style={styles.detailValue}>{currentComp.panNumber}</Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Store Address</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {currentComp.businessAddress || 'Not set'}, PIN {currentComp.pincode}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Direct Phone</Text>
                <Text style={styles.detailValue}>{currentComp.phone || 'N/A'}</Text>
              </View>

              <View style={styles.complianceRow}>
                <Text style={styles.complianceText}>
                  🛡️ BIS Hallmark & E-Invoice Compliant (TredBook Trust Verified)
                </Text>
              </View>
            </View>

            {/* Quick Actions Shortcuts */}
            <View style={styles.shortcutsCard}>
              <Text style={styles.sectionTitle}>Merchant Shortcuts</Text>
              <View style={styles.shortcutGrid}>
                <TouchableOpacity
                  style={styles.shortcutItem}
                  onPress={() => setActiveTab('orders')}
                >
                  <Text style={styles.shortcutIcon}>📦</Text>
                  <Text style={styles.shortcutLabel}>Fulfill Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutItem}
                  onPress={() => setActiveTab('inventory')}
                >
                  <Text style={styles.shortcutIcon}>📋</Text>
                  <Text style={styles.shortcutLabel}>Stock Ledger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutItem}
                  onPress={handleLaunchWebAccounting}
                >
                  <Text style={styles.shortcutIcon}>📑</Text>
                  <Text style={styles.shortcutLabel}>GST Invoicing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shortcutItem}
                  onPress={() => setShowCreateCompany(true)}
                >
                  <Text style={styles.shortcutIcon}>🏢</Text>
                  <Text style={styles.shortcutLabel}>Add Branch</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 2: MERCHANT ORDER FULFILLMENT                    */}
        {/* ==================================================== */}
        {activeTab === 'orders' && (
          <View>
            {/* Filter pills */}
            <View style={styles.filterPillsRow}>
              {(['ALL', 'PENDING', 'COMPLETED'] as const).map((filter) => {
                const isActive = orderFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterPill, isActive && styles.filterPillActive]}
                    onPress={() => setOrderFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        isActive && styles.filterPillTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptySub}>
                  Orders placed by customers in the Marketplace will appear here for fulfillment.
                </Text>
              </View>
            ) : (
              filteredOrders.map((order) => {
                const isPending =
                  order.status === 'PLACED' || order.status === 'CONFIRMED';
                const isPreparing = order.status === 'PREPARING';
                const isDispatched = order.status === 'DISPATCHED';
                const isDelivered = order.status === 'DELIVERED';

                return (
                  <View key={order.id} style={styles.orderCard}>
                    {/* Header: Order Code & Status */}
                    <View style={styles.orderHeader}>
                      <View>
                        <Text style={styles.orderCode}>{order.orderCode}</Text>
                        <Text style={styles.orderTime}>
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          • Pay Mode: {order.paymentMethod}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadgeOrder,
                          isDelivered && { backgroundColor: Palette.mintLight },
                          isPreparing && { backgroundColor: Palette.lilacLight },
                          isPending && { backgroundColor: '#FEF3C7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isDelivered && { color: Palette.mintDark },
                            isPreparing && { color: Palette.lilacDark },
                            isPending && { color: '#92400E' },
                          ]}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>

                    {/* Customer & Address */}
                    <View style={styles.customerBox}>
                      <Text style={styles.customerName}>
                        Customer: {order.customerName || 'TredBook Buyer'}
                        {order.customerPhone ? ` (${order.customerPhone})` : ''}
                      </Text>
                      <Text style={styles.customerAddr} numberOfLines={2}>
                        📍 {order.deliveryAddress}
                      </Text>
                    </View>

                    {/* Item lines */}
                    <View style={styles.itemsBox}>
                      {order.items.map((item, idx) => (
                        <View key={idx} style={styles.orderItemLine}>
                          <Text style={styles.orderItemName} numberOfLines={1}>
                            {item.quantity}x {item.name}
                          </Text>
                          <Text style={styles.orderItemPrice}>
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Order Total */}
                    <View style={styles.orderTotalLine}>
                      <Text style={styles.orderTotalLabel}>Grand Total (incl. GST):</Text>
                      <Text style={styles.orderTotalVal}>
                        ₹{order.grandTotal.toLocaleString('en-IN')}
                      </Text>
                    </View>

                    {/* Action Buttons Row */}
                    <View style={styles.orderActionsRow}>
                      {/* Thermal Print Receipt */}
                      <TouchableOpacity
                        style={styles.actionReceiptBtn}
                        onPress={() => handleOpenPrinter(order)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionReceiptText}>🖨️ Receipt</Text>
                      </TouchableOpacity>

                      {/* Chat Customer */}
                      {onNavigateToChat && (
                        <TouchableOpacity
                          style={styles.actionChatBtn}
                          onPress={() =>
                            onNavigateToChat(
                              `chat-${order.userId}`,
                              order.customerName || 'Customer',
                            )
                          }
                          activeOpacity={0.7}
                        >
                          <Text style={styles.actionChatText}>💬 Chat</Text>
                        </TouchableOpacity>
                      )}

                      {/* Status Progression Button */}
                      {isPending && (
                        <TouchableOpacity
                          style={styles.statusProgressionBtn}
                          onPress={() => handleAdvanceOrderStatus(order, 'PREPARING')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statusProgressionText}>👨‍🍳 Mark Preparing</Text>
                        </TouchableOpacity>
                      )}

                      {isPreparing && (
                        <TouchableOpacity
                          style={[styles.statusProgressionBtn, { backgroundColor: '#3B82F6' }]}
                          onPress={() => handleAdvanceOrderStatus(order, 'DISPATCHED')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statusProgressionText}>🚚 Mark Dispatched</Text>
                        </TouchableOpacity>
                      )}

                      {isDispatched && (
                        <TouchableOpacity
                          style={[styles.statusProgressionBtn, { backgroundColor: '#10B981' }]}
                          onPress={() => handleAdvanceOrderStatus(order, 'DELIVERED')}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.statusProgressionText}>✅ Mark Delivered</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ==================================================== */}
        {/* TAB 3: INVENTORY & CATALOG MANAGEMENT                */}
        {/* ==================================================== */}
        {activeTab === 'inventory' && (
          <View>
            {/* Search & Add bar */}
            <View style={styles.inventorySearchBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search items by name or SKU..."
                placeholderTextColor={Palette.textMuted}
                value={searchItemQuery}
                onChangeText={setSearchItemQuery}
              />
              <TouchableOpacity
                style={styles.scanBarcodeBtn}
                onPress={() => setShowScannerModal(true)}
                activeOpacity={0.7}
              >
                <Barcode size={18} color="#7C3AED" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addInventoryBtn}
                onPress={() => setShowCreateItem(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addInventoryBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {/* Items List */}
            {filteredItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No Items Found</Text>
                <Text style={styles.emptySub}>
                  Add products to your catalog to track inventory and sell in the marketplace.
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const isLowStock = item.stockCount <= 5;
                return (
                  <View key={item.id} style={styles.itemCard}>
                    <View style={styles.itemHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemMeta}>
                          SKU: {item.itemCode} • HSN: {item.hsnSacCode}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.stockBadge,
                          isLowStock
                            ? { backgroundColor: '#FEF3C7' }
                            : { backgroundColor: Palette.mintLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.stockBadgeText,
                            isLowStock
                              ? { color: '#92400E' }
                              : { color: Palette.mintDark },
                          ]}
                        >
                          {item.stockCount} {item.unit}
                        </Text>
                      </View>
                    </View>

                    {/* Pricing Row */}
                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>
                        ₹{item.salePrice.toLocaleString('en-IN')}
                      </Text>
                      {item.mrp > item.salePrice && (
                        <Text style={styles.itemMrp}>
                          MRP ₹{item.mrp.toLocaleString('en-IN')}
                        </Text>
                      )}
                    </View>

                    {/* Storefront publication switch */}
                    <View style={styles.publishSwitchRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.publishSwitchLabel}>
                          {item.isPublished
                            ? '🟢 Published on Storefront'
                            : '⚪ Hidden from Marketplace'}
                        </Text>
                      </View>
                      <Switch
                        value={item.isPublished}
                        onValueChange={() => handleTogglePublish(item)}
                        trackColor={{ false: Palette.border, true: Palette.mint }}
                        thumbColor={Palette.surface}
                      />
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <CreateCompanyModal
        visible={showCreateCompany}
        onClose={() => setShowCreateCompany(false)}
        onSuccess={(newComp) => {
          setCompanies((prev) => [newComp, ...prev]);
          setActiveCompany(newComp);
        }}
      />

      <CreateItemModal
        visible={showCreateItem}
        companyId={currentComp.id}
        onClose={() => setShowCreateItem(false)}
        onSuccess={(newItem) => {
          setItems((prev) => [newItem, ...prev]);
        }}
      />

      <ThermalPrinterModal
        visible={showPrinterModal}
        order={selectedOrderForPrint}
        companyName={currentComp.businessName}
        gstNumber={currentComp.gstNumber}
        onClose={() => setShowPrinterModal(false)}
      />

      <SubscriptionModal
        visible={showSubModal}
        onClose={() => setShowSubModal(false)}
        companyId={Number(currentComp.id || 1)}
        onPlanUpdated={loadData}
      />

      <UniversalScannerModal
        visible={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        defaultMode="barcode"
        onScanResult={(code) => setSearchItemQuery(code)}
      />

      <MerchantLoyaltyConfigModal
        visible={showLoyaltyModal}
        companyId={Number(currentComp.id || 1)}
        onClose={() => setShowLoyaltyModal(false)}
      />

      <B2bSupplierModal
        visible={showB2bModal}
        onClose={() => setShowB2bModal(false)}
      />

      <OfflineSyncModal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
      />
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
  subBanner: {
    backgroundColor: '#FAF5FF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  subBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  subBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 6,
    marginBottom: 6,
  },
  subGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  subBannerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6D28D9',
  },
  subBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  subBannerSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  subUpgradeBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  subUpgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  header: {
    backgroundColor: Palette.surface,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 0.8,
  },
  businessSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  trustBadge: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  verifiedBadge: {
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.lilacDark,
  },
  addCompanyBtn: {
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Palette.lilac,
  },
  addCompanyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  bridgesBar: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bridgeBtn: {
    flex: 1,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  bridgeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Palette.background,
    borderRadius: 12,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: Palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  tabTextActive: {
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 40,
  },
  kpiRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginVertical: 4,
  },
  kpiGrowth: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.textSecondary,
  },
  kpiFullCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  kpiActionBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  kpiActionBtnText: {
    color: Palette.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionCode: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: Palette.textPrimary,
    fontWeight: '600',
    flex: 1.8,
    textAlign: 'right',
  },
  complianceRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
  },
  complianceText: {
    fontSize: 11,
    color: Palette.mintDark,
    fontWeight: '500',
  },
  shortcutsCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  shortcutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  shortcutItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 12,
  },
  shortcutIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  shortcutLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  filterPillsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  filterPillTextActive: {
    color: Palette.surface,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  emptySub: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  orderTime: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  statusBadgeOrder: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  customerBox: {
    backgroundColor: Palette.background,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  customerAddr: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  itemsBox: {
    marginBottom: 10,
  },
  orderItemLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: {
    fontSize: 12,
    color: Palette.textPrimary,
    flex: 1,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  orderTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Palette.borderSubtle,
    marginBottom: 12,
  },
  orderTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  orderTotalVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  orderActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionReceiptBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Palette.lilacLight,
    marginRight: 6,
  },
  actionReceiptText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  actionChatBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Palette.mintLight,
    marginRight: 6,
  },
  actionChatText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  statusProgressionBtn: {
    flex: 1,
    backgroundColor: Palette.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusProgressionText: {
    color: Palette.surface,
    fontSize: 11,
    fontWeight: '700',
  },
  inventorySearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: Palette.textPrimary,
    marginRight: 8,
  },
  scanBarcodeBtn: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addInventoryBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
  },
  addInventoryBtnText: {
    color: Palette.surface,
    fontSize: 13,
    fontWeight: '700',
  },
  itemCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  itemMeta: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  stockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginRight: 8,
  },
  itemMrp: {
    fontSize: 12,
    color: Palette.textSecondary,
    textDecorationLine: 'line-through',
  },
  publishSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Palette.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  publishSwitchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
});
