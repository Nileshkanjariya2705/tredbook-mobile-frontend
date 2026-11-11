import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// 5 Core Navigation Pillars defined in Section 19 of TredBook Master PRD
type NavigationTab = 'home' | 'social' | 'marketplace' | 'business' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TredBook Super-App</Text>
          <Text style={styles.headerSubtitle}>Commerce, Community & Accounting</Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>Live</Text>
          </View>
        </View>
      </View>

      {/* Main Workspace */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Tab 1: Home Dashboard (PRD Section 6.1) */}
        {activeTab === 'home' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🏠</Text>
            <Text style={styles.cardTitle}>Customer Home Dashboard</Text>
            <Text style={styles.cardDesc}>
              Discover nearby verified shops, browse trending categories, track active orders, view your Digital Purchase Book, and check your loyalty rewards.
            </Text>
            <View style={styles.metaBox}>
              <Text style={styles.metaTitle}>Customer ID: TB-C50245</Text>
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
              Real-time 1-on-1 & 1,000-member community rooms, interactive invoice payment cards, quotation cards, 24h stories with product tags, and broadcast channels.
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
              Hyper-local geo-spatial discovery (1–25 km radius), merchant public storefronts, single-merchant cart checkout, Cash on Delivery, and Pay-at-Store.
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
              Full business operating system: Accounting & Billing via tredbook-web, inventory, CRM, Unified Business Inbox, and ESC/POS thermal printing bridge.
            </Text>
            <View style={styles.metaBox}>
              <Text style={styles.metaTitle}>Business ID: TB-B10245</Text>
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

        {/* Tab 5: Profile & Identity (PRD Section 4 & 11) */}
        {activeTab === 'profile' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>👤</Text>
            <Text style={styles.cardTitle}>Profile & Trust Management</Text>
            <Text style={styles.cardDesc}>
              Unified TredBook account management. Switch between Customer and Business contexts, manage QR code passports, view TrustProfile history, and dispute records.
            </Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>Unified Account</Text>
              <Text style={styles.tag}>TrustProfile (BTS/CRS)</Text>
              <Text style={styles.tag}>KYC Verification</Text>
            </View>
          </View>
        )}
      </ScrollView>

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
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  contentContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  metaBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaSub: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#F1F5F9',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
