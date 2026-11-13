import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar as StatusBarNative,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Home, MessageSquare, Store, BarChart3, User, Languages } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { SocialScreen } from './src/screens/SocialScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { BusinessScreen } from './src/screens/BusinessScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BiometricPromptModal } from './src/components/BiometricPromptModal';
import { Palette, SoftShadow } from './src/theme/colors';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Palette.primary,
    secondary: Palette.mint,
    background: Palette.background,
    surface: Palette.surface,
  },
};

type NavigationTab = 'home' | 'social' | 'marketplace' | 'business' | 'profile';

const MainAppContent: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const {
    user,
    companies,
    activeCompanyId,
    isAuthenticated,
    isLoading,
    isBiometricSupported,
    isBiometricEnabled,
    hasDismissedBiometricPrompt,
    dismissBiometricPrompt,
    enableBiometricsPostLogin,
  } = useAuth();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Palette.primary} />
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

  const topInset = Math.max(
    insets.top,
    Platform.OS === 'android' ? (StatusBarNative.currentHeight || 0) : 0,
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* Top Header Bar with Safe Area Notch Margin */}
      <View style={[styles.header, { paddingTop: topInset + 8 }]}>
        <View>
          <Text style={styles.headerTitle}>TredBook Super-App</Text>
          <Text style={styles.headerSubtitle}>
            {user?.name} • {user?.customerId}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          {/* Bilingual Language Switcher Pill */}
          <TouchableOpacity
            style={styles.langPill}
            onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            activeOpacity={0.8}
          >
            <Languages size={14} color="#7C3AED" />
            <Text style={styles.langPillText}>{language === 'en' ? 'हिन्दी' : 'English'}</Text>
          </TouchableOpacity>

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

      {/* Post-Login Biometrics Prompt Modal */}
      <BiometricPromptModal
        visible={isBiometricSupported && !isBiometricEnabled && !hasDismissedBiometricPrompt}
        onEnable={enableBiometricsPostLogin}
        onDismiss={dismissBiometricPrompt}
      />

      {/* Main Workspace */}
      {activeTab === 'profile' ? (
        <ProfileScreen />
      ) : activeTab === 'social' ? (
        <SocialScreen />
      ) : activeTab === 'marketplace' ? (
        <MarketplaceScreen onNavigateToChat={() => setActiveTab('social')} />
      ) : activeTab === 'business' ? (
        <BusinessScreen onNavigateToChat={() => setActiveTab('social')} />
      ) : (
        <HomeScreen onNavigateTab={(tab) => setActiveTab(tab)} />
      )}

      {/* 5-Item Bottom Navigation Bar (PRD Section 19 & Section 18) */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'home' && styles.tabButtonActive]}
          onPress={() => setActiveTab('home')}
        >
          <Home size={20} color={activeTab === 'home' ? Palette.primary : Palette.textSecondary} strokeWidth={activeTab === 'home' ? 2.5 : 1.8} />
          <Text style={[styles.tabText, activeTab === 'home' && styles.tabTextActive]}>{t.tabHome}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'social' && styles.tabButtonActive]}
          onPress={() => setActiveTab('social')}
        >
          <MessageSquare size={20} color={activeTab === 'social' ? Palette.primary : Palette.textSecondary} strokeWidth={activeTab === 'social' ? 2.5 : 1.8} />
          <Text style={[styles.tabText, activeTab === 'social' && styles.tabTextActive]}>{t.tabSocial}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'marketplace' && styles.tabButtonActive]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Store size={20} color={activeTab === 'marketplace' ? Palette.primary : Palette.textSecondary} strokeWidth={activeTab === 'marketplace' ? 2.5 : 1.8} />
          <Text style={[styles.tabText, activeTab === 'marketplace' && styles.tabTextActive]}>{t.tabMarket}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'business' && styles.tabButtonActive]}
          onPress={() => setActiveTab('business')}
        >
          <BarChart3 size={20} color={activeTab === 'business' ? Palette.primary : Palette.textSecondary} strokeWidth={activeTab === 'business' ? 2.5 : 1.8} />
          <Text style={[styles.tabText, activeTab === 'business' && styles.tabTextActive]}>{t.tabBusiness}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'profile' && styles.tabButtonActive]}
          onPress={() => setActiveTab('profile')}
        >
          <User size={20} color={activeTab === 'profile' ? Palette.primary : Palette.textSecondary} strokeWidth={activeTab === 'profile' ? 2.5 : 1.8} />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>{t.tabProfile}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <LanguageProvider>
          <AuthProvider>
            <MainAppContent />
            <Toast />
          </AuthProvider>
        </LanguageProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Palette.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  langPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  onlineBadge: {
    backgroundColor: Palette.mint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  onlineBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.mintDark,
  },
  companyBadge: {
    backgroundColor: Palette.lilac,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 140,
  },
  companyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: Palette.background,
  },
  card: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow.card,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  metaBox: {
    backgroundColor: Palette.holoPink,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  metaTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textPrimary,
  },
  metaSub: {
    fontSize: 12,
    color: Palette.holoPinkDark,
    marginTop: 3,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Palette.lilacLight,
    color: Palette.lilacDark,
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.lilac,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Palette.surface,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
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
    borderTopColor: Palette.primary,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabText: {
    fontSize: 10,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  tabTextActive: {
    color: Palette.primary,
    fontWeight: '700',
  },
});
