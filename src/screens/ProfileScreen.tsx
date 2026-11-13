import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ShieldCheck, Building2, LogOut, QrCode, Award, Fingerprint } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth, CompanySummary } from '../context/AuthContext';
import { Palette, SoftShadow } from '../theme/colors';
import { TrustProfileScreen } from './TrustProfileScreen';

export const ProfileScreen: React.FC = () => {
  const [showTrustModal, setShowTrustModal] = useState(false);
  const {
    user,
    companies,
    activeCompanyId,
    setActiveCompanyId,
    logout,
    isBiometricSupported,
    isBiometricEnabled,
    toggleBiometrics,
    enableBiometricsPostLogin,
  } = useAuth();

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const success = await enableBiometricsPostLogin();
      if (success) {
        Toast.show({
          type: 'success',
          text1: 'Biometrics Activated',
          text2: 'You can now sign in with 1 tap.',
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Verification Cancelled',
          text2: 'Biometric unlock was not enabled.',
        });
      }
    } else {
      await toggleBiometrics(false);
      Toast.show({
        type: 'info',
        text1: 'Biometrics Disabled',
        text2: 'Password or OTP required on next login.',
      });
    }
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out from TredBook?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const allCompanies: CompanySummary[] = [
    ...companies.owned,
    ...companies.shared,
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* User Identity Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TB'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'TredBook User'}</Text>
          <Text style={styles.userContact}>{user?.phone || user?.email}</Text>
          <View style={styles.badgeRow}>
            {user?.phone_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Phone Verified ✓</Text>
              </View>
            )}
            {user?.email_verified && (
              <View style={[styles.verifiedBadge, { backgroundColor: Palette.holoPink }]}>
                <Text style={[styles.verifiedText, { color: Palette.holoPinkDark }]}>Email Verified ✓</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Customer QR Passport Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <QrCode size={18} color={Palette.textPrimary} />
            <Text style={styles.passportTitle}>Digital Customer Passport</Text>
          </View>
          <View style={styles.customerIdPill}>
            <Text style={styles.customerIdText}>{user?.customerId || 'TB-C000000'}</Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={`tredbook:customer:${user?.customerId || user?.id}`}
            size={180}
            color={Palette.textPrimary}
            backgroundColor="#FFFFFF"
          />
        </View>

        <Text style={styles.passportInstructions}>
          Scan or show this QR at any participating store to receive your digital bills, warranties, and loyalty points directly in your Purchase Book.
        </Text>
      </View>

      {/* Two-Way TrustProfile Card */}
      <TouchableOpacity
        style={styles.trustCard}
        onPress={() => setShowTrustModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.trustCardLeft}>
          <Text style={styles.trustCardEyebrow}>COMMERCIAL REPUTATION PASSPORT (PRD SEC 11)</Text>
          <Text style={styles.trustCardTitle}>Customer ReliabilityScore: CRS 750</Text>
          <Text style={styles.trustCardSub}>⭐ Strong Conduct • View 6 score factors & verified reviews</Text>
        </View>
        <View style={styles.trustBadge}>
          <Text style={styles.trustBadgeText}>View ➔</Text>
        </View>
      </TouchableOpacity>

      {/* TrustProfile Modal */}
      <Modal visible={showTrustModal} animationType="slide">
        <TrustProfileScreen
          initialMode="CRS"
          companyId={activeCompanyId || '1'}
          onClose={() => setShowTrustModal(false)}
        />
      </Modal>

      {/* Active Business / Company Context Switcher */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Business & Company Context</Text>
        <Text style={styles.sectionSubtitle}>
          Switch active business to manage billing, inventory, and accounting
        </Text>

        {allCompanies.length === 0 ? (
          <View style={styles.emptyCompanyBox}>
            <Text style={styles.emptyCompanyText}>
              You are currently registered as a Customer. Ready to sell or do accounting?
            </Text>
            <TouchableOpacity
              style={styles.createCompanyBtn}
              onPress={() => Alert.alert('Create Business', 'Create business flow will launch in Stage 4.')}
            >
              <Text style={styles.createCompanyBtnText}>+ Register Your Business</Text>
            </TouchableOpacity>
          </View>
        ) : (
          allCompanies.map((c) => {
            const isActive = c.id === activeCompanyId;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.companyRow, isActive && styles.companyRowActive]}
                onPress={() => setActiveCompanyId(c.id)}
              >
                <View style={styles.companyInfo}>
                  <Text style={[styles.companyName, isActive && styles.companyNameActive]}>
                    {c.name}
                  </Text>
                  <Text style={styles.companyMeta}>
                    {c.isOwner ? 'Owner' : c.role || 'Staff'} {c.gstNumber ? `• GST: ${c.gstNumber}` : ''}
                  </Text>
                </View>
                {isActive && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Active</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Security & Biometrics Section */}
      <View style={styles.sectionCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <ShieldCheck size={18} color={Palette.textPrimary} />
          <Text style={styles.sectionTitle}>Security & Quick Sign-In</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Configure biometric FaceID or fingerprint unlock for rapid login
        </Text>

        <View style={styles.biometricRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Fingerprint size={16} color={Palette.mintDark} />
              <Text style={styles.biometricLabel}>Fingerprint / FaceID Login</Text>
            </View>
            <Text style={styles.biometricSub}>
              {isBiometricSupported
                ? isBiometricEnabled
                  ? 'Active — 1-tap unlock enabled'
                  : 'Disabled — Switch on to activate'
                : 'Not available or not enrolled on device'}
            </Text>
          </View>
          <Switch
            value={isBiometricEnabled}
            onValueChange={handleBiometricToggle}
            disabled={!isBiometricSupported}
            trackColor={{ false: Palette.border, true: Palette.mint }}
            thumbColor={isBiometricEnabled ? Palette.primary : Palette.surface}
          />
        </View>
      </View>

      {/* Account Actions */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={16} color="#DC2626" style={{ marginRight: 6 }} />
        <Text style={styles.logoutButtonText}>Log Out from TredBook</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>TredBook Super-App v1.0.0 (Build 2026.11)</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  userCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  trustCard: {
    backgroundColor: Palette.mintLight,
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.mint,
  },
  trustCardLeft: {
    flex: 1,
    marginRight: 10,
  },
  trustCardEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    color: Palette.mintDark,
    letterSpacing: 0.5,
  },
  trustCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginTop: 2,
  },
  trustCardSub: {
    fontSize: 11,
    color: Palette.mintDark,
    marginTop: 2,
  },
  trustBadge: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Palette.lilac,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.lilacDark,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
  },
  userContact: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: Palette.mint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  passportCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  passportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  passportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  customerIdPill: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.primaryText,
    letterSpacing: 0.5,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: Palette.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 16,
  },
  passportInstructions: {
    fontSize: 12,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  sectionCard: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  emptyCompanyBox: {
    backgroundColor: Palette.lilacLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Palette.lilac,
    alignItems: 'center',
  },
  emptyCompanyText: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  createCompanyBtn: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createCompanyBtnText: {
    color: Palette.primaryText,
    fontSize: 13,
    fontWeight: '700',
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 10,
  },
  companyRowActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.lilacLight,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  companyNameActive: {
    color: Palette.primary,
    fontWeight: '800',
  },
  companyMeta: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: Palette.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activePillText: {
    color: Palette.primaryText,
    fontSize: 11,
    fontWeight: '700',
  },
  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: Palette.mintLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Palette.mint,
    marginTop: 8,
  },
  biometricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  biometricSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: Palette.dangerLight,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: Palette.danger,
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: Palette.textSecondary,
    marginBottom: 30,
  },
});
