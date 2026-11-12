import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

type NavigationTab = 'home' | 'social' | 'marketplace' | 'business' | 'profile';

const MainAppContent: React.FC = () => {
  const { user, companies, activeCompanyId, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={styles.loadingText}>Initializing TredBook...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const activeCompany = [
    ...companies.owned,
    ...companies.shared,
  ].find((c) => c.id === activeCompanyId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TredBook Super-App</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name} • {user?.customerId}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {activeCompany ? (
            <View style={styles.companyBadge}>
              <Text style={styles.companyBadgeText}>{activeCompany.name}</Text>
            </View>
          ) : (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>Customer</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main Workspace */}
      {activeTab === 'profile' ? (
        <ProfileScreen />
      ) : (
        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Tab 1: Home Dashboard (PRD Section 6.1) */}
          {activeTab === 'home' && (
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🏠</Text>
              <Text style={styles.cardTitle}>Customer Home Dashboard</Text>
              <Text style={styles.cardDesc}>
                Discover nearby verified shops, browse trending categories, track active orders,
                view your Digital Purchase Book, and check your loyalty rewards.
              </Text>
              <View style={styles.metaBox}>
                <Text style={styles.metaTitle}>Customer ID: {user?.customerId}</Text>
                <Text style={styles.metaSub}>ReliabilityScore (CRS): 750 (Strong)</Text>
              </View>
              <View style={styles.tagRow}>
                <Text style={styles.tag}>PRD Section 6.1</Text>
                <Text style={styles.tag}>Purchase Book Vault</Text>
                <Text style={styles.tag}>Order Tracking</Text>
              </View>
            </View>
          )}

          {/* Tab 2: Social Ecosystem (PRD Section 7 & FN-CHAT) */}
          {activeTab === 'social' && (
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>💬</Text>
              <Text style={styles.cardTitle}>Social & Real-Time Communication</Text>
              <Text style={styles.cardDesc}>
                Real-time 1-on-1 & 1,000-member community rooms, interactive invoice payment
                cards, quotation cards, 24h stories with product tags, and broadcast channels.
              </Text>
              <View style={styles.tagRow}>
                <Text style={styles.tag}>FN-CHAT-01 to 18</Text>
                <Text style={styles.tag}>Interactive UPI Cards</Text>
                <Text style={styles.tag}>24h Stories</Text>
                <Text style={styles.tag}>Broadcast Channels</Text>
              </View>
            </View>
          )}

          {/* Tab 3: Marketplace & Storefront (PRD Section 6 & FN-MKT) */}
          {activeTab === 'marketplace' && (
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🏪</Text>
              <Text style={styles.cardTitle}>Marketplace & Digital Storefronts</Text>
              <Text style={styles.cardDesc}>
                Hyper-local geo-spatial discovery (1–25 km radius), merchant public storefronts,
                single-merchant cart checkout, Cash on Delivery, and Pay-at-Store.
              </Text>
              <View style={styles.tagRow}>
                <Text style={styles.tag}>FN-MKT-01 to 20</Text>
                <Text style={styles.tag}>Geo-Radius Filter</Text>
                <Text style={styles.tag}>Single-Store Cart</Text>
                <Text style={styles.tag}>B2B Wholesale</Text>
              </View>
            </View>
          )}

          {/* Tab 4: Business Ecosystem & Accounting (PRD Section 5 & tredbook-web) */}
          {activeTab === 'business' && (
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>📊</Text>
              <Text style={styles.cardTitle}>Business Ecosystem & Accounting</Text>
              <Text style={styles.cardDesc}>
                Full business operating system: Accounting & Billing via tredbook-web, inventory,
                CRM, Unified Business Inbox, and ESC/POS thermal printing bridge.
              </Text>
              <View style={styles.metaBox}>
                <Text style={styles.metaTitle}>
                  {activeCompany ? `Active: ${activeCompany.name}` : 'No Business Selected'}
                </Text>
                <Text style={styles.metaSub}>TrustScore (BTS): 820 (Very Strong)</Text>
              </View>
              <View style={styles.tagRow}>
                <Text style={styles.tag}>FN-WEB-01 to 73</Text>
                <Text style={styles.tag}>SSO Web Bridge</Text>
                <Text style={styles.tag}>Unified Business Inbox</Text>
                <Text style={styles.tag}>Mode 1/2/3 Sync</Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* 5-Item Bottom Navigation Bar (PRD Section 19) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.tabButtonActive]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'social' && styles.tabButtonActive]}
          onPress={() => setActiveTab('social')}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={[styles.tabText, activeTab === 'social' && styles.tabTextActive]}>Social</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'marketplace' && styles.tabButtonActive]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text style={styles.tabIcon}>🏪</Text>
          <Text style={[styles.tabText, activeTab === 'marketplace' && styles.tabTextActive]}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'business' && styles.tabButtonActive]}
          onPress={() => setActiveTab('business')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'business' && styles.tabTextActive]}>Business</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  companyBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 140,
  },
  companyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E3A8A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  metaTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  metaSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabButtonActive: {
    borderTopWidth: 2,
    borderTopColor: '#1E3A8A',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E3A8A',
    fontWeight: '700',
  },
});
