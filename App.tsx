import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type ActiveTab = 'storefront' | 'chat' | 'accounting' | 'vault';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('storefront');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>TredBook Super-App</Text>
          <Text style={styles.headerSubtitle}>Commerce, Community & Accounting</Text>
        </View>
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineBadgeText}>Live</Text>
        </View>
      </View>

      {/* Main Workspace */}
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {activeTab === 'storefront' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🏪</Text>
            <Text style={styles.cardTitle}>Marketplace & Digital Storefront</Text>
            <Text style={styles.cardDesc}>
              Hyper-local business discovery, 1-25km radius filters, merchant catalogs, single-store cart, COD & UPI payments.
            </Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>FN-MKT-01 to 20</Text>
              <Text style={styles.tag}>Geo-Spatial Radius</Text>
              <Text style={styles.tag}>Single Merchant Cart</Text>
            </View>
          </View>
        )}

        {activeTab === 'chat' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>💬</Text>
            <Text style={styles.cardTitle}>Customer Chat & Social Ecosystem</Text>
            <Text style={styles.cardDesc}>
              Real-time 1-on-1 & 1,000-member groups, interactive invoice payment cards, quotation cards, 24h stories, and unified inbox.
            </Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>FN-CHAT-01 to 18</Text>
              <Text style={styles.tag}>Socket.io Gateway</Text>
              <Text style={styles.tag}>UPI Pay Cards</Text>
            </View>
          </View>
        )}

        {activeTab === 'accounting' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>📊</Text>
            <Text style={styles.cardTitle}>Accounting Platform (tredbook-web)</Text>
            <Text style={styles.cardDesc}>
              Enterprise GST accounting, invoices, jewellery tounch/wastage formulas, double-entry ledger, and thermal print bridge.
            </Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>FN-WEB-01 to 73</Text>
              <Text style={styles.tag}>SSO Web Bridge</Text>
              <Text style={styles.tag}>ESC/POS Printing</Text>
            </View>
          </View>
        )}

        {activeTab === 'vault' && (
          <View style={styles.card}>
            <Text style={styles.cardEmoji}>🛡️</Text>
            <Text style={styles.cardTitle}>Digital Purchase Vault & Warranty</Text>
            <Text style={styles.cardDesc}>
              Personal customer vault archiving digital invoices across all merchants, live warranty countdown clock, and paper bill OCR scanner.
            </Text>
            <View style={styles.tagRow}>
              <Text style={styles.tag}>FN-MKT-15</Text>
              <Text style={styles.tag}>FN-MKT-16</Text>
              <Text style={styles.tag}>Digital Warranty Passport</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'storefront' && styles.tabButtonActive]}
          onPress={() => setActiveTab('storefront')}
        >
          <Text style={styles.tabIcon}>🏪</Text>
          <Text style={[styles.tabText, activeTab === 'storefront' && styles.tabTextActive]}>Market</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'chat' && styles.tabButtonActive]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={styles.tabIcon}>💬</Text>
          <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'accounting' && styles.tabButtonActive]}
          onPress={() => setActiveTab('accounting')}
        >
          <Text style={styles.tabIcon}>📊</Text>
          <Text style={[styles.tabText, activeTab === 'accounting' && styles.tabTextActive]}>Books</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'vault' && styles.tabButtonActive]}
          onPress={() => setActiveTab('vault')}
        >
          <Text style={styles.tabIcon}>🛡️</Text>
          <Text style={[styles.tabText, activeTab === 'vault' && styles.tabTextActive]}>Vault</Text>
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
    paddingHorizontal: 12,
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
