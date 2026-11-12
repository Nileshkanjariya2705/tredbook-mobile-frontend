import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ShieldCheck, Building2, LogOut, QrCode, Award, Fingerprint } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useAuth, CompanySummary } from '../context/AuthContext';

export const ProfileScreen: React.FC = () => {
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
              <View style={[styles.verifiedBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.verifiedText, { color: '#0369A1' }]}>Email Verified ✓</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Customer QR Passport Card */}
      <View style={styles.passportCard}>
        <View style={styles.passportHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <QrCode size={18} color="#0284C7" />
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
            color="#0284C7"
            backgroundColor="#FFFFFF"
          />
        </View>

        <Text style={styles.passportInstructions}>
          Scan or show this QR at any participating store to receive your digital bills, warranties, and loyalty points directly in your Purchase Book.
        </Text>
      </View>

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
          <ShieldCheck size={18} color="#0284C7" />
          <Text style={styles.sectionTitle}>Security & Quick Sign-In</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Configure biometric FaceID or fingerprint unlock for rapid login
        </Text>

        <View style={styles.biometricRow}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Fingerprint size={16} color="#0284C7" />
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
            trackColor={{ false: '#CBD5E1', true: '#BAE6FD' }}
            thumbColor={isBiometricEnabled ? '#0284C7' : '#F1F5F9'}
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
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 50,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0284C7',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  userContact: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  passportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    shadowColor: '#0284C7',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
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
    color: '#0F172A',
  },
  customerIdPill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customerIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  passportInstructions: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  emptyCompanyBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyCompanyText: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },
  createCompanyBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  createCompanyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  companyRowActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  companyNameActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  companyMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    marginTop: 8,
  },
  biometricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  biometricSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
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
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 30,
  },
});
