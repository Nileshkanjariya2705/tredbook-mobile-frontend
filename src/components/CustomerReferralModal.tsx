import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
  Clipboard,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Gift,
  QrCode,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Coins,
  ShieldCheck,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react-native';
import { loyaltyService, CustomerReferralProfile, LoyaltyLedgerData } from '../services/loyaltyService';
import { useLanguage } from '../context/LanguageContext';

interface CustomerReferralModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CustomerReferralModal: React.FC<CustomerReferralModalProps> = ({ visible, onClose }) => {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<CustomerReferralProfile | null>(null);
  const [ledgerData, setLedgerData] = useState<LoyaltyLedgerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [friendCode, setFriendCode] = useState<string>('');
  const [claiming, setClaiming] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [refRes, ledRes] = await Promise.all([
        loyaltyService.getCustomerReferralProfile(),
        loyaltyService.getCustomerLedger(),
      ]);
      setProfile(refRes);
      setLedgerData(ledRes);
    } catch (err: any) {
      console.error('Failed to load referral data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (profile?.referralCode) {
      Clipboard.setString(profile.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShare = async () => {
    if (!profile) return;
    try {
      await Share.share({
        message: `Use my referral code ${profile.referralCode} to sign up on TredBook and get ₹50 welcome discount on your first order! Register here: ${profile.referralLink}`,
        title: 'TredBook Customer Referral',
      });
    } catch (e) {
      console.error('Error sharing referral', e);
    }
  };

  const handleClaimFriendCode = async () => {
    if (!friendCode.trim()) {
      Alert.alert('Required', 'Please enter a valid referral code');
      return;
    }
    try {
      setClaiming(true);
      const res = await loyaltyService.claimReferral(friendCode.trim());
      Alert.alert('Success 🎉', res.message || 'Referral applied successfully!');
      setFriendCode('');
      loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to claim referral code.';
      Alert.alert('Referral Check', msg);
    } finally {
      setClaiming(false);
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
                <Gift size={20} color="#D97706" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.referralTitle}</Text>
                <Text style={styles.headerSubtitle}>
                  {t.referralSubtitle}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#D97706" />
              <Text style={styles.loaderText}>{t.loading}</Text>
            </View>
          ) : (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Highlight Card: Referral Code & QR Box */}
              <View style={styles.heroCard}>
                <View style={styles.qrRepresentation}>
                  <QrCode size={48} color="#0F172A" />
                  <Text style={styles.qrCodeLabel}>{profile?.qrPayload}</Text>
                </View>

                <View style={styles.codeRow}>
                  <Text style={styles.codePrefix}>Code: </Text>
                  <Text style={styles.codeValue}>{profile?.referralCode}</Text>
                  <TouchableOpacity onPress={handleCopyCode} style={styles.copyPill}>
                    {copied ? (
                      <Check size={14} color="#16A34A" />
                    ) : (
                      <Copy size={14} color="#D97706" />
                    )}
                    <Text style={[styles.copyPillText, copied && { color: '#16A34A' }]}>
                      {copied ? 'Copied' : t.copyCode}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
                  <Share2 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.shareBtnText}>{t.shareWhatsapp}</Text>
                </TouchableOpacity>
              </View>

              {/* Statistics Grid */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Users size={18} color="#2563EB" />
                  <Text style={styles.statVal}>{profile?.totalReferrals || 0}</Text>
                  <Text style={styles.statLabel}>{t.friendsReferred}</Text>
                </View>

                <View style={styles.statCard}>
                  <Award size={18} color="#16A34A" />
                  <Text style={styles.statVal}>{profile?.successfulConversions || 0}</Text>
                  <Text style={styles.statLabel}>Orders Done</Text>
                </View>

                <View style={styles.statCard}>
                  <Coins size={18} color="#D97706" />
                  <Text style={styles.statVal}>{profile?.totalCoinsEarned || 0}</Text>
                  <Text style={styles.statLabel}>{t.coinsEarned}</Text>
                </View>
              </View>

              {/* Enter Friend's Referral Code Section */}
              <View style={styles.claimSection}>
                <Text style={styles.claimTitle}>{t.claimReferral}</Text>
                <View style={styles.claimInputRow}>
                  <TextInput
                    style={styles.claimInput}
                    placeholder="e.g. TB-REF-000004"
                    placeholderTextColor="#94A3B8"
                    value={friendCode}
                    onChangeText={setFriendCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={styles.claimBtn}
                    onPress={handleClaimFriendCode}
                    disabled={claiming}
                  >
                    {claiming ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.claimBtnText}>{t.apply}</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.antiFraudNote}>
                  <ShieldCheck size={14} color="#64748B" style={{ marginRight: 4 }} />
                  <Text style={styles.antiFraudText}>
                    Anti-fraud verified: Welcome rewards unlock on 1st qualifying merchant purchase.
                  </Text>
                </View>
              </View>

              {/* Loyalty Ledger Preview */}
              <View style={styles.ledgerSection}>
                <View style={styles.ledgerHeaderRow}>
                  <Text style={styles.ledgerSectionTitle}>Recent Points Statement</Text>
                  <View style={styles.balancePill}>
                    <Coins size={14} color="#D97706" style={{ marginRight: 4 }} />
                    <Text style={styles.balancePillText}>
                      {ledgerData?.currentBalance || 0} Coins
                    </Text>
                  </View>
                </View>

                {ledgerData?.ledger.map((item) => (
                  <View key={item.id} style={styles.ledgerRow}>
                    <View style={styles.ledgerLeft}>
                      <Text style={styles.ledgerDesc}>{item.description}</Text>
                      <Text style={styles.ledgerDate}>
                        {new Date(item.date).toLocaleDateString()} • Ref: {item.transactionRef || item.id}
                      </Text>
                    </View>
                    <View style={styles.ledgerRight}>
                      <Text
                        style={[
                          styles.ledgerPoints,
                          item.points > 0 ? styles.positivePoints : styles.negativePoints,
                        ]}
                      >
                        {item.points > 0 ? `+${item.points}` : item.points}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
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
    maxHeight: '90%',
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
    backgroundColor: '#FEF3C7',
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
    paddingTop: 14,
  },
  heroCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
    alignItems: 'center',
  },
  qrRepresentation: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '500',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  codePrefix: {
    fontSize: 13,
    color: '#475569',
  },
  codeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.5,
  },
  copyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  copyPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
    marginLeft: 4,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    borderRadius: 12,
    width: '100%',
    paddingVertical: 12,
    marginTop: 14,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statVal: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  claimSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginTop: 16,
  },
  claimTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  claimInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  claimInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  claimBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  antiFraudNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  antiFraudText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
  },
  ledgerSection: {
    marginTop: 16,
    paddingBottom: 20,
  },
  ledgerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ledgerSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balancePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  ledgerLeft: {
    flex: 1,
    marginRight: 12,
  },
  ledgerDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  ledgerDate: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  ledgerRight: {
    alignItems: 'flex-end',
  },
  ledgerPoints: {
    fontSize: 13,
    fontWeight: '800',
  },
  positivePoints: {
    color: '#16A34A',
  },
  negativePoints: {
    color: '#DC2626',
  },
});
