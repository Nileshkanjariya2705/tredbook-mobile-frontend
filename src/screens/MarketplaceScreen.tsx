import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  Store,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { Palette, SoftShadow } from '../theme/colors';
import {
  marketplaceApi,
  MarketplaceCategory,
  StorefrontShop,
} from '../services/marketplace';
import { StorefrontScreen } from './StorefrontScreen';

interface MarketplaceScreenProps {
  onNavigateToChat?: (threadId: string) => void;
}

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({
  onNavigateToChat,
}) => {
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shops, setShops] = useState<StorefrontShop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedShop, setSelectedShop] = useState<StorefrontShop | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadShops();
  }, [selectedCategory, selectedRadius]);

  const loadInitialData = async () => {
    try {
      const cats = await marketplaceApi.getCategories();
      setCategories(cats);
    } catch {
      // Fallback
    }
    await loadShops();
  };

  const loadShops = async () => {
    setIsLoading(true);
    try {
      const data = await marketplaceApi.getShops({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        radiusKm: selectedRadius,
        search: searchQuery || undefined,
      });
      setShops(data);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Could Not Load Stores',
        text2: 'Please check your connection and retry.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadShops();
  };

  const handleSearchSubmit = () => {
    loadShops();
  };

  if (selectedShop) {
    return (
      <StorefrontScreen
        shop={selectedShop}
        onBack={() => setSelectedShop(null)}
        onNavigateToChat={onNavigateToChat}
      />
    );
  }

  const radiusOptions = [1, 3, 5, 10, 25];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Marketplace Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Marketplace & Storefronts</Text>
          <Text style={styles.headerSubtitle}>
            Verified local shops, direct billing & conversational trade
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Search size={18} color={Palette.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search shops, jewellery, electronics..."
              placeholderTextColor={Palette.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Geo-Radius Filter Chips */}
        <View style={styles.radiusSection}>
          <View style={styles.radiusHeader}>
            <MapPin size={14} color={Palette.textSecondary} />
            <Text style={styles.radiusLabel}>Radius Filter:</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radiusScroll}>
            {radiusOptions.map((km) => (
              <TouchableOpacity
                key={km}
                style={[
                  styles.radiusChip,
                  selectedRadius === km && styles.radiusChipActive,
                ]}
                onPress={() => setSelectedRadius(km)}
              >
                <Text
                  style={[
                    styles.radiusChipText,
                    selectedRadius === km && styles.radiusChipTextActive,
                  ]}
                >
                  Within {km} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories Bar */}
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
              >
                <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Shops Listing */}
        <View style={styles.shopsSection}>
          <View style={styles.shopsHeaderRow}>
            <Text style={styles.shopsSectionTitle}>
              Verified Stores ({shops.length})
            </Text>
            <View style={styles.bazaarBadge}>
              <Text style={styles.bazaarBadgeText}>📍 Local Bazaar</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loaderBox}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <Text style={styles.loaderText}>Finding nearby merchants...</Text>
            </View>
          ) : shops.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🏪</Text>
              <Text style={styles.emptyTitle}>No Stores Found Nearby</Text>
              <Text style={styles.emptyDesc}>
                Try extending your radius filter or searching for a different keyword.
              </Text>
            </View>
          ) : (
            shops.map((shop) => (
              <TouchableOpacity
                key={shop.id}
                style={styles.shopCard}
                activeOpacity={0.9}
                onPress={() => setSelectedShop(shop)}
              >
                {/* Shop Banner Image */}
                <View style={styles.shopBannerWrapper}>
                  <Image source={{ uri: shop.banner }} style={styles.shopBanner} resizeMode="cover" />
                  <View style={styles.distanceBadge}>
                    <MapPin size={11} color="#FFFFFF" />
                    <Text style={styles.distanceText}>{shop.distanceKm} km</Text>
                  </View>
                  <View style={styles.shopLogoMiniWrapper}>
                    <Image source={{ uri: shop.logo }} style={styles.shopLogoMini} />
                  </View>
                </View>

                {/* Shop Content */}
                <View style={styles.shopCardBody}>
                  <View style={styles.shopHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.nameWithBadge}>
                        <Text style={styles.shopName} numberOfLines={1}>
                          {shop.name}
                        </Text>
                        {shop.isVerified && (
                          <CheckCircle2 size={15} color={Palette.mintDark} />
                        )}
                      </View>
                      <Text style={styles.shopCategory}>{shop.category}</Text>
                    </View>

                    {/* TrustScore Badge */}
                    <View style={styles.trustScorePill}>
                      <ShieldCheck size={12} color={Palette.primaryText} />
                      <Text style={styles.trustScoreText}>BTS {shop.trustScore}</Text>
                    </View>
                  </View>

                  <Text style={styles.shopAddress} numberOfLines={1}>
                    {shop.address}, {shop.city}
                  </Text>

                  {/* Footer Stats */}
                  <View style={styles.shopFooter}>
                    <View style={styles.ratingBox}>
                      <Star size={13} color="#EAB308" fill="#EAB308" />
                      <Text style={styles.ratingText}>{shop.rating}</Text>
                      <Text style={styles.reviewsText}>({shop.reviewsCount} reviews)</Text>
                    </View>

                    <View style={styles.viewStoreBtn}>
                      <Text style={styles.viewStoreText}>Visit Store</Text>
                      <ChevronRight size={14} color={Palette.primaryText} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Palette.textPrimary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    ...SoftShadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  radiusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  radiusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  radiusScroll: {
    gap: 8,
  },
  radiusChip: {
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  radiusChipActive: {
    backgroundColor: Palette.primaryText,
    borderColor: Palette.primaryText,
  },
  radiusChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  radiusChipTextActive: {
    color: '#FFFFFF',
  },
  categorySection: {
    marginBottom: 18,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    ...SoftShadow,
  },
  categoryChipActive: {
    borderColor: Palette.primary,
    backgroundColor: Palette.lilacLight,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.textSecondary,
  },
  categoryTextActive: {
    color: Palette.primaryText,
    fontWeight: '800',
  },
  shopsSection: {
    paddingHorizontal: 20,
  },
  shopsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  shopsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  bazaarBadge: {
    backgroundColor: Palette.lilacLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  bazaarBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.lilacDark,
  },
  loaderBox: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: Palette.textSecondary,
  },
  emptyBox: {
    backgroundColor: Palette.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
    ...SoftShadow,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: Palette.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  shopCard: {
    backgroundColor: Palette.surface,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.border,
    marginBottom: 18,
    ...SoftShadow,
  },
  shopBannerWrapper: {
    width: '100%',
    height: 120,
    backgroundColor: Palette.border,
    position: 'relative',
  },
  shopBanner: {
    width: '100%',
    height: '100%',
  },
  distanceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(18, 18, 20, 0.75)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  shopLogoMiniWrapper: {
    position: 'absolute',
    bottom: -18,
    left: 14,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.surface,
    borderWidth: 2,
    borderColor: Palette.surface,
    overflow: 'hidden',
    ...SoftShadow,
  },
  shopLogoMini: {
    width: '100%',
    height: '100%',
  },
  shopCardBody: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 14,
  },
  shopHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  shopCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginTop: 2,
  },
  trustScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.mintLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trustScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.primaryText,
  },
  shopAddress: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginBottom: 12,
  },
  shopFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: Palette.border,
    paddingTop: 10,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.textPrimary,
  },
  reviewsText: {
    fontSize: 11,
    color: Palette.textSecondary,
  },
  viewStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewStoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: Palette.primaryText,
  },
});
