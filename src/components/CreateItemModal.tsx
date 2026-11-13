import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import { Palette } from '../theme/colors';
import { businessApi, BusinessItem } from '../services/business';

interface CreateItemModalProps {
  visible: boolean;
  companyId: string;
  onClose: () => void;
  onSuccess: (newItem: BusinessItem) => void;
}

export const CreateItemModal: React.FC<CreateItemModalProps> = ({
  visible,
  companyId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [hsnSacCode, setHsnSacCode] = useState('711319');
  const [price, setPrice] = useState('');
  const [mrp, setMrp] = useState('');
  const [stockCount, setStockCount] = useState('10');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('Jewellery & Bullion');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  const units = ['pcs', 'pair', 'g', 'kg', 'tin', 'box'];
  const categories = [
    'Jewellery & Bullion',
    'Electronics & Tech',
    'Groceries & Mart',
    'Apparel & Fashion',
    'General',
  ];

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter product name.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid selling price.');
      return;
    }

    setLoading(true);
    try {
      const res = await businessApi.createItem({
        companyId,
        name: name.trim(),
        hsnSacCode: hsnSacCode.trim() || undefined,
        price: numPrice,
        mrp: mrp ? parseFloat(mrp) : numPrice,
        stockCount: parseInt(stockCount, 10) || 1,
        unit,
        category,
        description: description.trim(),
        publishedToMarketplace: published,
      });

      Alert.alert('Item Added', 'Product successfully added to catalog!');
      setName('');
      setPrice('');
      setMrp('');
      setDescription('');
      onSuccess(res.item);
      onClose();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Add New Item</Text>
              <Text style={styles.headerSubtitle}>
                Add inventory item & publish to digital storefront
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Product Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Product / Item Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 22K Gold Antique Ring"
                placeholderTextColor={Palette.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Category selection chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {categories.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Selling Price & MRP */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>
                  Sale Price (₹) <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="24500"
                  placeholderTextColor={Palette.textMuted}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>MRP (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="26000"
                  placeholderTextColor={Palette.textMuted}
                  value={mrp}
                  onChangeText={setMrp}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Stock Count & Unit Selection */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Opening Stock</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor={Palette.textMuted}
                  value={stockCount}
                  onChangeText={setStockCount}
                  keyboardType="number-pad"
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>HSN / SAC Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="711319"
                  placeholderTextColor={Palette.textMuted}
                  value={hsnSacCode}
                  onChangeText={setHsnSacCode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Unit chips */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Measurement Unit</Text>
              <View style={styles.unitRow}>
                {units.map((u) => {
                  const isSelected = unit === u;
                  return (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, isSelected && styles.unitChipSelected]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Product Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="BIS hallmark purity, stone weight, warranty details..."
                placeholderTextColor={Palette.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Publish to Marketplace Toggle */}
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Publish to Marketplace Storefront</Text>
                <Text style={styles.toggleSubtitle}>
                  Make this item immediately discoverable to nearby buyers
                </Text>
              </View>
              <Switch
                value={published}
                onValueChange={setPublished}
                trackColor={{ false: Palette.border, true: Palette.mint }}
                thumbColor={Palette.surface}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.disabledBtn]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Palette.surface} />
              ) : (
                <Text style={styles.submitBtnText}>Add Item to Inventory</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '92%',
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
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
    marginBottom: 6,
  },
  required: {
    color: '#E53E3E',
  },
  input: {
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Palette.textPrimary,
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipsScroll: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Palette.lilac,
    borderColor: Palette.lilacDark,
  },
  chipText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Palette.lilacDark,
    fontWeight: '700',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  unitChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Palette.background,
    borderWidth: 1,
    borderColor: Palette.border,
    marginRight: 8,
    marginBottom: 6,
  },
  unitChipSelected: {
    backgroundColor: Palette.mintLight,
    borderColor: Palette.mintDark,
  },
  unitChipText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '500',
  },
  unitChipTextSelected: {
    color: Palette.mintDark,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.background,
    padding: 14,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 2,
    paddingRight: 10,
  },
  submitBtn: {
    backgroundColor: Palette.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Palette.surface,
    fontSize: 15,
    fontWeight: '700',
  },
});
