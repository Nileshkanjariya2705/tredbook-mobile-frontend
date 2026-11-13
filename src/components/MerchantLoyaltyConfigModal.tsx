import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Sliders,
  Coins,
  ShieldCheck,
  Save,
  X,
  Percent,
  Calendar,
  CheckCircle2,
} from 'lucide-react-native';
import { loyaltyService, BusinessLoyaltyConfig } from '../services/loyaltyService';
import { useLanguage } from '../context/LanguageContext';

interface MerchantLoyaltyConfigModalProps {
  visible: boolean;
  companyId: number;
  onClose: () => void;
}

export const MerchantLoyaltyConfigModal: React.FC<MerchantLoyaltyConfigModalProps> = ({
  visible,
  companyId,
  onClose,
}) => {
  const { t } = useLanguage();
  const [config, setConfig] = useState<BusinessLoyaltyConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (visible && companyId) {
      loadConfig();
    }
  }, [visible, companyId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await loyaltyService.getBusinessConfig(companyId);
      setConfig(data);
    } catch (err: any) {
      console.error('Failed to load loyalty config', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      const updated = await loyaltyService.updateBusinessConfig(companyId, config);
      setConfig(updated);
      Alert.alert(t.success, 'Loyalty program settings updated successfully!');
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update settings';
      Alert.alert(t.error, msg);
    } finally {
      setSaving(false);
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
                <Sliders size={20} color="#2563EB" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.headerTitle}>{t.merchantLoyaltySettings}</Text>
                <Text style={styles.headerSubtitle}>{t.loyaltySubtitle}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading || !config ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.loaderText}>{t.loading}</Text>
            </View>
          ) : (
            <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
              {/* Active Toggle Card */}
              <View style={styles.toggleCard}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.toggleTitle}>Enable Store Loyalty Program</Text>
                  <Text style={styles.toggleDesc}>
                    Automatically award points on customer purchase invoices
                  </Text>
                </View>
                <Switch
                  value={config.isActive}
                  onValueChange={(val) => setConfig({ ...config, isActive: val })}
                  trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                  thumbColor={config.isActive ? '#2563EB' : '#F1F5F9'}
                />
              </View>

              {/* Setting 1: Points Accrual */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Points Awarded per ₹100 Spent</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(config.pointsPerHundred)}
                  onChangeText={(val) =>
                    setConfig({ ...config, pointsPerHundred: parseInt(val, 10) || 0 })
                  }
                />
                <Text style={styles.fieldHelp}>Example: 1 point per ₹100 purchase.</Text>
              </View>

              {/* Setting 2: Minimum Invoice Qualifying Threshold */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Minimum Invoice Value (₹)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(config.minInvoiceValue)}
                  onChangeText={(val) =>
                    setConfig({ ...config, minInvoiceValue: parseInt(val, 10) || 0 })
                  }
                />
                <Text style={styles.fieldHelp}>
                  Invoices below this value will not qualify for loyalty accruals or redemptions.
                </Text>
              </View>

              {/* Setting 3: Maximum Invoice Discount Cap (%) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Maximum Bill Discount Cap (%)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(config.maxInvoicePercentCap)}
                  onChangeText={(val) =>
                    setConfig({ ...config, maxInvoicePercentCap: parseInt(val, 10) || 0 })
                  }
                />
                <Text style={styles.fieldHelp}>
                  Protects margin by capping points redemption at this % of total bill (e.g. 20%).
                </Text>
              </View>

              {/* Setting 4: Point Lifespan (Days) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Points Validity Expiry (Days)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(config.expiryDays)}
                  onChangeText={(val) =>
                    setConfig({ ...config, expiryDays: parseInt(val, 10) || 0 })
                  }
                />
                <Text style={styles.fieldHelp}>Unused points expire after this many days.</Text>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.saveBtnText}>{t.save}</Text>
                  </>
                )}
              </TouchableOpacity>
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
    backgroundColor: '#EFF6FF',
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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  fieldHelp: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 10,
    marginBottom: 20,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
