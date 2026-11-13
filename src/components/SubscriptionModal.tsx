import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {
  Sparkles,
  X,
  CheckCircle2,
  XCircle,
  Tag,
  CreditCard,
} from 'lucide-react-native';
import {
  subscriptionService,
  SubscriptionPlan,
  CurrentSubscription,
} from '../services/subscriptionService';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanUpdated?: () => void;
  companyId?: number;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  visible,
  onClose,
  onPlanUpdated,
  companyId = 1,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<CurrentSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlanId, setSelectedPlanId] = useState<number>(2); // Default to Standard MSME

  // Coupon state
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponLoading, setCouponLoading] = useState<boolean>(false);

  // Processing payment
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible, companyId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, subData] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrentSubscription(companyId),
      ]);
      setPlans(plansData);
      setCurrentSub(subData);
      if (subData?.planId) {
        setSelectedPlanId(subData.planId === 1 ? 2 : subData.planId);
      }
    } catch (err: any) {
      console.warn('Failed to load subscription data:', err?.message || err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await subscriptionService.validateCoupon(couponCode, selectedPlanId);
      setAppliedCoupon(res);
      Alert.alert('Coupon Applied!', `You saved ₹${res.discountAmount} with code "${res.code}"`);
    } catch (err: any) {
      Alert.alert('Invalid Coupon', err?.response?.data?.message || err.message || 'Coupon code not applicable');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    if (plan.monthlyPrice === 0) {
      Alert.alert('Free Tier Active', 'You are already eligible for Free Starter features.');
      return;
    }

    setProcessingPayment(true);
    try {
      // 1. Checkout order creation
      const checkoutRes = await subscriptionService.checkout(
        selectedPlanId,
        billingCycle,
        appliedCoupon?.code,
        companyId,
      );

      // 2. Simulate Razorpay Payment Gateway capture
      const paymentId = `pay_mock_${Date.now()}`;
      await subscriptionService.verifyPayment({
        planId: selectedPlanId,
        razorpayOrderId: checkoutRes.orderId,
        razorpayPaymentId: paymentId,
        amount: checkoutRes.finalAmount,
        couponCode: appliedCoupon?.code,
        billingCycle,
        companyId,
      });

      Alert.alert(
        'Subscription Activated! 🎉',
        `Welcome to ${plan.name} (${billingCycle.toUpperCase()}). All premium quotas, ESC/POS printing and search boosts are now live for your store!`,
        [
          {
            text: 'Great!',
            onPress: () => {
              if (onPlanUpdated) onPlanUpdated();
              loadData();
              onClose();
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Payment Error', err?.response?.data?.message || err.message || 'Payment capture failed.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleCancelAutoRenewal = async () => {
    Alert.alert(
      'Cancel Auto-Renewal?',
      'Your active plan benefits will continue until the end of your billing cycle. You will not be charged automatically upon expiry.',
      [
        { text: 'Keep Auto-Renewal', style: 'cancel' },
        {
          text: 'Cancel Mandate',
          style: 'destructive',
          onPress: async () => {
            try {
              await subscriptionService.cancelAutoRenewal(companyId, 'Merchant requested cancellation');
              Alert.alert('Auto-Renewal Cancelled', 'Recurring mandate cancelled successfully.');
              loadData();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Could not cancel auto-renewal.');
            }
          },
        },
      ],
    );
  };

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1] || plans[0];
  const basePrice = selectedPlan ? (billingCycle === 'annual' ? selectedPlan.annualPrice : selectedPlan.monthlyPrice) : 0;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPayable = Math.max(0, basePrice - discountAmount);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Sparkles size={20} color="#7C3AED" />
                <Text style={styles.titleText}>Business Subscriptions</Text>
              </View>
              <Text style={styles.subtitleText}>Unlock unlimited catalog, thermal printing & marketplace boost</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
              <Text style={styles.loadingText}>Fetching available MSME plans...</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
              {/* Current Active Plan Status Banner */}
              {currentSub && (
                <View style={styles.currentSubCard}>
                  <View style={styles.subBadgeRow}>
                    <View style={styles.subPlanPill}>
                      <View style={styles.greenDot} />
                      <Text style={styles.subPlanPillText}>{currentSub.planName} Active</Text>
                    </View>
                    <Text style={styles.daysRemainingText}>
                      {currentSub.daysRemaining > 365 ? 'Lifetime Access' : `${currentSub.daysRemaining} days remaining`}
                    </Text>
                  </View>

                  <View style={styles.quotaRow}>
                    <Text style={styles.quotaLabel}>Catalog Product Quota:</Text>
                    <Text style={styles.quotaValue}>
                      {currentSub.usage.itemsCount} / {currentSub.usage.maxProducts === -1 ? 'Unlimited' : `${currentSub.usage.maxProducts} items`}
                    </Text>
                  </View>

                  {currentSub.autoRenewalActive && (
                    <TouchableOpacity onPress={handleCancelAutoRenewal} style={styles.cancelMandateLink}>
                      <Text style={styles.cancelMandateText}>Cancel Auto-Renewal Mandate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Billing Cycle Switcher */}
              <View style={styles.cycleToggleContainer}>
                <TouchableOpacity
                  style={[styles.cycleBtn, billingCycle === 'monthly' && styles.cycleBtnActive]}
                  onPress={() => {
                    setBillingCycle('monthly');
                    setAppliedCoupon(null);
                  }}
                >
                  <Text style={[styles.cycleBtnText, billingCycle === 'monthly' && styles.cycleBtnTextActive]}>
                    Monthly Billing
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cycleBtn, billingCycle === 'annual' && styles.cycleBtnActive]}
                  onPress={() => {
                    setBillingCycle('annual');
                    setAppliedCoupon(null);
                  }}
                >
                  <Text style={[styles.cycleBtnText, billingCycle === 'annual' && styles.cycleBtnTextActive]}>
                    Annual Billing (Save 17%)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Plan Cards */}
              <View style={styles.plansContainer}>
                {plans.map((p) => {
                  const isSelected = p.id === selectedPlanId;
                  const price = billingCycle === 'annual' ? p.annualPrice : p.monthlyPrice;
                  const isCurrent = currentSub?.planId === p.id;

                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[styles.planCard, isSelected && styles.planCardSelected]}
                      onPress={() => {
                        setSelectedPlanId(p.id);
                        setAppliedCoupon(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.planHeader}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.planName}>{p.name}</Text>
                            {p.id === 2 && (
                              <View style={styles.popularBadge}>
                                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                              </View>
                            )}
                            {isCurrent && (
                              <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>CURRENT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.planDesc}>{p.description}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.planPrice}>₹{price}</Text>
                          <Text style={styles.planPerPeriod}>/{billingCycle === 'annual' ? 'year' : 'month'}</Text>
                        </View>
                      </View>

                      {/* Feature Checklist */}
                      <View style={styles.featureList}>
                        <View style={styles.featureItem}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <Text style={styles.featureItemText}>
                            {p.features?.maxProducts === -1 ? 'Unlimited Marketplace Products' : `Up to ${p.features?.maxProducts || 10} Products`}
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <Text style={styles.featureItemText}>
                            {p.features?.maxStaff === -1 ? 'Unlimited Staff Accounts' : `${p.features?.maxStaff || 1} Staff User Login`}
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          {p.features?.thermalPrinting ? (
                            <CheckCircle2 size={16} color="#10B981" />
                          ) : (
                            <XCircle size={16} color="#9CA3AF" />
                          )}
                          <Text style={[styles.featureItemText, !p.features?.thermalPrinting && { color: '#9CA3AF' }]}>
                            ESC/POS Thermal Receipt Printing Bridge
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <CheckCircle2 size={16} color="#10B981" />
                          <Text style={styles.featureItemText}>
                            {p.features?.radiusBoost ? `${p.features.radiusBoost}x Marketplace Radius Search Boost` : 'Standard Discovery'}
                          </Text>
                        </View>
                        {p.features?.customBranding && (
                          <View style={styles.featureItem}>
                            <CheckCircle2 size={16} color="#10B981" />
                            <Text style={styles.featureItemText}>Custom Watermark & GST Branding on Invoices</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Coupon Section */}
              <View style={styles.couponContainer}>
                <Text style={styles.couponHeading}>Have a Promo / Referral Code?</Text>
                <View style={styles.couponInputRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="e.g. WELCOME20 or FLAT100"
                    placeholderTextColor="#9CA3AF"
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.applyCouponBtn}
                    onPress={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                  >
                    {couponLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.applyCouponBtnText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {appliedCoupon && (
                  <View style={styles.appliedCouponTag}>
                    <Tag size={16} color="#059669" />
                    <Text style={styles.appliedCouponText}>
                      Code {appliedCoupon.code} applied! Saved ₹{appliedCoupon.discountAmount}
                    </Text>
                  </View>
                )}
              </View>

              {/* Order Summary */}
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Payment Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{selectedPlan?.name} ({billingCycle})</Text>
                  <Text style={styles.summaryVal}>₹{basePrice}.00</Text>
                </View>
                {discountAmount > 0 && (
                  <View style={styles.summaryRow}>
                    <Text style={[styles.summaryLabel, { color: '#059669' }]}>Promo Discount</Text>
                    <Text style={[styles.summaryVal, { color: '#059669' }]}>-₹{discountAmount}.00</Text>
                  </View>
                )}
                <View style={styles.summaryDivider} />
                <View style={styles.summaryRow}>
                  <Text style={styles.totalPayableLabel}>Total Amount Payable</Text>
                  <Text style={styles.totalPayableVal}>₹{finalPayable}.00</Text>
                </View>
                <Text style={styles.taxNotice}>* Inclusive of applicable GST. Instant tax invoice saved to Purchase Book.</Text>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[styles.upgradeButton, processingPayment && { opacity: 0.7 }]}
                onPress={handleUpgrade}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.upgradeButtonText}>Connecting to Razorpay...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <CreditCard size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.upgradeButtonText}>
                      {finalPayable === 0 ? 'Activate Plan' : `Pay ₹${finalPayable} via UPI / Card`}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitleText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  currentSubCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 16,
  },
  subBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  subPlanPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6D28D9',
  },
  daysRemainingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  quotaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  quotaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  cancelMandateLink: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  cancelMandateText: {
    fontSize: 12,
    color: '#DC2626',
    textDecorationLine: 'underline',
  },
  cycleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  cycleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cycleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  cycleBtnTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  plansContainer: {
    gap: 12,
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  planCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  popularBadge: {
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
  },
  currentBadge: {
    marginLeft: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  planDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  planPerPeriod: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  featureList: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    gap: 6,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureItemText: {
    fontSize: 12,
    color: '#374151',
  },
  couponContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  couponHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  applyCouponBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 10,
  },
  applyCouponBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  appliedCouponTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  appliedCouponText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#4B5563',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalPayableLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  totalPayableVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#7C3AED',
  },
  taxNotice: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
  },
  upgradeButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
