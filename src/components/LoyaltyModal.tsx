import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Palette } from '../theme/colors';
import { LoyaltyData } from '../services/home';

interface LoyaltyModalProps {
  visible: boolean;
  loyalty: LoyaltyData | null;
  onClose: () => void;
  onRedeem: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({
  visible,
  loyalty,
  onClose,
  onRedeem,
}) => {
  if (!loyalty) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>TredCoins & Rewards 🎁</Text>
              <Text style={styles.headerSubtitle}>
                Customer Loyalty & Commercial Conduct Rewards
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View>
                <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.balanceCoins}>{loyalty.balance} Coins</Text>
                <Text style={styles.balanceCash}>Equivalent Value: ₹{loyalty.balance}.00</Text>
              </View>
              <View style={styles.tierPill}>
                <Text style={styles.tierText}>⭐ {loyalty.tier}</Text>
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Tier Benefits</Text>
              {loyalty.benefits.map((benefit, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Coins Activity History */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {loyalty.recentHistory.map((item) => (
                <View key={item.id} style={styles.historyRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyDesc}>{item.description}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <Text
                    style={[
                      styles.historyCoins,
                      item.type === 'CREDIT' ? styles.coinsCredit : styles.coinsDebit,
                    ]}
                  >
                    {item.coins}
                  </Text>
                </View>
              ))}
            </View>

            {/* Redeem CTA */}
            <TouchableOpacity
              style={styles.redeemBtn}
              onPress={() => {
                onClose();
                onRedeem();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.redeemBtnText}>Redeem Coins in Marketplace 🛍️</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 18, 20, 0.45)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Palette.surface,
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
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
  scrollContent: {
    padding: 16,
  },
  balanceCard: {
    backgroundColor: Palette.mintLight,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
    letterSpacing: 0.5,
  },
  balanceCoins: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginVertical: 4,
  },
  balanceCash: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.mintDark,
  },
  tierPill: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionCard: {
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
    marginBottom: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitCheck: {
    color: Palette.mintDark,
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  benefitText: {
    fontSize: 12,
    color: Palette.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
  },
  historyDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  historyDate: {
    fontSize: 10,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  historyCoins: {
    fontSize: 13,
    fontWeight: '700',
  },
  coinsCredit: {
    color: '#059669',
  },
  coinsDebit: {
    color: '#DC2626',
  },
  redeemBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  redeemBtnText: {
    color: Palette.surface,
    fontSize: 14,
    fontWeight: '700',
  },
});
