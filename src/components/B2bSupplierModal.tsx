import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {
  Factory,
  Building2,
  Scale,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Coins,
  Package,
  X,
  Layers,
  Send,
  Star,
  Tag,
  CreditCard,
  MapPin,
} from 'lucide-react-native';
import {
  b2bService,
  B2bSupplier,
  WholesaleProduct,
  B2bRfq,
  SupplierComparisonMatrix,
} from '../services/b2bService';
import { useLanguage } from '../context/LanguageContext';

interface B2bSupplierModalProps {
  visible: boolean;
  onClose: () => void;
}

export const B2bSupplierModal: React.FC<B2bSupplierModalProps> = ({ visible, onClose }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'RFQS' | 'COMPARE'>('CATALOG');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  const [suppliers, setSuppliers] = useState<B2bSupplier[]>([]);
  const [catalog, setCatalog] = useState<WholesaleProduct[]>([]);
  const [rfqs, setRfqs] = useState<B2bRfq[]>([]);
  const [comparison, setComparison] = useState<SupplierComparisonMatrix | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // RFQ Drawer state
  const [selectedProduct, setSelectedProduct] = useState<WholesaleProduct | null>(null);
  const [rfqQty, setRfqQty] = useState<string>('100');
  const [rfqTargetPrice, setRfqTargetPrice] = useState<string>('150');
  const [rfqPincode, setRfqPincode] = useState<string>('380001');
  const [isSample, setIsSample] = useState<boolean>(false);
  const [submittingRfq, setSubmittingRfq] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, industryFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sups, prods, userRfqs, cmp] = await Promise.all([
        b2bService.getSuppliers(industryFilter),
        b2bService.getWholesaleCatalog(),
        b2bService.getCustomerRfqs(),
        b2bService.compareSuppliers('mcb-breakers'),
      ]);
      setSuppliers(sups);
      setCatalog(prods);
      setRfqs(userRfqs);
      setComparison(cmp);
    } catch (err: any) {
      console.error('Failed to load B2B data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRfqDrawer = (prod: WholesaleProduct, sample: boolean = false) => {
    setSelectedProduct(prod);
    setIsSample(sample);
    if (sample) {
      setRfqQty('1');
      setRfqTargetPrice(String(prod.samplePrice));
    } else {
      setRfqQty(String(prod.moq));
      setRfqTargetPrice(String(prod.pricingTiers[0]?.unitPrice || 100));
    }
  };

  const handleSubmitRfq = async () => {
    if (!selectedProduct) return;
    const qty = parseInt(rfqQty, 10) || 0;
    const price = parseFloat(rfqTargetPrice) || 0;

    if (qty <= 0 || price <= 0) {
      Alert.alert('Required', 'Please enter valid quantity and target price.');
      return;
    }

    try {
      setSubmittingRfq(true);
      const created = await b2bService.createRfq({
        supplierId: selectedProduct.supplierId,
        productId: selectedProduct.id,
        quantity: qty,
        targetUnitPrice: price,
        deliveryPincode: rfqPincode,
        requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isSampleOrder: isSample,
      });

      Alert.alert(
        'RFQ Submitted! 📋',
        `Your RFQ #${created.id} was dispatched to ${selectedProduct.supplierName}. They will respond with binding credit terms & shipping quotes.`
      );
      setSelectedProduct(null);
      setActiveTab('RFQS');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit RFQ';
      Alert.alert('RFQ Validation', msg);
    } finally {
      setSubmittingRfq(false);
    }
  };

  const handleAcceptQuote = async (rfqId: string) => {
    try {
      setLoading(true);
      const res = await b2bService.acceptRfq(rfqId);
      Alert.alert(
        'Purchase Order Generated! 🎉',
        `Official B2B Purchase Order #${res.generatedPoNumber} created and synced with Accounting purchase ledger.`
      );
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to accept quote';
      Alert.alert(t.error, msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <Factory size={20} color="#7C3AED" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.b2bWholesale}</Text>
                <Text style={styles.headerSubtitle}>{t.b2bSubtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Top Switcher Tabs */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CATALOG' && styles.tabBtnActive]}
              onPress={() => setActiveTab('CATALOG')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'CATALOG' && styles.tabBtnTextActive]}>
                🏭 Catalog & Mills
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'RFQS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('RFQS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'RFQS' && styles.tabBtnTextActive]}>
                📑 My RFQs & POs ({rfqs.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'COMPARE' && styles.tabBtnActive]}
              onPress={() => setActiveTab('COMPARE')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'COMPARE' && styles.tabBtnTextActive]}>
                ⚖️ 3-Way Compare
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loaderText}>{t.loading}</Text>
            </View>
          ) : activeTab === 'CATALOG' ? (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Industry Filter Carousel */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {['ALL', 'TEXTILES', 'ELECTRONICS', 'JEWELLERY_METALS'].map((ind) => (
                  <TouchableOpacity
                    key={ind}
                    style={[styles.filterPill, industryFilter === ind && styles.filterPillActive]}
                    onPress={() => setIndustryFilter(ind)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        industryFilter === ind && styles.filterPillTextActive,
                      ]}
                    >
                      {ind === 'ALL'
                        ? 'All Industries'
                        : ind.replace('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Verified Mills & Factories Banner */}
              <Text style={styles.sectionHeading}>Verified Regional Manufacturers & Mills</Text>
              {suppliers.map((s) => (
                <View key={s.id} style={styles.supplierCard}>
                  <View style={styles.supplierTop}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.supplierNameRow}>
                        <Text style={styles.supplierName}>{s.name}</Text>
                        {s.isGstVerified && (
                          <View style={styles.gstTag}>
                            <ShieldCheck size={12} color="#16A34A" />
                            <Text style={styles.gstTagText}>Factory Audit</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.supplierMeta}>
                        📍 {s.city}, {s.state} • {s.businessType}
                      </Text>
                    </View>
                    <View style={styles.trustBadge}>
                      <Star size={12} color="#D97706" fill="#D97706" />
                      <Text style={styles.trustText}>BTS {s.trustScore}</Text>
                    </View>
                  </View>

                  <View style={styles.creditRow}>
                    <CreditCard size={13} color="#7C3AED" style={{ marginRight: 6 }} />
                    <Text style={styles.creditText}>{s.creditPaymentTerms}</Text>
                    <Text style={styles.minOrderText}>Min Order: ₹{s.minOrderValue.toLocaleString()}</Text>
                  </View>
                </View>
              ))}

              {/* Wholesale Products Catalog */}
              <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Wholesale Tiered Catalog</Text>
              {catalog.map((prod) => (
                <View key={prod.id} style={styles.productCard}>
                  <View style={styles.prodHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.prodTitle}>{prod.title}</Text>
                      <Text style={styles.prodSupplier}>By: {prod.supplierName}</Text>
                    </View>
                    <View style={styles.moqPill}>
                      <Text style={styles.moqPillText}>MOQ: {prod.moq} {prod.unit}s</Text>
                    </View>
                  </View>

                  {/* Pricing Tiers Table */}
                  <View style={styles.tierTable}>
                    <Text style={styles.tierHeader}>Volume Tier Pricing:</Text>
                    <View style={styles.tierRow}>
                      {prod.pricingTiers.map((t, idx) => (
                        <View key={idx} style={styles.tierBox}>
                          <Text style={styles.tierRange}>
                            {t.minQty}{t.maxQty ? `-${t.maxQty}` : '+'} {prod.unit}s
                          </Text>
                          <Text style={styles.tierPrice}>₹{t.unitPrice}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Actions: Request RFQ & Sample Order */}
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      style={styles.sampleBtn}
                      onPress={() => handleOpenRfqDrawer(prod, true)}
                    >
                      <Package size={14} color="#7C3AED" style={{ marginRight: 4 }} />
                      <Text style={styles.sampleBtnText}>
                        Sample (₹{prod.samplePrice})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rfqBtn}
                      onPress={() => handleOpenRfqDrawer(prod, false)}
                    >
                      <Send size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.rfqBtnText}>{t.requestRfq}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : activeTab === 'RFQS' ? (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {rfqs.length === 0 ? (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>No B2B RFQs submitted yet.</Text>
                </View>
              ) : (
                rfqs.map((r) => (
                  <View key={r.id} style={styles.rfqCard}>
                    <View style={styles.rfqHeader}>
                      <View>
                        <Text style={styles.rfqId}>RFQ #{r.id}</Text>
                        <Text style={styles.rfqQty}>
                          Volume: {r.quantity} Units @ Target ₹{r.targetUnitPrice} (Total: ₹{r.totalTargetAmount})
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.rfqStatusPill,
                          r.status === 'PO_GENERATED'
                            ? styles.statusPo
                            : r.status === 'QUOTE_RECEIVED'
                            ? styles.statusQuote
                            : styles.statusSubmitted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.rfqStatusText,
                            r.status === 'PO_GENERATED'
                              ? styles.statusPoText
                              : r.status === 'QUOTE_RECEIVED'
                              ? styles.statusQuoteText
                              : styles.statusSubmittedText,
                          ]}
                        >
                          {r.status.replace('_', ' ')}
                        </Text>
                      </View>
                    </View>

                    {/* Supplier Formal Quotation Offer */}
                    {r.supplierQuote && (
                      <View style={styles.quoteOfferBox}>
                        <Text style={styles.quoteOfferTitle}>Factory Commercial Quotation:</Text>
                        <Text style={styles.quoteOfferPrice}>
                          Offered Unit Price: ₹{r.supplierQuote.offeredUnitPrice} • Total Bill: ₹{r.supplierQuote.totalAmount}
                        </Text>
                        <Text style={styles.quoteOfferTerms}>
                          💳 Terms: {r.supplierQuote.paymentCreditTerms}
                        </Text>
                        <Text style={styles.quoteOfferDispatch}>
                          🚚 Dispatch: {r.supplierQuote.promisedDispatchDate} ({r.supplierQuote.notes})
                        </Text>

                        {r.status === 'QUOTE_RECEIVED' && (
                          <TouchableOpacity
                            style={styles.acceptQuoteBtn}
                            onPress={() => handleAcceptQuote(r.id)}
                          >
                            <CheckCircle2 size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <Text style={styles.acceptQuoteBtnText}>Accept Quote & Issue PO</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* PO Generated Badge */}
                    {r.status === 'PO_GENERATED' && (
                      <View style={styles.poBadge}>
                        <FileText size={16} color="#059669" style={{ marginRight: 6 }} />
                        <Text style={styles.poBadgeText}>
                          Official Purchase Order: {r.generatedPoNumber} (Synced to Ledger)
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          ) : (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* 3-Way Side-by-Side Comparison Matrix */}
              <Text style={styles.sectionHeading}>Side-by-Side 3-Supplier Comparison Matrix</Text>
              <Text style={styles.compareSub}>
                Comparing active manufacturers for industrial MCB breakers & hardware
              </Text>

              {comparison?.matrix.map((m, idx) => (
                <View key={idx} style={styles.matrixCard}>
                  <View style={styles.matrixTop}>
                    <Text style={styles.matrixSupplierName}>{m.supplierName}</Text>
                    <View style={styles.trustBadge}>
                      <Star size={12} color="#D97706" fill="#D97706" />
                      <Text style={styles.trustText}>BTS {m.trustScore}</Text>
                    </View>
                  </View>

                  <View style={styles.matrixGrid}>
                    <View style={styles.matrixCol}>
                      <Text style={styles.matrixLabel}>Tier Price</Text>
                      <Text style={styles.matrixVal}>₹{m.tierUnitPrice.toLocaleString()}</Text>
                    </View>

                    <View style={styles.matrixCol}>
                      <Text style={styles.matrixLabel}>MOQ</Text>
                      <Text style={styles.matrixVal}>{m.moq} Units</Text>
                    </View>

                    <View style={styles.matrixCol}>
                      <Text style={styles.matrixLabel}>Credit Terms</Text>
                      <Text style={styles.matrixVal}>
                        {m.creditDays > 0 ? `${m.creditDays} Days` : 'RTGS'}
                      </Text>
                    </View>

                    <View style={styles.matrixCol}>
                      <Text style={styles.matrixLabel}>Dispatch</Text>
                      <Text style={styles.matrixVal}>{m.dispatchLeadDays} Days</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* RFQ Submission Drawer */}
          {selectedProduct && (
            <View style={styles.rfqDrawer}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>
                  {isSample ? 'Order Sample: ' : 'Submit Bulk RFQ: '}
                  {selectedProduct.title.slice(0, 24)}...
                </Text>
                <TouchableOpacity onPress={() => setSelectedProduct(null)}>
                  <X size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <View style={styles.drawerInputsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>
                    Quantity ({selectedProduct.unit}s) {isSample ? '(Max 5)' : `(MOQ: ${selectedProduct.moq})`}
                  </Text>
                  <TextInput
                    style={styles.drawerInput}
                    keyboardType="numeric"
                    value={rfqQty}
                    onChangeText={setRfqQty}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Target Unit Price (₹)</Text>
                  <TextInput
                    style={styles.drawerInput}
                    keyboardType="numeric"
                    value={rfqTargetPrice}
                    onChangeText={setRfqTargetPrice}
                  />
                </View>
              </View>

              <View style={styles.drawerInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Destination Pincode</Text>
                  <TextInput
                    style={styles.drawerInput}
                    keyboardType="numeric"
                    value={rfqPincode}
                    onChangeText={setRfqPincode}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmitRfq}
                disabled={submittingRfq}
              >
                {submittingRfq ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isSample ? 'Submit Sample Order' : 'Dispatch RFQ to Factory'}
                  </Text>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginRight: 10,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  tabBtnActive: {
    backgroundColor: '#7C3AED',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loaderWrap: {
    padding: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  contentScroll: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  filterRow: {
    paddingVertical: 6,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  filterPillActive: {
    backgroundColor: '#0F172A',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 8,
  },
  supplierCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  supplierTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  supplierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supplierName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  gstTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  gstTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
    marginLeft: 2,
  },
  supplierMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    marginLeft: 4,
  },
  creditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  creditText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
  },
  minOrderText: {
    fontSize: 10,
    color: '#64748B',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  prodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  prodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  prodSupplier: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  moqPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  moqPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  tierTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  tierHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tierBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  tierRange: {
    fontSize: 9,
    color: '#64748B',
  },
  tierPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  sampleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  rfqBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 9,
  },
  rfqBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rfqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  rfqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rfqId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rfqQty: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  rfqStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusSubmitted: {
    backgroundColor: '#F1F5F9',
  },
  statusQuote: {
    backgroundColor: '#EFF6FF',
  },
  statusPo: {
    backgroundColor: '#DCFCE7',
  },
  rfqStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusSubmittedText: {
    color: '#475569',
  },
  statusQuoteText: {
    color: '#2563EB',
  },
  statusPoText: {
    color: '#16A34A',
  },
  quoteOfferBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quoteOfferTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  quoteOfferPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 4,
  },
  quoteOfferTerms: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 2,
  },
  quoteOfferDispatch: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  acceptQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 8,
  },
  acceptQuoteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  poBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  poBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  compareSub: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  matrixCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  matrixTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matrixSupplierName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  matrixGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  matrixCol: {
    alignItems: 'center',
  },
  matrixLabel: {
    fontSize: 9,
    color: '#64748B',
  },
  matrixVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  emptyWrap: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
  },
  rfqDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerInputsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  drawerInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    height: 38,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
