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
  trustApi,
  BtsScoreResponse,
  CrsScoreResponse,
  CommercialDispute,
  VerifiedReview,
} from '../services/trust';
import { SubmitReviewModal } from '../components/SubmitReviewModal';
import { RaiseDisputeModal } from '../components/RaiseDisputeModal';

interface TrustProfileScreenProps {
  initialMode?: 'CRS' | 'BTS';
  companyId?: string;
  onClose?: () => void;
}

export const TrustProfileScreen: React.FC<TrustProfileScreenProps> = ({
  initialMode = 'CRS',
  companyId = '1',
  onClose,
}) => {
  const [mode, setMode] = useState<'CRS' | 'BTS'>(initialMode);
  const [subTab, setSubTab] = useState<'overview' | 'reviews' | 'disputes'>('overview');
  const [crsData, setCrsData] = useState<CrsScoreResponse | null>(null);
  const [btsData, setBtsData] = useState<BtsScoreResponse | null>(null);
  const [disputes, setDisputes] = useState<CommercialDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const loadData = async () => {
    try {
      const [crsRes, btsRes, disputesRes] = await Promise.all([
        trustApi.getCrs().catch(() => null),
        trustApi.getBts(companyId).catch(() => null),
        trustApi.getDisputes().catch(() => []),
      ]);

      if (crsRes) setCrsData(crsRes);
      if (btsRes) setBtsData(btsRes);
      setDisputes(disputesRes);
    } catch (e: any) {
      console.warn('Error loading trust data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Calculating Two-Way TrustProfile...</Text>
      </View>
    );
  }

  const activeScore = mode === 'CRS' ? crsData?.score || 750 : btsData?.score || 885;
  const activeTier = mode === 'CRS' ? crsData?.tier || 'Strong Conduct' : btsData?.tier || 'Exceptional Trust';
  const activeTrend = mode === 'CRS' ? crsData?.trend || '+10 pts this quarter' : btsData?.trend || '+15 pts this month';
  const activeBreakdown = mode === 'CRS' ? crsData?.breakdown || [] : btsData?.breakdown || [];

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerEyebrow}>TWO-WAY REPUTATION ENGINE (PRD SEC 11)</Text>
            <Text style={styles.headerTitle}>TrustProfile Passport</Text>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Mode Selector (CRS vs BTS) */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'CRS' && styles.modeBtnActive]}
            onPress={() => setMode('CRS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeBtnText, mode === 'CRS' && styles.modeBtnTextActive]}>
              👤 Customer Reliability (CRS)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'BTS' && styles.modeBtnActive]}
            onPress={() => setMode('BTS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeBtnText, mode === 'BTS' && styles.modeBtnTextActive]}>
              🏪 Business Trust (BTS)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sub-tab navigation */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTabBtn, subTab === 'overview' && styles.subTabBtnActive]}
            onPress={() => setSubTab('overview')}
          >
            <Text style={[styles.subTabText, subTab === 'overview' && styles.subTabTextActive]}>
              Score Factors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, subTab === 'reviews' && styles.subTabBtnActive]}
            onPress={() => setSubTab('reviews')}
          >
            <Text style={[styles.subTabText, subTab === 'reviews' && styles.subTabTextActive]}>
              Verified Reviews ({btsData?.reviewsCount || 2})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, subTab === 'disputes' && styles.subTabBtnActive]}
            onPress={() => setSubTab('disputes')}
          >
            <Text style={[styles.subTabText, subTab === 'disputes' && styles.subTabTextActive]}>
              Dispute Center ({disputes.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Score Visualizer Card */}
        <View style={styles.scoreGaugeCard}>
          <View style={styles.gaugeCenter}>
            <View style={styles.circleOuter}>
              <View style={styles.circleInner}>
                <Text style={styles.gaugeNumber}>{activeScore}</Text>
                <Text style={styles.gaugeScale}>Scale 300 - 900</Text>
              </View>
            </View>
          </View>

          <View style={styles.scoreMetaBox}>
            <View style={styles.tierPill}>
              <Text style={styles.tierText}>⭐ {activeTier}</Text>
            </View>
            <Text style={styles.trendText}>📈 {activeTrend}</Text>
            <Text style={styles.scoreHelpText}>
              {mode === 'CRS'
                ? 'Objective reputation based on your commercial payment discipline and order fulfillment.'
                : 'Verified merchant standard based on BIS purity, invoice issuance, and customer satisfaction.'}
            </Text>
          </View>
        </View>

        {/* ==================================================== */}
        {/* SUBTAB 1: FACTOR BREAKDOWN                           */}
        {/* ==================================================== */}
        {subTab === 'overview' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {mode === 'CRS' ? 'Customer Conduct Weights (100%)' : 'Merchant Trust Weights (100%)'}
              </Text>
            </View>

            {activeBreakdown.map((item, idx) => (
              <View key={idx} style={styles.factorCard}>
                <View style={styles.factorTop}>
                  <Text style={styles.factorName}>{item.factor}</Text>
                  <View style={styles.weightBadge}>
                    <Text style={styles.weightBadgeText}>{item.weightPerc}% Weight</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.factorBarBg}>
                  <View style={[styles.factorBarFill, { width: `${item.score}%` }]} />
                </View>

                <View style={styles.factorBottom}>
                  <Text style={styles.factorDesc}>{item.description}</Text>
                  <Text style={styles.factorScoreText}>{item.score}/100</Text>
                </View>
              </View>
            ))}

            {/* Conduct Tips */}
            {mode === 'CRS' && crsData?.conductTips && (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsTitle}>💡 How to Reach 800+ Tier</Text>
                {crsData.conductTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 2: VERIFIED REVIEWS                           */}
        {/* ==================================================== */}
        {subTab === 'reviews' && (
          <View>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Verified Buyer Ratings</Text>
                <Text style={styles.sectionSub}>Gated by Digital Purchase Book invoices</Text>
              </View>
              <TouchableOpacity
                style={styles.addReviewBtn}
                onPress={() => setShowReviewModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addReviewBtnText}>+ Rate Store</Text>
              </TouchableOpacity>
            </View>

            {(btsData?.verifiedReviews || []).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewTop}>
                  <View>
                    <Text style={styles.reviewerName}>{review.userName}</Text>
                    <Text style={styles.invoiceVerifiedTag}>
                      🛡️ Verified Purchase • {review.invoiceCode}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingBadgeText}>★ {review.rating}.0</Text>
                  </View>
                </View>

                <Text style={styles.reviewComment}>{review.comment}</Text>

                <View style={styles.tagsRow}>
                  {review.tags.map((tag, idx) => (
                    <View key={idx} style={styles.reviewTagPill}>
                      <Text style={styles.reviewTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================================================== */}
        {/* SUBTAB 3: DISPUTE CENTER                             */}
        {/* ==================================================== */}
        {subTab === 'disputes' && (
          <View>
            <View style={styles.reviewsHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Commercial Dispute Center</Text>
                <Text style={styles.sectionSub}>48-Hour Merchant Resolution SLA Guarantee</Text>
              </View>
              <TouchableOpacity
                style={styles.raiseDisputeBtn}
                onPress={() => setShowDisputeModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.raiseDisputeBtnText}>+ Raise Dispute</Text>
              </TouchableOpacity>
            </View>

            {disputes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={styles.emptyTitle}>Zero Active Disputes</Text>
                <Text style={styles.emptySub}>
                  Your commercial conduct is in exemplary standing. All purchases resolved peacefully.
                </Text>
              </View>
            ) : (
              disputes.map((dispute) => {
                const isResolved = dispute.status === 'RESOLVED';
                return (
                  <View key={dispute.id} style={styles.disputeCard}>
                    <View style={styles.disputeTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.disputeReason}>{dispute.reason}</Text>
                        <Text style={styles.disputeMerchant}>
                          Store: {dispute.companyName} • Inv: {dispute.invoiceCode}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.disputeStatusBadge,
                          isResolved ? { backgroundColor: Palette.mintLight } : { backgroundColor: '#FEF3C7' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.disputeStatusText,
                            isResolved ? { color: Palette.mintDark } : { color: '#92400E' },
                          ]}
                        >
                          {dispute.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.disputeDesc}>{dispute.description}</Text>

                    {dispute.resolutionNotes && (
                      <View style={styles.resolutionBox}>
                        <Text style={styles.resolutionTitle}>Resolution Note:</Text>
                        <Text style={styles.resolutionText}>{dispute.resolutionNotes}</Text>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <SubmitReviewModal
        visible={showReviewModal}
        companyId={companyId}
        onClose={() => setShowReviewModal(false)}
        onSuccess={(newRev) => {
          if (btsData) {
            setBtsData({
              ...btsData,
              reviewsCount: btsData.reviewsCount + 1,
              verifiedReviews: [newRev, ...btsData.verifiedReviews],
            });
          }
        }}
      />

      <RaiseDisputeModal
        visible={showDisputeModal}
        companyId={companyId}
        onClose={() => setShowDisputeModal(false)}
        onSuccess={(newDisp) => {
          setDisputes((prev) => [newDisp, ...prev]);
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
  header: {
    backgroundColor: Palette.surface,
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
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
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: Palette.background,
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  modeBtnActive: {
    backgroundColor: Palette.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  modeBtnTextActive: {
    color: Palette.textPrimary,
    fontWeight: '700',
  },
  subTabsRow: {
    flexDirection: 'row',
  },
  subTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 6,
    borderRadius: 8,
  },
  subTabBtnActive: {
    backgroundColor: Palette.lilacLight,
  },
  subTabText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  subTabTextActive: {
    color: Palette.lilacDark,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scoreGaugeCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  gaugeCenter: {
    marginVertical: 10,
  },
  circleOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Palette.mint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#AEE1D3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  circleInner: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: Palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: Palette.textPrimary,
  },
  gaugeScale: {
    fontSize: 10,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  scoreMetaBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  tierPill: {
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    marginBottom: 6,
  },
  tierText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  scoreHelpText: {
    fontSize: 11,
    color: Palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionSub: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  factorCard: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  factorTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    flex: 1,
  },
  weightBadge: {
    backgroundColor: Palette.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  weightBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  factorBarBg: {
    height: 6,
    backgroundColor: Palette.background,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  factorBarFill: {
    height: '100%',
    backgroundColor: Palette.mint,
    borderRadius: 3,
  },
  factorBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorDesc: {
    fontSize: 11,
    color: Palette.textSecondary,
    flex: 1,
    paddingRight: 8,
  },
  factorScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  tipsCard: {
    backgroundColor: Palette.surface,
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: Palette.mintDark,
    fontWeight: 'bold',
    marginRight: 6,
  },
  tipText: {
    fontSize: 11,
    color: Palette.textPrimary,
    flex: 1,
    lineHeight: 16,
  },
  reviewsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  addReviewBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addReviewBtnText: {
    color: Palette.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  raiseDisputeBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  raiseDisputeBtnText: {
    color: Palette.surface,
    fontSize: 12,
    fontWeight: '700',
  },
  reviewCard: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  invoiceVerifiedTag: {
    fontSize: 10,
    color: Palette.mintDark,
    fontWeight: '600',
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
  },
  reviewComment: {
    fontSize: 12,
    color: Palette.textPrimary,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  reviewTagPill: {
    backgroundColor: Palette.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
    marginTop: 4,
  },
  reviewTagText: {
    fontSize: 10,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  disputeCard: {
    backgroundColor: Palette.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  disputeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  disputeReason: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  disputeMerchant: {
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  disputeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  disputeStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  disputeDesc: {
    fontSize: 12,
    color: Palette.textPrimary,
    lineHeight: 17,
    marginBottom: 6,
  },
  resolutionBox: {
    backgroundColor: Palette.mintLight,
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  resolutionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  resolutionText: {
    fontSize: 11,
    color: Palette.mintDark,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  emptySub: {
    fontSize: 12,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
